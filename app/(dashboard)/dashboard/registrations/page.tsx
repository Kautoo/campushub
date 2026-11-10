import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import {
  RegistrationsTable,
  type RegistrationRow,
} from "@/components/workspaces/registrations-table";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { registrations } from "@/lib/db/repo";

export const metadata = { title: "Registrations — CampusHub" };

export default async function RegistrationsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="registrations" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const joined = await registrations.listWithJoins([session.activeOrgId], 500);

  const rows: RegistrationRow[] = joined.map((r) => ({
    id: r.id,
    attendee_name: r.attendee_name,
    attendee_email: r.attendee_email,
    event: r.event_title ?? "—",
    tier: r.tier_name ?? "—",
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
  const checkInRate =
    total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="how_to_reg"
        eyebrow="Attendee Roster & Gate Operations"
        title="Registration & Check-In Management"
        subtitle="Monitor real-time attendee flow, ticket tier allocations, manual gate check-ins, and student fee settlement across active campus society events."
      />
      <StatStrip
        items={[
          {
            label: "Total Registrations",
            value: total,
            icon: "group",
            format: "number",
            tone: "primary",
            sublabel: "Total issued event passes",
          },
          {
            label: "Confirmed Passes",
            value: confirmed,
            icon: "check_circle",
            format: "number",
            tone: "success",
            sublabel: "Ready for QR gate scan",
          },
          {
            label: "Gate Checked In",
            value: checkedIn,
            icon: "how_to_reg",
            format: "number",
            tone: "teal",
            sublabel: `${checkInRate}% attendance arrival rate`,
          },
          {
            label: "Pending Settlement",
            value: pending,
            icon: "hourglass_top",
            format: "number",
            tone: "neutral",
            sublabel: "Awaiting payment capture",
          },
        ]}
      />
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
        <RegistrationsTable rows={rows} />
      </div>
    </div>
  );
}
