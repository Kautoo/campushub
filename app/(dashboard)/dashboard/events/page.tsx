import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { EventsWorkspace, type EventRow } from "@/components/workspaces/events-workspace";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { events } from "@/lib/db/repo";

export const metadata = { title: "Events — CampusHub 2.0" };

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

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="event"
        title="Events"
        subtitle="Create, publish, and schedule campus events"
      />
      <EventsWorkspace
        rows={rows}
        licensed={Boolean(process.env.BRYNTUM_LICENSE_KEY)}
      />
    </div>
  );
}
