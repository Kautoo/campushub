import { SetupNotice } from "@/components/layout/setup-notice";
import { redirect } from "next/navigation";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { ProductGrid } from "@/components/workspaces/product-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { products } from "@/lib/db/repo";

export const metadata = { title: "Products — CampusHub 2.0" };

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
    <div className="space-y-space-lg">
      <SectionHeader
        icon="shopping_bag"
        title="Product Management"
        subtitle="Catalog, monitor stock levels, manage merchandise pricing, and track inventory velocity across campus sales channels."
      />

      <StatStrip
        items={[
          {
            label: "Active products",
            value: active.length,
            icon: "inventory_2",
          },
          {
            label: "Inventory value",
            value: inventoryValueCents,
            icon: "account_balance_wallet",
            format: "money",
          },
          {
            label: "Low stock",
            value: lowStockCount,
            icon: "warning",
            tone: "neutral",
          },
          {
            label: "Out of stock",
            value: outOfStockCount,
            icon: "remove_shopping_cart",
            tone: "neutral",
          },
        ]}
      />

      <section className="rounded-xl bg-surface-container-lowest shadow-sm">
        <ProductGrid rows={products_} />
      </section>

      <section className="rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="px-5 py-4">
          <h3 className="text-headline-sm text-on-surface">Recent inventory movements</h3>
          <p className="text-body-sm text-on-surface-variant">
            Last 50 stock changes across all products
          </p>
        </div>
        {movementRows.length === 0 ? (
          <EmptyState
            icon="swap_vert"
            title="No inventory movements yet"
            body="Stock changes from checkouts and manual edits will appear here."
            className="m-4"
          />
        ) : (
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-t border-outline-variant text-label-sm text-on-surface-variant">
                <th className="px-5 py-2 font-semibold">Product</th>
                <th className="px-5 py-2 font-semibold">Change</th>
                <th className="px-5 py-2 font-semibold">Reason</th>
                <th className="px-5 py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {movementRows.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-outline-variant hover:bg-surface-low"
                >
                  <td className="px-5 py-3 text-on-surface">
                    {m.products?.name ?? "—"}
                  </td>
                  <td
                    className={`px-5 py-3 font-mono text-[13px] font-semibold ${
                      m.delta >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">{m.reason}</td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    {new Date(m.created_at).toLocaleString("en-MY", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
