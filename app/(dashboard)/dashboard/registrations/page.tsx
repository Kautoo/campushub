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

export const metadata = { title: "Registrations — CampusHub 2.0" };

export default async function RegistrationsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="registrations" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const joined = await registrations.listWithJoins(session.orgIds, 500);

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

  return (
    <div className="space-y-space-lg">
      <SectionHeader
        icon="how_to_reg"
        title="Registration Management"
        subtitle="Monitor real-time attendee flow, ticket tier fulfillment, manual check-in gates, and student fee settlement across active campus society initiatives."
      />
      <StatStrip
        items={[
          { label: "Total registrations", value: total, icon: "group", format: "number" },
          { label: "Confirmed", value: confirmed, icon: "check_circle", format: "number", tone: "success" },
          { label: "Checked in", value: checkedIn, icon: "how_to_reg", format: "number" },
          { label: "Pending", value: pending, icon: "hourglass_top", format: "number", tone: "neutral" },
        ]}
      />
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <RegistrationsTable rows={rows} />
      </div>
    </div>
  );
}
