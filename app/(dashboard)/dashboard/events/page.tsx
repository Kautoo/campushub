import { redirect } from "next/navigation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { EventsWorkspace, type EventRow } from "@/components/workspaces/events-workspace";

export const metadata = { title: "Events — CampusHub 2.0" };

export default async function EventsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="events" />;

  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("events")
      .select("*, ticket_tiers(*)")
      .order("start_at", { ascending: false, nullsFirst: false }),
  ]);
  if (!user) redirect("/login");

  // Handwritten Database types declare no relationships, so the nested
  // ticket_tiers select is untyped — cast the raw join result explicitly.
  const joined = (data ?? []) as unknown as Array<
    Omit<EventRow, "total_sold"> & {
      ticket_tiers: { sold: number }[] | null;
    }
  >;

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
    total_sold: (e.ticket_tiers ?? []).reduce((s, t) => s + t.sold, 0),
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
