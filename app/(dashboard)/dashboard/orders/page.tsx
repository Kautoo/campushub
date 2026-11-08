import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { OrderGrid, type OrderWithItems } from "@/components/workspaces/order-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders } from "@/lib/db/repo";

export const metadata = { title: "Orders — CampusHub 2.0" };

export default async function OrdersPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="orders" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const fetched = await orders.listWithItems(session.orgIds, 200);
  const orderRows = fetched as unknown as OrderWithItems[];

  const paidOrFulfilled = orderRows.filter(
    (o) => o.status === "paid" || o.status === "fulfilled",
  );
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
    <div className="space-y-8">
      <SectionHeader
        icon="receipt_long"
        title="Orders"
        subtitle="Storefront and registration orders — click a row for details"
      />

      <StatStrip
        items={[
          {
            label: "Paid revenue",
            value: revenueCents,
            icon: "payments",
            format: "money",
          },
          {
            label: "Pending orders",
            value: pendingCount,
            icon: "hourglass_top",
            tone: "neutral",
          },
          {
            label: "Refunded",
            value: refundedCents,
            icon: "currency_exchange",
            tone: "neutral",
            format: "money",
          },
          {
            label: "Avg order value",
            value: avgOrderCents,
            icon: "analytics",
            format: "money",
          },
        ]}
      />

      <section className="rounded-xl border border-outline-variant bg-surface-lowest">
        {orderRows.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No orders yet"
            body="Orders will appear here after the first storefront checkout."
            className="m-4"
          />
        ) : (
          <OrderGrid rows={orderRows} />
        )}
      </section>
    </div>
  );
}
