import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import {
  EventsWorkspace,
  type EventRow,
} from "@/components/workspaces/events-workspace";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { events } from "@/lib/db/repo";

export const metadata = { title: "Events & Venue Scheduler — CampusHub 2.0" };

export default async function EventsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="events" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const joined = await events.listWithTiers(session.orgIds);

  const rows: EventRow[] = joined.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    venue: e.venue,
    category: e.category,
    start_at: e.start_at,
    end_at: e.end_at,
    capacity: e.capacity,
    status: e.status,
    total_sold: e.ticket_tiers.reduce((s, t) => s + t.sold, 0),
  }));

  const publishedCount = rows.filter((e) => e.status === "published").length;
  const totalSold = rows.reduce((s, e) => s + e.total_sold, 0);
  const totalCapacity = rows.reduce((s, e) => s + (e.capacity || 0), 0);
  const fillRate =
    totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const activeVenues = new Set(
    rows.map((e) => e.venue?.trim() || "Campus Quad"),
  ).size;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="confirmation_number"
        eyebrow="Event Scheduling & Ticketing"
        title="Events & Venue Timeline Management"
        subtitle="Manage tabular event rosters with AG Grid Community or switch to Bryntum Scheduler for interactive multi-venue calendar timelines and drag-and-drop rescheduling."
      />

      <StatStrip
        items={[
          {
            label: "Total Initiatives",
            value: rows.length,
            icon: "event",
            tone: "primary",
            sublabel: `${publishedCount} published on storefront`,
          },
          {
            label: "Passes Issued",
            value: totalSold,
            icon: "confirmation_number",
            tone: "teal",
            sublabel: `Across ${joined.reduce((s, e) => s + e.ticket_tiers.length, 0)} ticket tiers`,
          },
          {
            label: "Total Seat Capacity",
            value: totalCapacity,
            icon: "groups",
            tone: "success",
            sublabel: `${fillRate}% aggregate capacity utilization`,
          },
          {
            label: "Scheduled Venues",
            value: activeVenues,
            icon: "location_on",
            tone: "neutral",
            sublabel: "Tracked on Bryntum timeline",
          },
        ]}
      />

      <EventsWorkspace
        rows={rows}
        licensed={Boolean(process.env.BRYNTUM_LICENSE_KEY)}
      />
    </div>
  );
}
