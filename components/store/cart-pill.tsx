"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartCount, type CartLine } from "@/components/store/cart";
import { formatMoney } from "@/lib/money";

/** Floating cart pill; count syncs via ch-cart-changed events. */
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
      href="/demo/checkout"
      className={
        "focus-aura inline-flex h-10 items-center gap-2 rounded-full border border-outline-variant bg-surface-lowest px-4 text-label-lg text-ink shadow-card hover:bg-surface-low " +
        (className ?? "")
      }
      aria-label={`Cart, ${count} items`}
    >
      <span className="material-symbols-outlined text-[20px]">
        shopping_bag
      </span>
      {count > 0 ? `${count} · ${formatMoney(total)}` : "Cart"}
    </Link>
  );
}
