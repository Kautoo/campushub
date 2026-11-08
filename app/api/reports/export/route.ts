import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, transactions, registrations, reports } from "@/lib/db/repo";
import { putFile, signedUrl } from "@/lib/files";

const exportSchema = z.object({
  type: z.enum(["orders", "transactions", "registrations"]),
});

type CsvCell = string | number | boolean | null;

/** RFC-4180 CSV escaping, no external libs. */
function csvEscape(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\r\n");
}

/**
 * Generate a CSV report for the signed-in organizer's first org, store it in
 * the files table (DB-backed file store), build a 24h token-signed download
 * URL, and record the export in the reports table.
 */
export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orgId = session.orgIds[0];
  if (!orgId) {
    return NextResponse.json({ error: "no_organization" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = exportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const type = parsed.data.type;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const name = `${type}-${timestamp}.csv`;

  let headers: string[];
  let rows: CsvCell[][];

  if (type === "orders") {
    const data = await orders.listSimple([orgId]);
    headers = [
      "order_number",
      "customer_name",
      "customer_email",
      "status",
      "subtotal_cents",
      "fee_cents",
      "total_cents",
      "currency",
      "created_at",
    ];
    rows = data
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((o) => [
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.status,
        o.subtotal_cents,
        o.fee_cents,
        o.total_cents,
        o.currency,
        o.created_at,
      ]);
  } else if (type === "transactions") {
    const data = await transactions.list([orgId], 10000);
    headers = [
      "provider",
      "provider_ref",
      "type",
      "amount_cents",
      "currency",
      "status",
      "verified",
      "created_at",
    ];
    rows = data.map((t) => [
      t.provider,
      t.provider_ref,
      t.type,
      t.amount_cents,
      t.currency,
      t.status,
      t.verified,
      t.created_at,
    ]);
  } else {
    const data = await registrations.listWithJoins([orgId], 10000);
    headers = [
      "attendee_name",
      "attendee_email",
      "event",
      "qty",
      "amount_cents",
      "status",
      "created_at",
    ];
    rows = data.map((r) => [
      r.attendee_name,
      r.attendee_email,
      r.event_title ?? null,
      r.qty,
      r.amount_cents,
      r.status,
      r.created_at,
    ]);
  }

  const csv = toCsv(headers, rows);

  // Store the CSV in the files table; on failure report honestly (never a
  // fake ready row).
  let fileId: string | null = null;
  try {
    fileId = await putFile({
      orgId,
      bucket: "report-exports",
      name,
      mime: "text/csv",
      bytes: Buffer.from(csv, "utf8"),
      createdBy: session.user.id,
    });
  } catch (err) {
    console.error("file store insert failed", err);
  }

  if (!fileId) {
    // Record the failure honestly; never a fake ready row.
    await reports.insert({
      org_id: orgId,
      type,
      params: { requested_by: session.user.id },
      file_url: null,
      status: "failed",
    });
    return NextResponse.json(
      { error: "storage_unavailable" },
      { status: 503 },
    );
  }

  const url = signedUrl(fileId);

  const inserted = await reports.insert({
    org_id: orgId,
    type,
    params: { requested_by: session.user.id },
    file_url: url,
    status: "ready",
  });

  if (!inserted) {
    return NextResponse.json({ error: "report_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ url, path: name }, { status: 201 });
}
