import { redirect } from "next/navigation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import {
  RegistrationsTable,
  type RegistrationRow,
} from "@/components/workspaces/registrations-table";

export const metadata = { title: "Registrations — CampusHub 2.0" };

type JoinedRegistration = RegistrationRow & {
  events: { title: string } | null;
  ticket_tiers: { name: string } | null;
};

export default async function RegistrationsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="registrations" />;

  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("registrations")
      .select("*, events(title), ticket_tiers(name)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
  if (!user) redirect("/login");

  const joined = (data ?? []) as unknown as JoinedRegistration[];

  const rows: RegistrationRow[] = joined.map((r) => ({
    id: r.id,
    attendee_name: r.attendee_name,
    attendee_email: r.attendee_email,
    event: r.events?.title ?? "—",
    tier: r.ticket_tiers?.name ?? "—",
    qty: r.qty,
    amount_cents: r.amount_cents,
    status: r.status,
    checkin_at: r.checkin_at,
    created_at: r.created_at,
  }));

  const total = rows.length;
  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  const checkedIn = rows.filter((r) => r.status === "checked_in").length;
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="how_to_reg"
        title="Registrations"
        subtitle="Attendees, tickets, and check-in"
      />
      <StatStrip
        items={[
          { label: "Total registrations", value: total, icon: "group", format: "number" },
          { label: "Confirmed", value: confirmed, icon: "check_circle", format: "number", tone: "success" },
          { label: "Checked in", value: checkedIn, icon: "how_to_reg", format: "number" },
          { label: "Pending", value: pending, icon: "hourglass_top", format: "number", tone: "neutral" },
        ]}
      />
      <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
        <RegistrationsTable rows={rows} />
      </div>
    </div>
  );
}
