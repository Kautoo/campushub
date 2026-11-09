import Link from "next/link";
import { hasDatabaseEnv } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StoreGrid } from "@/components/store/store-grid";
import { Badge } from "@/components/ui/badge";
import { getStorefrontData } from "@/lib/storefront";

export const metadata = {
  title: "Official Merch Shop — CampusHub 2.0 Storefront",
};

export default async function DemoMerchShopPage() {
  if (!hasDatabaseEnv()) return <SetupNotice what="the merchandise shop" />;

  const data = await getStorefrontData();
  if (!data) return <SetupNotice what="merchandise data" />;

  const { org, products } = data;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Link href="/demo" className="hover:text-primary transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Official Merch Shop
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge tone="teal" icon="verified">
                Faculty Licensed Gear
              </Badge>
              <Badge tone="primary">{products.length} Active SKUs</Badge>
            </div>
            <h1 className="text-display font-bold text-on-surface tracking-tight">
              Collegiate Apparel, Tech Gear &amp; Stationery
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Every item is officially licensed by {org.name} and tracked in real
              time via Postgres inventory locks. Click any item to open its
              specification page or add directly to your shopping bag.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <div className="rounded-xl border border-outline-variant/50 bg-surface-low px-4 py-2.5">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Units Ready to Ship
              </span>
              <span className="text-headline-sm font-bold text-primary">
                {totalUnits.toLocaleString()} units
              </span>
            </div>
            <Link
              href="/dashboard/products"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                table_chart
              </span>
              <span>View AG Grid SKU Matrix</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Grid */}
      <StoreGrid products={products} currency={org.currency} />
    </main>
  );
}
