import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { ProductGrid } from "@/components/workspaces/product-grid";

export const metadata = { title: "Products — CampusHub 2.0" };

export default async function ProductsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="products" />;

  const [productsRes, movementsRes] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase
      .from("inventory_movements")
      .select("id, delta, reason, created_at, products(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const products = productsRes.data ?? [];
  const active = products.filter((p) => p.status === "active");
  const inventoryValueCents = products.reduce(
    (s, p) => s + p.stock * p.price_cents,
    0,
  );
  const lowStockCount = active.filter(
    (p) => p.stock <= p.low_stock_threshold,
  ).length;
  const outOfStockCount = active.filter((p) => p.stock === 0).length;

  const movements = (
    movementsRes.data ?? []
  ) as unknown as Array<{
    id: string;
    delta: number;
    reason: string;
    created_at: string;
    products: { name: string } | null;
  }>;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="inventory_2"
        title="Products"
        subtitle="Catalog, stock levels, and inventory movements"
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

      <section className="rounded-xl border border-outline-variant bg-surface-lowest">
        <ProductGrid rows={products} />
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-lowest">
        <div className="px-5 py-4">
          <h3 className="text-headline-sm text-ink">Recent inventory movements</h3>
          <p className="text-body-sm text-muted">
            Last 50 stock changes across all products
          </p>
        </div>
        {movements.length === 0 ? (
          <EmptyState
            icon="swap_vert"
            title="No inventory movements yet"
            body="Stock changes from checkouts and manual edits will appear here."
            className="m-4"
          />
        ) : (
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-t border-outline-variant text-label-sm text-muted">
                <th className="px-5 py-2 font-semibold">Product</th>
                <th className="px-5 py-2 font-semibold">Change</th>
                <th className="px-5 py-2 font-semibold">Reason</th>
                <th className="px-5 py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-outline-variant hover:bg-surface-low"
                >
                  <td className="px-5 py-3 text-ink">
                    {m.products?.name ?? "—"}
                  </td>
                  <td
                    className={`px-5 py-3 font-mono text-[13px] font-semibold ${
                      m.delta >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className="px-5 py-3 text-ink-variant">{m.reason}</td>
                  <td className="px-5 py-3 text-muted">
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
