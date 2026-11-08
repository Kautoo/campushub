/**
 * Postgres pool singleton (Render Postgres / vanilla Postgres).
 * Replaces the Supabase client factories: plain parameterized SQL over `pg`.
 */
import pg from "pg";

declare global {
  var __campushubPool: pg.Pool | undefined;
}

function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/** Lazily-created singleton pool. Throws when DATABASE_URL is absent. */
export function getPool(): pg.Pool {
  if (!globalThis.__campushubPool) {
    globalThis.__campushubPool = createPool();
  }
  return globalThis.__campushubPool;
}

export type QueryRow = Record<string, unknown>;

/**
 * Parameterized query on the pool. `pg` returns snake_case rows; timestamptz
 * columns are serialized to ISO strings here so row shapes match the
 * supabase-js contract the pages were built against.
 */
export async function query<T extends QueryRow = QueryRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query(text, params);
  return (res.rows as Record<string, unknown>[]).map(serializeDates) as T[];
}

function serializeDates(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

/**
 * Run `fn` inside a transaction on a dedicated client.
 * COMMits on success, ROLLs back on throw, always releases the client.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    try {
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  } finally {
    client.release();
  }
}

export function hasDatabaseEnv(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
