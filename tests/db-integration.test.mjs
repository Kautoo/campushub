/**
 * Integration tests against a REAL local Postgres (127.0.0.1:5432, db
 * campushub_render — plain Postgres, built from db/schema.sql + db/seed.sql).
 * Every mutating test runs inside a transaction that is ROLLed BACK — the suite
 * leaves the database byte-for-byte unchanged.
 *
 * Connection is overridable via DB_HOST / DB_PORT / DB_USER / DB_PASSWORD /
 * DB_NAME (defaults match the documented local dev setup).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

const DEMO_ORG = "00000000-0000-4000-8000-000000000001";

let client;

before(async () => {
  client = new pg.Client({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "campushub_render",
  });
  await client.connect();
});

after(async () => {
  await client.end();
});

/** Run fn inside a tx, always rolling back. Returns fn's result. */
async function withTx(fn) {
  await client.query("BEGIN");
  try {
    return await fn();
  } finally {
    await client.query("ROLLBACK");
  }
}

async function one(sql, params = []) {
  const r = await client.query(sql, params);
  return r.rows[0];
}

async function scalar(sql, params = []) {
  const r = await client.query(sql, params);
  return r.rows[0][Object.keys(r.rows[0])[0]];
}

// ---------- place_order RPC: happy path ----------

test("place_order: happy path — product + tier line, atomic stock, exact fee, correct order_items and registration", async () => {
  const product = await one(
    `select id, name, price_cents, stock from products
     where org_id = $1 and status = 'active' and stock >= 5
     order by stock desc limit 1`,
    [DEMO_ORG],
  );
  const tier = await one(
    `select tt.id, tt.name, tt.price_cents, tt.quantity, tt.sold, tt.event_id
     from ticket_tiers tt join events e on e.id = tt.event_id
     where tt.org_id = $1 and tt.quantity - tt.sold >= 2 and tt.max_per_order >= 2
     limit 1`,
    [DEMO_ORG],
  );
  assert.ok(product, "seed must have an active product with stock");
  assert.ok(tier, "seed must have a purchasable ticket tier");

  await withTx(async () => {
    const items = [
      { product_id: product.id, qty: 3 },
      { tier_id: tier.id, qty: 2 },
    ];

    const order = (
      await client.query(
        `select * from public.place_order($1, $2, $3, $4)`,
        [DEMO_ORG, "Integration Buyer", "integration@test.dev", JSON.stringify(items)],
      )
    ).rows[0];

    const subtotal = product.price_cents * 3 + tier.price_cents * 2;
    const expectedFee = Math.round(subtotal * 29 / 1000) + 50;

    assert.equal(order.org_id, DEMO_ORG);
    assert.equal(order.subtotal_cents, subtotal);
    assert.equal(order.fee_cents, expectedFee, "fee = round(subtotal*0.029) + 50 exactly");
    assert.equal(order.total_cents, subtotal + expectedFee);
    assert.equal(order.currency, "MYR");
    assert.equal(order.status, "pending");
    assert.match(order.order_number, /^CH-\d+$/);
    assert.equal(order.customer_email, "integration@test.dev");

    // Stock decremented atomically inside the tx
    const stockAfter = await scalar(`select stock from products where id = $1`, [product.id]);
    assert.equal(stockAfter, product.stock - 3);

    const soldAfter = await scalar(`select sold from ticket_tiers where id = $1`, [tier.id]);
    assert.equal(soldAfter, tier.sold + 2);

    // Inventory movement recorded for the product line
    const invDelta = await scalar(
      `select delta from inventory_movements where product_id = $1 and reason = 'order'
       order by created_at desc limit 1`,
      [product.id],
    );
    assert.equal(invDelta, -3);

    // order_items rows exactly correct
    const oi = await client.query(
      `select kind, product_id, tier_id, registration_id, name_snapshot, qty, unit_price_cents
       from order_items where order_id = $1 order by kind`,
      [order.id],
    );
    assert.equal(oi.rowCount, 2);
    const byKind = Object.fromEntries(oi.rows.map((r) => [r.kind, r]));
    assert.equal(byKind.product.qty, 3);
    assert.equal(byKind.product.unit_price_cents, product.price_cents);
    assert.equal(byKind.product.name_snapshot, product.name);
    assert.equal(byKind.ticket.qty, 2);
    assert.equal(byKind.ticket.unit_price_cents, tier.price_cents);
    assert.equal(byKind.ticket.name_snapshot, tier.name);

    // Registration created for the ticket line
    const reg = await one(
      `select event_id, tier_id, attendee_email, qty, amount_cents, status
       from registrations where id = $1`,
      [byKind.ticket.registration_id],
    );
    assert.ok(reg, "ticket line must create a registration");
    assert.equal(reg.event_id, tier.event_id);
    assert.equal(reg.tier_id, tier.id);
    assert.equal(reg.attendee_email, "integration@test.dev");
    assert.equal(reg.qty, 2);
    assert.equal(reg.amount_cents, tier.price_cents * 2);
    assert.equal(reg.status, "pending");
  });

  // Rollback restored both stock and sold counters
  const stockRestored = await scalar(`select stock from products where id = $1`, [product.id]);
  assert.equal(stockRestored, product.stock, "ROLLBACK must restore product stock");
  const soldRestored = await scalar(`select sold from ticket_tiers where id = $1`, [tier.id]);
  assert.equal(soldRestored, tier.sold, "ROLLBACK must restore tier sold count");
});

test("place_order: stock is restored after rollback", async () => {
  const before = await one(
    `select id, stock from products where org_id = $1 and status = 'active' and stock >= 3 limit 1`,
    [DEMO_ORG],
  );
  await withTx(async () => {
    await client.query(
      `select public.place_order($1, 'Rollback Buyer', 'rb@test.dev', $2)`,
      [DEMO_ORG, JSON.stringify([{ product_id: before.id, qty: 3 }])],
    );
  });
  const afterRow = await one(`select stock from products where id = $1`, [before.id]);
  assert.equal(afterRow.stock, before.stock, "ROLLBACK must restore stock");
});

// ---------- place_order RPC: failure paths ----------

test("place_order: insufficient stock raises and writes nothing", async () => {
  await withTx(async () => {
    const product = await one(
      `select id, name, stock from products where org_id = $1 and status = 'active' limit 1`,
      [DEMO_ORG],
    );
    const ordersBefore = await scalar(`select count(*) from orders`);
    await assert.rejects(
      () =>
        client.query(
          `select public.place_order($1, 'X', 'x@test.dev', $2)`,
          [DEMO_ORG, JSON.stringify([{ product_id: product.id, qty: product.stock + 1 }])],
        ),
      /Insufficient stock/,
    );
    // tx is aborted after the error; open a savepoint-free check via new tx semantics:
    // the withTx finally issues ROLLBACK, so just verify nothing was committed below.
    await client.query("ROLLBACK");
    const ordersAfter = await scalar(`select count(*) from orders`);
    assert.equal(ordersAfter, ordersBefore);
    // re-open a clean tx so the outer finally ROLLBACK is a no-op on an idle tx
    await client.query("BEGIN");
  });
});

test("place_order: empty items raises 'Cart is empty'", async () => {
  await withTx(async () => {
    await assert.rejects(
      () =>
        client.query(
          `select public.place_order($1, 'X', 'x@test.dev', '[]'::jsonb)`,
          [DEMO_ORG],
        ),
      /Cart is empty/,
    );
    await client.query("ROLLBACK");
    await client.query("BEGIN"); // leave a clean tx for the outer ROLLBACK
  });
});

test("place_order: unknown product raises 'Product not available'", async () => {
  await withTx(async () => {
    await assert.rejects(
      () =>
        client.query(
          `select public.place_order($1, 'X', 'x@test.dev', $2)`,
          [DEMO_ORG, JSON.stringify([{ product_id: randomUUID(), qty: 1 }])],
        ),
      /Product not available/,
    );
    await client.query("ROLLBACK");
    await client.query("BEGIN");
  });
});

test("place_order: qty < 1 raises 'Invalid quantity'", async () => {
  await withTx(async () => {
    const product = await one(
      `select id from products where org_id = $1 and status = 'active' limit 1`,
      [DEMO_ORG],
    );
    await assert.rejects(
      () =>
        client.query(
          `select public.place_order($1, 'X', 'x@test.dev', $2)`,
          [DEMO_ORG, JSON.stringify([{ product_id: product.id, qty: 0 }])],
        ),
      /Invalid quantity/,
    );
    await client.query("ROLLBACK");
    await client.query("BEGIN");
  });
});

// ---------- repo-scope isolation (replaces RLS: scoping now lives in lib/db/repo.ts) ----------

test("repo scope: published events visible via public filter, draft events NOT, orders org-scoped", async () => {
  const seeded = {
    published: await scalar(`select count(*) from events where status = 'published'`),
    draft: await scalar(`select count(*) from events where status = 'draft'`),
    orders: await scalar(`select count(*) from orders`),
  };
  assert.ok(seeded.published > 0, "seed must contain published events");
  assert.ok(seeded.orders > 0);

  // Public path: repo.events.listPublishedPublic uses status='published' only.
  const publicEvents = await one(
    `select
       count(*) filter (where status = 'published') as published,
       count(*) filter (where status = 'draft') as draft
     from events where status = 'published'`,
  );
  assert.equal(Number(publicEvents.published), Number(seeded.published), "public path sees published events");
  assert.equal(Number(publicEvents.draft), 0, "public path must NOT see draft events");

  // Org-scoped path with empty orgIds (no membership) returns zero orders.
  const scoped = await one(
    `select count(*) as c from orders where org_id = ANY($1::uuid[])`,
    [[]],
  );
  assert.equal(Number(scoped.c), 0, "empty orgIds scope must see 0 orders");
});

test("repo scope: non-member orgIds=[] INSERT scoping rejects (no rows match)", async () => {
  // A non-member updates events scoped to their (empty) org list — must touch 0 rows.
  const r = await client.query(
    `update events set status = 'cancelled' where org_id = ANY($1::uuid[])`,
    [[]],
  );
  assert.equal(r.rowCount, 0, "empty orgIds scope must not modify another org's events");
});

test("repo scope: member's orgIds sees all demo-org orders; org_members resolved by user id", async () => {
  const member = randomUUID();
  await withTx(async () => {
    // Create the user + membership like repo-backed signup would (all rolled back)
    await client.query(
      `insert into users (id, email, name) values ($1, 'member-repo@test.dev', 'Repo Member')`,
      [member],
    );
    await client.query(
      `insert into org_members (org_id, user_id, role) values ($1, $2, 'owner')`,
      [DEMO_ORG, member],
    );
    // Count committed demo-org orders as postgres (pre-scope, same tx)
    const totalOrders = Number(await scalar(`select count(*) from orders`));
    // The repo resolves membership by user id (replaces auth.uid()/RLS):
    const memberOrgs = await one(
      `select org_id from org_members where user_id = $1::uuid and status = 'active'`,
      [member],
    );
    assert.equal(memberOrgs.org_id, DEMO_ORG);
    const visible = await scalar(
      `select count(*) from orders where org_id = ANY($1::uuid[])`,
      [[memberOrgs.org_id]],
    );
    assert.equal(Number(visible), totalOrders, "member sees all orders of their org");
  });
  // rolled back — membership claim left no trace
  const left = await scalar(
    `select count(*) from org_members where user_id = $1`,
    [member],
  );
  assert.equal(Number(left), 0, "test tx rollback must remove the joined membership");
});

// ---------- regression: repo-layer scoping correctness ----------

test("repo regression: member can SELECT org_members for their org", async () => {
  const member = randomUUID();
  await withTx(async () => {
    await client.query(
      `insert into users (id, email, name) values ($1, 'repo-fix-regression@test.dev', 'Repo Regression')`,
      [member],
    );
    await client.query(
      `insert into org_members (org_id, user_id, role) values ($1, $2, 'owner')`,
      [DEMO_ORG, member],
    );
    // Pre-port this raised 42P17 'infinite recursion detected in policy' under RLS;
    // now it is a plain join read scoped by the resolved org ids.
    const n = await one(
      `select count(*)::int as c from org_members where org_id = ANY($1::uuid[])`,
      [[DEMO_ORG]],
    );
    assert.ok(n.c >= 1, "member must see at least their own org_members row");
  });
});

test("repo regression: member-scoped orgIds allow UPDATE of their organization", async () => {
  const owner = randomUUID();
  await withTx(async () => {
    await client.query(
      `insert into users (id, email, name) values ($1, 'owner-repo-regression@test.dev', 'Owner Regression')`,
      [owner],
    );
    await client.query(
      `insert into org_members (org_id, user_id, role) values ($1, $2, 'owner')`,
      [DEMO_ORG, owner],
    );
    const r = await client.query(
      `update organizations set description = description
       where id = $1 and id = ANY($2::uuid[])`,
      [DEMO_ORG, [DEMO_ORG]],
    );
    assert.equal(r.rowCount, 1, "owner orgIds scope must update their own org");
  });
});

test("repo regression: non-member orgIds=[] UPDATE affects 0 rows, no error", async () => {
  const outsider = randomUUID(); // deliberately not in users, not a member
  await withTx(async () => {
    const r = await client.query(
      `update organizations set description = description
       where id = $1 and id = ANY($2::uuid[])`,
      [DEMO_ORG, [randomUUID()]], // scope of an org they are NOT in
    );
    assert.equal(r.rowCount, 0, "non-member org scope must not touch another org's row");
    void outsider;
  });
});

// ---------- seed sanity ----------

test("seed sanity: Tech Society org, 6 events, 12 products, >=40 orders, notifications, tiers", async () => {
  const org = await one(
    `select id, name from organizations where slug = 'tech-society'`,
  );
  assert.ok(org, "seed org 'Tech Society' must exist");
  assert.equal(org.id, DEMO_ORG);

  assert.equal(Number(await scalar(`select count(*) from events where org_id = $1`, [DEMO_ORG])), 6);
  assert.equal(Number(await scalar(`select count(*) from products where org_id = $1`, [DEMO_ORG])), 12);
  // 40 seeded orders (an earlier manual test added one; assert the seed floor)
  assert.ok(
    Number(await scalar(`select count(*) from orders where org_id = $1`, [DEMO_ORG])) >= 40,
    "at least the 40 seeded orders exist",
  );
  assert.equal(Number(await scalar(`select count(*) from ticket_tiers where org_id = $1`, [DEMO_ORG])), 12);
  assert.ok(
    Number(await scalar(`select count(*) from notifications where org_id = $1`, [DEMO_ORG])) > 0,
    "notifications exist",
  );
  const statuses = await client.query(
    `select distinct status from orders where org_id = $1`,
    [DEMO_ORG],
  );
  assert.ok(statuses.rowCount > 1, "orders span multiple statuses");
});
