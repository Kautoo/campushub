"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CartLine } from "@/components/store/cart";
import { useStoreCurrency } from "@/components/store/currency-provider";

/** Single shopping bag pill in the storefront navbar; formats total in selected currency. */
export function CartPill({ className }: { className?: string }) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [bumped, setBumped] = useState(false);
  const { format } = useStoreCurrency();

  useEffect(() => {
    function sync() {
      const cart = JSON.parse(
        localStorage.getItem("ch-cart") ?? "[]",
      ) as CartLine[];
      setCount(cart.reduce((s, l) => s + l.qty, 0));
      setTotal(cart.reduce((s, l) => s + l.qty * l.price_cents, 0));
      setBumped(true);
      setTimeout(() => setBumped(false), 600);
    }
    window.addEventListener("ch-cart-changed", sync);
    return () => window.removeEventListener("ch-cart-changed", sync);
  }, []);

  return (
    <Link
      href="/demo/cart"
      className={
        cn(
          "btn-step focus-aura inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-label-md font-semibold text-on-primary shadow-2xs hover:opacity-90 transition-all tabular-nums",
          bumped && "scale-105 ring-2 ring-secondary shadow-md",
          className,
        )
      }
      aria-label={`Shopping bag, ${count} items`}
    >
      <span className="material-symbols-outlined text-[17px]">
        shopping_bag
      </span>
      <span>{count > 0 ? `${count} · ${format(total)}` : "Bag"}</span>
    </Link>
  );
}
