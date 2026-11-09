"use client";

import { useState } from "react";
import { addToCart, type CartLine } from "@/components/store/cart";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

/** Buy control for a ticket tier: shows tier name, perks, availability, price, qty select + add-to-cart. */
export function TierBuyButton({
  tier,
  perks,
  remaining,
  currency = "MYR",
}: {
  tier: CartLine;
  perks?: string[] | null;
  remaining?: number;
  currency?: string;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const tierLabel = tier.name.includes(" — ")
    ? tier.name.split(" — ")[1]
    : tier.name;

  function add() {
    addToCart({ ...tier, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-outline-variant/45 bg-surface-low/60 px-3.5 py-2.5 hover:border-secondary/40 transition-colors">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-md font-semibold text-on-surface">
            {tierLabel}
          </span>
          <span className="text-body-md font-bold text-primary tabular-nums">
            {tier.price_cents === 0
              ? "Free"
              : formatMoney(tier.price_cents, currency)}
          </span>
          {remaining !== undefined ? (
            <span className="text-[11px] text-on-surface-variant tabular-nums">
              ({remaining} seats left)
            </span>
          ) : null}
        </div>
        {perks && perks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {perks.map((perk) => (
              <span
                key={perk}
                className="inline-flex items-center gap-1 rounded-md bg-surface-lowest px-2 py-0.2 text-[11px] text-on-surface-variant border border-outline-variant/35"
              >
                <span className="material-symbols-outlined text-[12px] text-secondary">
                  check
                </span>
                {perk}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          aria-label={`Quantity for ${tier.name}`}
          className="h-8 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2 text-label-md text-on-surface tabular-nums"
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}×
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="focus-aura inline-flex items-center gap-1 bg-primary text-on-primary h-8 rounded-full px-3.5 text-label-md font-semibold hover:bg-primary-container transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[15px]">
            {added ? "check" : "confirmation_number"}
          </span>
          <span>{added ? "Added" : "Add Pass"}</span>
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
