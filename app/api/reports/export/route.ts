import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerSafe, getSupabaseAdminSafe } from "@/lib/supabase/safe";

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
 * Generate a CSV report for the signed-in organizer's first org, upload it to
 * the 'report-exports' storage bucket (service role), sign a 24h URL, and
 * record the export in the reports table.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdminSafe();
  if (!admin) {
    return NextResponse.json({ error: "service_role_missing" }, { status: 503 });
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

  // First org for this user (RLS-scoped read).
  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) {
    return NextResponse.json({ error: "no_organization" }, { status: 400 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `${orgId}/${type}-${timestamp}.csv`;

  let headers: string[];
  let rows: CsvCell[][];

  if (type === "orders") {
    const { data, error } = await admin
      .from("orders")
      .select(
        "order_number, customer_name, customer_email, status, subtotal_cents, fee_cents, total_cents, currency, created_at",
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
    rows = (data ?? []).map((o) => [
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
    const { data, error } = await admin
      .from("transactions")
      .select(
        "provider, provider_ref, type, amount_cents, currency, status, verified, created_at",
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
    rows = (data ?? []).map((t) => [
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
    const { data, error } = await admin
      .from("registrations")
      .select("attendee_name, attendee_email, qty, amount_cents, status, created_at, events(title)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    headers = [
      "attendee_name",
      "attendee_email",
      "event",
      "qty",
      "amount_cents",
      "status",
      "created_at",
    ];
    rows = (data ?? []).map((r) => {
      // Supabase embeds the one-to-many typed shape as array in generated types.
      const raw: unknown = r.events;
      const event = Array.isArray(raw)
        ? (raw[0] as { title: string } | undefined)
        : (raw as { title: string } | null | undefined);
      return [
        r.attendee_name,
        r.attendee_email,
        event?.title ?? null,
        r.qty,
        r.amount_cents,
        r.status,
        r.created_at,
      ];
    });
  }

  const csv = toCsv(headers, rows);

  // Storage may be unavailable locally (bucket not created) — report honestly.
  const { error: uploadError } = await admin.storage
    .from("report-exports")
    .upload(path, csv, {
      contentType: "text/csv",
      upsert: true,
    });

  if (uploadError) {
    // Record the failure honestly; never a fake ready row.
    await admin.from("reports").insert({
      org_id: orgId,
      type,
      params: { requested_by: user.id },
      file_url: null,
      status: "failed",
    });
    return NextResponse.json(
      { error: "storage_unavailable" },
      { status: 503 },
    );
  }

  const { data: signed, error: signError } = await admin.storage
    .from("report-exports")
    .createSignedUrl(path, 24 * 60 * 60);

  if (signError || !signed) {
    await admin.from("reports").insert({
      org_id: orgId,
      type,
      params: { requested_by: user.id },
      file_url: null,
      status: "failed",
    });
    return NextResponse.json(
      { error: "storage_unavailable" },
      { status: 503 },
    );
  }

  const { error: insertError } = await admin.from("reports").insert({
    org_id: orgId,
    type,
    params: { requested_by: user.id },
    file_url: path,
    status: "ready",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl, path }, { status: 201 });
}
