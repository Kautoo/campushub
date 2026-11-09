import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { notifications } from "@/lib/db/repo";

export const metadata = { title: "Notifications & Alerts — CampusHub 2.0" };

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
      className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-all ${
        unread
          ? "border-secondary/40 bg-surface-lowest shadow-xs"
          : "border-outline-variant/35 bg-surface-low/50 opacity-80"
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            unread
              ? "bg-secondary-container/55 text-on-secondary-container"
              : "bg-surface-container text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {typeIcons[n.type] ?? typeIcons.system}
          </span>
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-headline-sm font-bold text-on-surface">
              {n.title}
            </p>
            <Badge tone={unread ? "teal" : "neutral"}>{n.type}</Badge>
          </div>
          {n.body ? (
            <p className="text-body-md text-on-surface-variant">{n.body}</p>
          ) : null}
          <div className="flex items-center gap-3 pt-0.5">
            <span className="text-label-sm text-on-surface-variant tabular-nums">
              {timeAgo(n.created_at)}
            </span>
            {n.link ? (
              <a
                href={n.link}
                className="inline-flex items-center gap-1 text-label-md font-semibold text-secondary hover:underline"
              >
                <span>Open workspace</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {unread ? (
        <form action={markNotificationRead.bind(null, n.id)}>
          <button
            type="submit"
            title="Mark as read"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2.5 text-label-sm font-semibold text-on-surface-variant transition hover:bg-surface-low hover:text-on-surface shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">
              done
            </span>
            <span>Read</span>
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

  const all = (await notifications.list(
    session.orgIds,
    100,
  )) as NotificationRow[];
  const unread = all.filter((n) => n.read_at === null);
  const read = all.filter((n) => n.read_at !== null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="notifications"
        eyebrow="Operational Telemetry Stream"
        title="Notifications & Activity Center"
        subtitle="Real-time alerts for PayPal order captures, low-stock threshold breaches, ticket registration surges, and AI commerce briefs."
        actions={
          <>
            <Badge tone={unread.length > 0 ? "error" : "neutral"} icon="notifications">
              {unread.length} unread
            </Badge>
            {unread.length > 0 ? (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary transition hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined text-[17px]">
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
            <section className="space-y-3">
              <h3 className="text-label-md uppercase tracking-wider font-bold text-secondary">
                Unread Alerts ({unread.length})
              </h3>
              <ul className="space-y-2.5">
                {unread.map((n) => (
                  <NotificationItem key={n.id} n={n} />
                ))}
              </ul>
            </section>
          ) : null}
          {read.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-label-md uppercase tracking-wider font-bold text-on-surface-variant">
                Archived Activity ({read.length})
              </h3>
              <ul className="space-y-2.5">
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
