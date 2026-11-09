"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@/components/store/cart";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images?: string[] | null;
  category: string | null;
  price_cents: number;
  stock: number;
  sku?: string | null;
  low_stock_threshold?: number | null;
};

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "tee-navy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCZoqsNaO5Ex0N6IVf_qkLrMqYjQYpS9fQZd7UOjq6jxmBrFEwyD8YUXaDodlsuiFKADPYe9GJnBXIutDmIQ3YU64oOvxrol49FWL3XBF93KmZo4IRRVyC-yuPm7VfE9ZBFgWQjphAQyGmDuGTVo15bSKE53aAIWtkdn-fOcrvYv8HdCAgpGFJoFyQ5dEPX1xCh19GgEcZOsW4rcVARrn93fx4OpxqUL_cjuPyiCmoO",
  "tee-teal":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgdgBNZAglNUgA4NfljycnAMlSIV439BpXAkAU4H1n1Pb8nm0uXu03hOELtZSWS2xFFV97Ev-sqgYY_Vv9xVv8EGfI0-fAQ4kqKTlCSdAyMx619n311WmaMzMlvaCnZfYxc52v_1fh55E-Ke14GMK7M-NjLw1OSpEeJtmIa9cW9dk38lUcdJpbXdf_sSeb5amGsfJL_SHrdthsW1dYr9P8jWCysYwGhiMiEER_Ehl",
  "hoodie-midnight":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBONDIJOCIm1jFOr9QdvzBv29vbS8tn1Pai5hmfAk2sx2uu58dydkk-138wEQzSgv6M0iTycK8cowKCBp5Hbs0PAapK4jVgfUZvzY81eDZxIBXcBtDhQ-3BxvWQ9MJqKl57jDBK81xbO_sad_e64LjxgQLiIiR3i0M1P7KVA9FikrgUG7zqSJ5qcEkldg2GXYRQ0kI-9dSYeSi1pJQl6qr0ofsmRR1InF9iW83odl_A",
  "sticker-pack":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDD_2YTpJx99AsnOecnGehlcpmmVfxkczvNDIycmJE9GbvAqccUwy5dMpxRCv_tB-Kt_CyAxL3P4syHNjq_FuRIX5uw8vPMBq7xyHQDL0je0NY2masYRF6HD23A0ThNsxBKkRVMi3SwZXyIR9u9-QxsQ6CXXyy_McPjPFBAm_vh74VGKaY0x5Xu5XouFZp4GOvsY815n7Tw3hwfrxhMV2JUWONgkusvbcut--SzP60C",
  "pin-rocket":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2S_NAZYf91_23nGKR1lgk7wuNb1Jf4R9SSitfZftXGqRxLmsmvXTD8wJQwVfQqG87XtnIYRryRis61bPiYuqHbiRGtJWTs-d4K0kHSiNIVZ4Z0Rj4sRMUcW_jqUaz30cmh6zC37lyqpum35h7QZwWwek3CzTGAY5szKrZ31UsBl3QJsTzPRjg-705mpdx4qDr0EnpPDCpmQ5wpzbOJBxwsArG4m3ZSUP7v1vaNiD2",
  "notebook-dotgrid":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0E0_i8ge6BkDxFl3QzbA6OttXNAYbAapvTJFfr7N_tjJob_1JK23MB7zQVHgpDsl2UFwzs1PNF0Jqg1HJLSOrAfhiaYpXtTdXRiUnLqTjWASr73tEpzz1wZ0BdtZUCUmyHTcPw0kvze1RxQX7kX4HIYYAqfVQ3DgORw2Ay_KGbLcpHow7zEf7YJMrEabNbYuLcUMDjyL9GofYJ449Uca0FpPpNvAE6yHfhlCBfRA",
  "tote-canvas":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhwGBAmx0qVOA9hWsPi2LaYs5_qQg89KyZzDDkoEj7gxZ9j61AFBXfiTUlkN55DVFf5K9R7wdqfIg5oU_Q_tuvI8hy-xEElULcqoZNw4JEv-IpOXAkpJ5R_oUzOX8E_8qTx_K5hgK61l27ynj2RNci6A48PpoyvOdHSTsQ1wdSN9gtEDfkVShY7oivDbiZYR1xLOpimqpof3zJiaHn0CP6v9kaCSSWeMs3b83EuTuq",
  "bottle-750":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0rI0hkm4ObQPP6bZ8RRp4h2EuNd7OtQro7xzq12KEf0vDNXvCS8wHPs8br6NfsaVIBYgqcP9JnUdIFXf2qCczzeiJxnzrLzJd2IHYKC1-SiQV8BK2rN2IhocSP12V93SlH_vIs8azHJzoiXYVZohp70sWsRbN479HmxDc_PIaelq1dHDEG2rODtRz162pVYJkXPkp4WnSwMn3BSbTbpNd8GzsLSUA4hMxA9_8Q_u",
};

type SortKey = "featured" | "price-asc" | "price-desc" | "stock-desc";

/**
 * Interactive CampusHub 2.0 Merchandise Catalog Grid:
 * Category filtering, instant search, sort selector, SKU badges, and stock health meters.
 */
export function StoreGrid({
  products,
  currency,
}: {
  products: StoreProduct[];
  currency: string;
}) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("featured");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const cat = p.category || "Merch";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return [
      { key: "all", label: "All Items", count: products.length },
      ...[...counts.entries()].map(([cat, count]) => ({
        key: cat,
        label: cat,
        count,
      })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const base = products.filter((p) => {
      if (
        selectedCategory !== "all" &&
        (p.category || "Merch") !== selectedCategory
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = (p.description ?? "").toLowerCase().includes(q);
        const matchSku = (p.sku ?? "").toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSku) return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      return [...base].sort((a, b) => a.price_cents - b.price_cents);
    }
    if (sortBy === "price-desc") {
      return [...base].sort((a, b) => b.price_cents - a.price_cents);
    }
    if (sortBy === "stock-desc") {
      return [...base].sort((a, b) => b.stock - a.stock);
    }
    return base;
  }, [products, selectedCategory, searchQuery, sortBy]);

  function add(p: StoreProduct) {
    addToCart({
      product_id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      qty: 1,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Interactive Filter, Search & Sort Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-outline-variant/50 bg-surface-lowest p-3.5 shadow-xs">
        {/* Category Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0"
          role="group"
          aria-label="Filter merchandise by category"
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label-md font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-on-primary shadow-2xs"
                    : "bg-surface-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                    active
                      ? "bg-white/20 text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <span className="material-symbols-outlined text-[17px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merch, apparel, or SKU…"
              aria-label="Search merchandise"
              className="focus-aura h-9 w-full sm:w-60 rounded-lg border border-outline-variant/60 bg-surface-low/80 pl-9 pr-3 text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label="Sort merchandise"
            className="focus-aura h-9 rounded-lg border border-outline-variant/60 bg-surface-low/80 px-3 text-label-md font-medium text-on-surface outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-desc">Inventory: Most Available</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((p) => {
          const imageUrl =
            p.images?.[0] ||
            DEFAULT_PRODUCT_IMAGES[p.slug] ||
            DEFAULT_PRODUCT_IMAGES["hoodie-midnight"];
          const threshold = p.low_stock_threshold ?? 15;
          const isLow = p.stock > 0 && p.stock <= threshold;
          const isOut = p.stock <= 0;

          return (
            <article
              key={p.id}
              className="group rounded-2xl bg-surface-lowest border border-outline-variant/45 hover:border-secondary/45 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-52 w-full overflow-hidden bg-surface-low border-b border-outline-variant/30">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${imageUrl}')` }}
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <Badge tone="primary">{p.category ?? "Merch"}</Badge>
                  <Badge
                    tone={isOut ? "error" : isLow ? "warning" : "success"}
                  >
                    {isOut
                      ? "Sold Out"
                      : isLow
                        ? `Only ${p.stock} left`
                        : `${p.stock} in stock`}
                  </Badge>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {p.sku ?? p.slug.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-secondary font-semibold">
                      Official Licensed
                    </span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors mt-1">
                    {p.name}
                  </h3>
                  {p.description ? (
                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  ) : null}
                </div>

                {/* Price & Action Button */}
                <div className="pt-3 border-t border-outline-variant/35 flex items-center justify-between gap-2">
                  <div className="tabular-nums">
                    <span className="text-[10.5px] uppercase tracking-wider text-on-surface-variant block">
                      Member Price
                    </span>
                    <span className="text-headline-sm font-bold text-primary">
                      {formatMoney(p.price_cents, currency)}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isOut}
                    onClick={() => add(p)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-all shadow-2xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {addedId === p.id ? "check" : "add_shopping_cart"}
                    </span>
                    <span>
                      {addedId === p.id
                        ? "Added"
                        : isOut
                          ? "Sold Out"
                          : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
