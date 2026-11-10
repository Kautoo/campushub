import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, transactions, registrations, reports } from "@/lib/db/repo";
import { putFile, signedUrl } from "@/lib/files";
import { formatMoney } from "@/lib/money";

const exportSchema = z.object({
  type: z.enum(["orders", "transactions", "registrations"]),
});

type CsvCell = string | number | boolean | null | undefined;

/** RFC-4180 CSV cell escaping with formula injection (DDE) neutralization. */
function csvEscape(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Formats ISO timestamp to human-friendly YYYY-MM-DD HH:mm:ss. */
function formatHumanDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

/** Builds CSV text with UTF-8 BOM so Microsoft Excel & Google Sheets render cleanly. */
function toCsv(headers: string[], rows: CsvCell[][]): string {
  const BOM = "\uFEFF";
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return BOM + lines.join("\r\n");
}

/**
 * Generates an executive-formatted CSV audit export for the organizer's active org.
 * Formats monetary amounts, human-readable dates, clean status labels, and UTF-8 BOM.
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
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const type = parsed.data.type;

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, "-");
  const name = `CampusHub-${type}-${timestamp}.csv`;

  let headers: string[];
  let rows: CsvCell[][];

  if (type === "orders") {
    const data = await orders.listSimple([orgId]);
    headers = [
      "Order Number",
      "Customer / Student Name",
      "Customer Email",
      "Payment Gateway",
      "Fulfillment Status",
      "Subtotal Formatted",
      "Subtotal Cents",
      "Platform Fee Formatted",
      "Platform Fee Cents",
      "Total Settled Formatted",
      "Total Settled Cents",
      "Currency",
      "Created At (UTC)",
      "Local Date",
    ];
    rows = data
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((o) => {
        const ccy = o.currency || "MYR";
        return [
          o.order_number,
          o.customer_name ?? "Campus Buyer",
          o.customer_email,
          "PayPal Orders v2",
          o.status.toUpperCase(),
          formatMoney(o.subtotal_cents, ccy),
          o.subtotal_cents,
          formatMoney(o.fee_cents, ccy),
          o.fee_cents,
          formatMoney(o.total_cents, ccy),
          o.total_cents,
          ccy,
          formatHumanDate(o.created_at),
          new Date(o.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        ];
      });
  } else if (type === "transactions") {
    const data = await transactions.list([orgId], 10000);
    headers = [
      "Transaction ID",
      "Provider / Gateway",
      "PayPal / Gateway Reference",
      "Ledger Type",
      "Settlement Amount Formatted",
      "Raw Cents",
      "Currency",
      "Settlement Status",
      "Audit Verified",
      "Recorded Timestamp (UTC)",
      "Local Date",
    ];
    rows = data.map((t) => {
      const ccy = t.currency || "MYR";
      return [
        t.id,
        t.provider === "paypal" ? "PayPal Orders v2" : t.provider,
        t.provider_ref ?? "—",
        t.type.toUpperCase(),
        formatMoney(t.amount_cents, ccy),
        t.amount_cents,
        ccy,
        t.status.toUpperCase(),
        t.verified ? "VERIFIED (TRUE)" : "UNVERIFIED",
        formatHumanDate(t.created_at),
        new Date(t.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      ];
    });
  } else {
    const data = await registrations.listWithJoins([orgId], 10000);
    headers = [
      "Attendee Name",
      "Attendee Email",
      "Campus Event Title",
      "Pass Tier",
      "Pass Quantity",
      "Fee Settled Formatted",
      "Fee Cents",
      "Gate Check-In Status",
      "Payment Reference",
      "Registered At (UTC)",
      "Local Date",
    ];
    rows = data.map((r) => [
      r.attendee_name,
      r.attendee_email,
      r.event_title ?? "Campus Event",
      r.tier_name ?? "General Admission",
      r.qty,
      r.amount_cents === 0 ? "Free Pass" : formatMoney(r.amount_cents, "MYR"),
      r.amount_cents,
      r.status.toUpperCase(),
      r.paypal_order_id ?? "—",
      formatHumanDate(r.created_at),
      new Date(r.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    ]);
  }

  const csv = toCsv(headers, rows);

  let fileId: string | null = null;
  try {
    fileId = await putFile({
      orgId,
      bucket: "reports",
      name,
      mime: "text/csv; charset=utf-8",
      bytes: Buffer.from(csv, "utf-8"),
      createdBy: session.user.id,
    });
  } catch (err) {
    console.error("file store insert failed", err);
  }

  if (!fileId) {
    return NextResponse.json({ error: "file_store_failed" }, { status: 500 });
  }

  const url = signedUrl(fileId);

  const inserted = await reports.insert({
    org_id: orgId,
    type,
    params: {},
    file_url: url,
    status: "ready",
  });

  if (!inserted) {
    return NextResponse.json({ error: "report_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ url, path: name }, { status: 201 });
}
