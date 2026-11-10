import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import {
  OrderGrid,
  type OrderWithItems,
} from "@/components/workspaces/order-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders } from "@/lib/db/repo";

export const metadata = { title: "Orders — CampusHub" };

export default async function OrdersPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="orders" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const fetched = await orders.listWithItems([session.activeOrgId], 200);
  const orderRows = fetched as unknown as OrderWithItems[];

  const paidOrFulfilled = orderRows.filter(
    (o) => o.status === "paid" || o.status === "fulfilled",
  );
  const fulfilledCount = orderRows.filter(
    (o) => o.status === "fulfilled",
  ).length;
  const revenueCents = paidOrFulfilled.reduce((s, o) => s + o.total_cents, 0);
  const pendingCount = orderRows.filter((o) => o.status === "pending").length;
  const refundedCents = orderRows
    .filter((o) => o.status === "refunded")
    .reduce((s, o) => s + o.total_cents, 0);
  const avgOrderCents =
    paidOrFulfilled.length > 0
      ? Math.round(revenueCents / paidOrFulfilled.length)
      : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="receipt_long"
        eyebrow="Commerce Order Fulfillment"
        title="Order Ledger & Fulfillment Queue"
        subtitle="Track student merchandise and event pass checkouts in AG Grid Community, inspect line-item fee breakdowns, and manage parcel fulfillment."
      />

      <StatStrip
        items={[
          {
            label: "Settled Order Volume",
            value: revenueCents,
            icon: "payments",
            format: "money",
            tone: "teal",
            sublabel: `${paidOrFulfilled.length} paid (${fulfilledCount} fulfilled)`,
          },
          {
            label: "Pending Checkout",
            value: pendingCount,
            icon: "hourglass_top",
            tone: "neutral",
            sublabel: "Awaiting PayPal capture",
          },
          {
            label: "Refunded Volume",
            value: refundedCents,
            icon: "currency_exchange",
            tone: "neutral",
            format: "money",
            sublabel: "Returned to student buyers",
          },
          {
            label: "Average Basket Size",
            value: avgOrderCents,
            icon: "analytics",
            format: "money",
            tone: "primary",
            sublabel: "Across settled transactions",
          },
        ]}
      />

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest shadow-xs overflow-hidden">
        {orderRows.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No orders yet"
            body="Orders will appear here after the first storefront checkout."
            className="m-5"
          />
        ) : (
          <OrderGrid rows={orderRows} />
        )}
      </section>
    </div>
  );
}
