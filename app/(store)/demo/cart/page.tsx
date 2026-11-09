"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  type CartLine,
} from "@/components/store/cart";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export default function ShoppingBagPage() {
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    const sync = () => setCart(readCart());
    const raf = requestAnimationFrame(sync);
    window.addEventListener("ch-cart-changed", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("ch-cart-changed", sync);
    };
  }, []);

  const itemCount = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = cart.reduce((s, l) => s + l.qty * l.price_cents, 0);
  const fee = subtotal > 0 ? Math.round((subtotal * 29) / 1000) + 50 : 0;
  const grandTotal = subtotal + fee;

  const ticketCount = cart
    .filter((l) => Boolean(l.tier_id))
    .reduce((s, l) => s + l.qty, 0);
  const merchCount = cart
    .filter((l) => Boolean(l.product_id))
    .reduce((s, l) => s + l.qty, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <Link href="/demo" className="hover:text-primary transition-colors">
              Storefront
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">Shopping Bag</span>
          </nav>
          <h1 className="text-display font-bold text-on-surface tracking-tight">
            Your Campus Shopping Bag
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Combine event passes and official club merchandise in one atomic
            PayPal Orders v2 checkout.
          </p>
        </div>

        {cart.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              clearCart();
              setCart([]);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-low px-4 py-2 text-label-md font-semibold text-on-surface-variant hover:text-error hover:border-error/40 transition-colors self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">
              delete_sweep
            </span>
            <span>Clear Bag</span>
          </button>
        ) : null}
      </div>

      {cart.length === 0 ? (
        <div className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-surface-low border border-outline-variant/40 flex items-center justify-center mx-auto text-secondary">
            <span className="material-symbols-outlined text-[32px]">
              shopping_bag
            </span>
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-headline-md font-bold text-on-surface">
              Your shopping bag is currently empty
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Add official campus event passes or society merchandise to review
              your order and proceed to PayPal guest checkout.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/demo/events"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                confirmation_number
              </span>
              <span>Browse Event Passes</span>
            </Link>
            <Link
              href="/demo/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-lowest px-6 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                shopping_bag
              </span>
              <span>Shop Club Merch</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Bag Line Items */}
          <section className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-label-md uppercase tracking-wider font-bold text-on-surface-variant">
                Bag Line Items ({cart.length})
              </span>
              <div className="flex items-center gap-2">
                {ticketCount > 0 ? (
                  <Badge tone="teal" icon="qr_code_2">
                    {ticketCount} Event {ticketCount === 1 ? "Pass" : "Passes"}
                  </Badge>
                ) : null}
                {merchCount > 0 ? (
                  <Badge tone="primary" icon="inventory_2">
                    {merchCount} Merch {merchCount === 1 ? "Unit" : "Units"}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/50 bg-surface-lowest overflow-hidden shadow-xs">
              {cart.map((line, i) => {
                const isTicket = Boolean(line.tier_id);
                return (
                  <div
                    key={`${line.product_id ?? line.tier_id}-${i}`}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-low/40 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isTicket
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-primary-fixed text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[21px]">
                          {isTicket ? "confirmation_number" : "shopping_bag"}
                        </span>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={isTicket ? "teal" : "primary"}>
                            {isTicket
                              ? "Digital QR Pass"
                              : "Official Merchandise"}
                          </Badge>
                          <span className="text-label-sm text-on-surface-variant tabular-nums">
                            {formatMoney(line.price_cents)} each
                          </span>
                        </div>
                        <h3 className="text-headline-sm font-bold text-on-surface truncate">
                          {line.name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {isTicket
                            ? "Instant cryptographic QR token issued on payment capture"
                            : "Reserved from active society stock via Postgres place_order RPC"}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper + Line Total + Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 tabular-nums">
                      <div className="inline-flex items-center rounded-xl border border-outline-variant/60 bg-surface-low">
                        <button
                          type="button"
                          onClick={() => updateCartQty(i, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="h-9 w-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-l-xl font-bold"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-body-md font-bold text-on-surface">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(i, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="h-9 w-9 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-r-xl font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[95px]">
                        <span className="text-headline-sm font-bold text-primary block">
                          {formatMoney(line.qty * line.price_cents)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(i)}
                        aria-label={`Remove ${line.name}`}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/demo/shop"
                className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
                <span>Continue shopping merchandise</span>
              </Link>
              <Link
                href="/demo/events"
                className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary hover:underline"
              >
                <span>Add more event passes</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </section>

          {/* Right 4 Cols: Sticky Order Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-md space-y-5">
            <div className="border-b border-outline-variant/40 pb-4">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                Settlement Breakdown
              </span>
              <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
                Order Summary
              </h2>
            </div>

            <dl className="space-y-3 text-body-md tabular-nums">
              <div className="flex justify-between text-on-surface-variant">
                <dt>Items Subtotal ({itemCount} units)</dt>
                <dd className="font-semibold text-on-surface">
                  {formatMoney(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <dt>Gateway &amp; Escrow Fee (2.9% + RM 0.50)</dt>
                <dd className="font-semibold text-on-surface">
                  {formatMoney(fee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-outline-variant/50 pt-3 text-headline-md font-bold text-primary">
                <dt>Estimated Total</dt>
                <dd>{formatMoney(grandTotal)}</dd>
              </div>
            </dl>

            <Link
              href="/demo/checkout"
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>

            <div className="rounded-xl bg-surface-low p-3.5 border border-outline-variant/40 space-y-2 text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[17px] text-secondary">
                  verified_user
                </span>
                <span>Protected Guest Checkout</span>
              </div>
              <p className="text-xs leading-relaxed">
                No student account login required. Stock and seat capacity are
                verified server-side before PayPal capture.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
