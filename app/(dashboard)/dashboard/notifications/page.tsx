import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { notifications } from "@/lib/db/repo";

export const metadata = { title: "Notifications — CampusHub 2.0" };

/** Material icon per notification type (Stitch spec). */
const typeIcons: Record<string, string> = {
  order: "receipt_long",
  stock: "inventory_2",
  event: "event",
  registration: "how_to_reg",
  ai: "auto_awesome",
  system: "info",
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-MY");
}

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function NotificationItem({ n }: { n: NotificationRow }) {
  const unread = n.read_at === null;
  return (
    <li
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
        unread
          ? "border-outline-variant bg-surface-lowest"
          : "border-transparent bg-surface-low opacity-75"
      }`}
    >
      <span
        className={`material-symbols-outlined mt-0.5 text-[22px] ${
          unread ? "text-secondary" : "text-muted"
        }`}
      >
        {typeIcons[n.type] ?? typeIcons.system}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-headline-sm text-ink truncate">{n.title}</p>
          {unread ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
          ) : null}
        </div>
        {n.body ? (
          <p className="text-body-md text-muted mt-0.5">{n.body}</p>
        ) : null}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-label-md text-muted">{timeAgo(n.created_at)}</span>
          {n.link ? (
            <a
              href={n.link}
              className="text-label-md font-semibold text-secondary hover:underline"
            >
              View
            </a>
          ) : null}
        </div>
      </div>
      {unread ? (
        <form action={markNotificationRead.bind(null, n.id)}>
          <button
            type="submit"
            title="Mark as read"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-container hover:text-ink"
          >
            <span className="material-symbols-outlined text-[18px]">
              done_all
            </span>
          </button>
        </form>
      ) : null}
    </li>
  );
}

export default async function NotificationsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="notifications" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const all = (await notifications.list(session.orgIds, 100)) as NotificationRow[];
  const unread = all.filter((n) => n.read_at === null);
  const read = all.filter((n) => n.read_at !== null);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="notifications"
        title="Notifications"
        subtitle="Orders, stock, events, and system alerts"
        actions={
          <>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-md font-semibold ${
                unread.length > 0
                  ? "bg-error-container text-error"
                  : "bg-surface-container text-muted"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                mark_email_unread
              </span>
              {unread.length} unread
            </span>
            {unread.length > 0 ? (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-label-lg font-semibold text-white transition hover:opacity-90 dark:text-on-primary-container"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    done_all
                  </span>
                  Mark all read
                </button>
              </form>
            ) : null}
          </>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="No notifications"
          body="Order, stock, and event alerts will appear here as they happen."
        />
      ) : (
        <div className="space-y-6">
          {unread.length > 0 ? (
            <section>
              <h3 className="text-label-lg font-semibold text-muted mb-2">
                Unread
              </h3>
              <ul className="space-y-2">
                {unread.map((n) => (
                  <NotificationItem key={n.id} n={n} />
                ))}
              </ul>
            </section>
          ) : null}
          {read.length > 0 ? (
            <section>
              <h3 className="text-label-lg font-semibold text-muted mb-2">
                Earlier
              </h3>
              <ul className="space-y-2">
                {read.map((n) => (
                  <NotificationItem key={n.id} n={n} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
