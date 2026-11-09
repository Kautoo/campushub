"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/components/store/cart";
import { formatMoney } from "@/lib/money";

export function ProductBuyBox({
  product,
  currency = "MYR",
}: {
  product: {
    id: string;
    name: string;
    price_cents: number;
    stock: number;
  };
  currency?: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isOut = product.stock <= 0;
  const maxQty = Math.min(10, Math.max(1, product.stock));

  function handleAdd() {
    if (isOut) return;
    addToCart({
      product_id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (isOut) return;
    addToCart({
      product_id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      qty,
    });
    router.push("/demo/checkout");
  }

  return (
    <div className="space-y-4">
      {/* Quantity & Line Total */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/50 bg-surface-low p-3.5 tabular-nums">
        <div className="flex items-center gap-3">
          <span className="text-label-md font-semibold text-on-surface-variant">
            Quantity
          </span>
          <div className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest">
            <button
              type="button"
              disabled={qty <= 1 || isOut}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="h-9 w-9 flex items-center justify-center text-on-surface hover:bg-surface-low disabled:opacity-40"
            >
              −
            </button>
            <span className="w-9 text-center text-body-md font-bold text-on-surface">
              {qty}
            </span>
            <button
              type="button"
              disabled={qty >= maxQty || isOut}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              aria-label="Increase quantity"
              className="h-9 w-9 flex items-center justify-center text-on-surface hover:bg-surface-low disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
            Line Subtotal
          </span>
          <span className="text-headline-sm font-bold text-primary">
            {formatMoney(product.price_cents * qty, currency)}
          </span>
        </div>
      </div>

      {/* Primary E-Commerce Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isOut}
          onClick={handleAdd}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all shadow-xs active:scale-98 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[19px]">
            {added ? "check_circle" : "add_shopping_cart"}
          </span>
          <span>{added ? "Added to Bag" : "Add to Shopping Bag"}</span>
        </button>

        <button
          type="button"
          disabled={isOut}
          onClick={handleBuyNow}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-secondary-container px-6 text-label-lg font-semibold text-on-secondary-container hover:opacity-90 transition-all active:scale-98 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[19px]">bolt</span>
          <span>Buy Now with PayPal</span>
        </button>
      </div>
    </div>
  );
}
