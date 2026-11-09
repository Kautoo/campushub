import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDatabaseEnv } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { ProductBuyBox } from "@/components/store/product-buy-box";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { getStorefrontData, resolveProductImage } from "@/lib/storefront";

export const instant = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasDatabaseEnv()) return <SetupNotice what="product details" />;

  const { slug } = await params;
  const data = await getStorefrontData();
  if (!data) return <SetupNotice what="product data" />;

  const { org, products } = data;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const imageUrl = resolveProductImage(product);
  const threshold = product.low_stock_threshold ?? 15;
  const isLow = product.stock > 0 && product.stock <= threshold;
  const isOut = product.stock <= 0;
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
        <Link href="/demo" className="hover:text-primary transition-colors">
          Storefront
        </Link>
        <span>/</span>
        <Link
          href="/demo/shop"
          className="hover:text-primary transition-colors"
        >
          Official Merch Shop
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      {/* Main 12-Col Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Cols: High-Res Product Image Showcase */}
        <div className="lg:col-span-6 rounded-3xl border border-outline-variant/60 bg-surface-lowest p-4 shadow-sm">
          <div className="relative h-80 sm:h-[420px] w-full rounded-2xl overflow-hidden bg-surface-low">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${imageUrl}')` }}
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Badge tone="primary">{product.category ?? "Merch"}</Badge>
              <Badge tone={isOut ? "error" : isLow ? "warning" : "success"}>
                {isOut
                  ? "Out of Stock"
                  : isLow
                    ? `Low Stock · ${product.stock} left`
                    : `${product.stock} in stock`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Product Info, Specs & Buy Box */}
        <div className="lg:col-span-6 rounded-3xl border border-outline-variant/60 bg-surface-lowest p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-outline-variant/40 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-surface-container px-2.5 py-0.5 font-mono text-label-sm font-semibold text-on-surface">
                SKU: {product.sku ?? product.slug.toUpperCase()}
              </span>
              <span className="text-label-sm font-semibold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">
                  verified
                </span>
                Official {org.name} Merch
              </span>
            </div>

            <h1 className="text-display font-bold text-on-surface tracking-tight pt-1">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1 tabular-nums">
              <span className="text-headline-lg font-bold text-primary">
                {formatMoney(product.price_cents, org.currency)}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                Subsidized student member pricing ·MYR
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-label-md uppercase tracking-wider font-bold text-on-surface-variant">
              Product Description &amp; Material Specs
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {product.description ??
                "Official campus society merchandise crafted for daily university use."}
            </p>
          </div>

          {/* Interactive Buy Box */}
          <ProductBuyBox
            product={{
              id: product.id,
              name: product.name,
              price_cents: product.price_cents,
              stock: product.stock,
            }}
            currency={org.currency}
          />

          {/* Fulfillment & Escrow Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/40 text-body-sm">
            <div className="rounded-xl bg-surface-low p-3.5 border border-outline-variant/40 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[19px] text-secondary shrink-0 mt-0.5">
                storefront
              </span>
              <div>
                <p className="font-semibold text-on-surface">
                  Campus Union Pick-Up
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Ready for collection at Student Union Desk with your order ID.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-low p-3.5 border border-outline-variant/40 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[19px] text-secondary shrink-0 mt-0.5">
                account_balance_wallet
              </span>
              <div>
                <p className="font-semibold text-on-surface">
                  PayPal v2 Protected
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Atomic stock decrement and verified bursary settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Merchandise */}
      {related.length > 0 ? (
        <section className="pt-8 border-t border-outline-variant/45 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-bold text-on-surface">
              More Official Club Merchandise
            </h2>
            <Link
              href="/demo/shop"
              className="text-label-md font-semibold text-secondary hover:underline"
            >
              Browse all {products.length} items →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((item) => {
              const img = resolveProductImage(item);
              return (
                <Link
                  key={item.id}
                  href={`/demo/products/${item.slug}`}
                  className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest overflow-hidden shadow-2xs hover:border-secondary/50 transition-all flex flex-col"
                >
                  <div className="h-44 w-full bg-surface-low overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${img}')` }}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-headline-sm font-bold text-on-surface truncate group-hover:text-secondary">
                        {item.name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {item.category ?? "Merch"}
                      </p>
                    </div>
                    <span className="text-headline-sm font-bold text-primary tabular-nums shrink-0">
                      {formatMoney(item.price_cents, org.currency)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
