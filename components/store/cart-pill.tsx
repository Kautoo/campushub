"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartLine } from "@/components/store/cart";
import { formatMoney } from "@/lib/money";

/** Header shopping bag pill; syncs count and subtotal via ch-cart-changed events. */
export function CartPill({ className }: { className?: string }) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    function sync() {
      const cart = JSON.parse(
        localStorage.getItem("ch-cart") ?? "[]",
      ) as CartLine[];
      setCount(cart.reduce((s, l) => s + l.qty, 0));
      setTotal(cart.reduce((s, l) => s + l.qty * l.price_cents, 0));
    }
    sync();
    window.addEventListener("ch-cart-changed", sync);
    return () => window.removeEventListener("ch-cart-changed", sync);
  }, []);

  return (
    <Link
      href="/demo/cart"
      className={
        "focus-aura inline-flex h-10 items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-lowest px-4 text-label-md font-semibold text-on-surface shadow-2xs hover:bg-surface-low transition-colors tabular-nums " +
        (className ?? "")
      }
      aria-label={`Shopping bag, ${count} items`}
    >
      <span className="material-symbols-outlined text-[19px] text-secondary">
        shopping_bag
      </span>
      <span>{count > 0 ? `${count} · ${formatMoney(total)}` : "Bag (0)"}</span>
    </Link>
  );
}
