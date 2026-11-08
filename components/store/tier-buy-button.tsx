"use client";

import { useState } from "react";
import { addToCart, type CartLine } from "@/components/store/cart";
import { Badge } from "@/components/ui/badge";

/** Buy control for a ticket tier: qty select + add-to-cart. */
export function TierBuyButton({ tier }: { tier: CartLine }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function add() {
    addToCart({ ...tier, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-body-sm text-on-surface">{tier.name.split(" — ")[1]}</span>
      <div className="flex items-center gap-2">
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          aria-label={`Quantity for ${tier.name}`}
          className="h-8 rounded-lg border border-outline-variant bg-surface-low px-2 text-label-md text-on-surface"
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="focus-aura bg-primary text-white dark:text-[#00201c] h-8 rounded-full px-3 text-label-md font-semibold hover:brightness-110"
        >
          {added ? "Added ✓" : "Add"}
        </button>
      </div>
    </div>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge tone="error">Out of stock</Badge>;
  if (stock <= 20) return <Badge tone="warning">{stock} left</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
