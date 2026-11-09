import { SetupNotice } from "@/components/layout/setup-notice";
import { redirect } from "next/navigation";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/workspaces/product-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { products } from "@/lib/db/repo";

export const metadata = { title: "Products & Inventory — CampusHub 2.0" };

export default async function ProductsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="products" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const [products_, movements] = await Promise.all([
    products.list(session.orgIds),
    products.listMovements(session.orgIds, 50),
  ]);

  const active = products_.filter((p) => p.status === "active");
  const totalUnits = products_.reduce((s, p) => s + p.stock, 0);
  const inventoryValueCents = products_.reduce(
    (s, p) => s + p.stock * p.price_cents,
    0,
  );
  const lowStockCount = active.filter(
    (p) => p.stock <= p.low_stock_threshold,
  ).length;
  const outOfStockCount = active.filter((p) => p.stock === 0).length;

  const movementRows = movements.map((m) => ({
    id: m.id,
    delta: m.delta,
    reason: m.reason,
    created_at: m.created_at,
    products: { name: m.product_name } as { name: string } | null,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="shopping_bag"
        eyebrow="Merchandise & SKU Control"
        title="Product Catalog & Inventory Matrix"
        subtitle="Manage society apparel, tech accessories, and stationery SKUs in AG Grid Community, monitor safety stock thresholds, and audit real-time stock movements."
      />

      <StatStrip
        items={[
          {
            label: "Active Catalog SKUs",
            value: active.length,
            icon: "inventory_2",
            tone: "primary",
            sublabel: `${totalUnits.toLocaleString()} total units on hand`,
          },
          {
            label: "Inventory Valuation",
            value: inventoryValueCents,
            icon: "account_balance_wallet",
            format: "money",
            tone: "teal",
            sublabel: "Retail value of current stock",
          },
          {
            label: "Low Stock Alerts",
            value: lowStockCount,
            icon: "warning",
            tone: "neutral",
            sublabel: "At or below safety threshold",
          },
          {
            label: "Out of Stock",
            value: outOfStockCount,
            icon: "remove_shopping_cart",
            tone: "neutral",
            sublabel: "Temporarily paused on storefront",
          },
        ]}
      />

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest shadow-xs overflow-hidden">
        <ProductGrid rows={products_} />
      </section>

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/40">
          <div>
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
              Inventory Audit Trail
            </span>
            <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
              Recent Stock Movements
            </h3>
          </div>
          <Badge tone="neutral">{movementRows.length} logged events</Badge>
        </div>
        {movementRows.length === 0 ? (
          <EmptyState
            icon="swap_vert"
            title="No inventory movements yet"
            body="Atomic stock decrements from storefront checkouts and manual restocks will appear here."
            className="mt-4"
          />
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-body-md">
              <thead>
                <tr className="border-b border-outline-variant/50 text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3 font-semibold">Product SKU</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Net Delta
                  </th>
                  <th className="px-4 py-3 font-semibold">Audit Reason</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/35">
                {movementRows.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-surface-low/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-on-surface">
                      {m.products?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[12px] font-bold ${
                          m.delta >= 0
                            ? "bg-success-container text-success"
                            : "bg-error-container text-error"
                        }`}
                      >
                        {m.delta >= 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {m.reason}
                    </td>
                    <td className="px-4 py-3 text-right text-body-sm text-on-surface-variant tabular-nums">
                      {new Date(m.created_at).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
