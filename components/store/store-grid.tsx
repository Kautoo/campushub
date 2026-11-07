"use client";

import { useState } from "react";
import { addToCart } from "@/components/store/cart";
import { StockBadge } from "@/components/store/tier-buy-button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  stock: number;
};

/** Product grid with add-to-cart; disables out-of-stock lines. */
export function StoreGrid({
  products,
  currency,
}: {
  products: StoreProduct[];
  currency: string;
}) {
  const [addedId, setAddedId] = useState<string | null>(null);

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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <article
          key={p.id}
          className="flex flex-col rounded-xl border border-outline-variant bg-surface-lowest p-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="bg-surface-container relative mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg">
            <span className="material-symbols-outlined text-[40px] text-muted">
              image
            </span>
            {p.category ? (
              <span className="absolute left-2 top-2">
                <Badge tone="neutral">{p.category}</Badge>
              </span>
            ) : null}
          </div>
          <h3 className="text-headline-sm text-ink">{p.name}</h3>
          {p.description ? (
            <p className="text-body-sm text-muted mt-1 line-clamp-2">
              {p.description}
            </p>
          ) : null}
          <div className="mt-auto pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-headline-sm font-semibold text-ink">
                {formatMoney(p.price_cents, currency)}
              </span>
              <StockBadge stock={p.stock} />
            </div>
            <button
              type="button"
              disabled={p.stock <= 0}
              onClick={() => add(p)}
              className="focus-aura h-9 w-full rounded-full bg-primary text-white disabled:opacity-40 dark:text-[#00201c] text-label-md font-semibold hover:brightness-110"
            >
              {addedId === p.id
                ? "Added ✓"
                : p.stock <= 0
                  ? "Sold out"
                  : "Add to cart"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
