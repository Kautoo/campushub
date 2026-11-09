"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { Button } from "@heroui/react";
import {
  readCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  type CartLine,
} from "@/components/store/cart";
import { useStoreCurrency } from "@/components/store/currency-provider";
import { Badge } from "@/components/ui/badge";

type Stage = "cart" | "details" | "paying" | "done" | "error";
type DbOrder = { id: string; order_number: string; total_cents: number };

const STEPS = [
  { key: "cart", label: "1. Review Bag", icon: "shopping_bag" },
  { key: "details", label: "2. Student Details", icon: "badge" },
  { key: "paying", label: "3. PayPal Payment", icon: "account_balance_wallet" },
  { key: "done", label: "4. Confirmed", icon: "check_circle" },
] as const;

function Stepper({ stage }: { stage: Stage }) {
  const current =
    stage === "error" ? 1 : STEPS.findIndex((s) => s.key === stage);
  const idx = current < 0 ? 0 : current;
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Checkout progress"
    >
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            aria-current={i === idx ? "step" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label-sm font-semibold border transition-all ${
              i < idx
                ? "bg-success-container text-success border-success/30"
                : i === idx
                  ? "bg-primary text-on-primary border-primary shadow-2xs"
                  : "bg-surface-low text-on-surface-variant border-outline-variant/50"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {i < idx ? "check" : s.icon}
            </span>
            <span>{s.label}</span>
          </div>
          {i < STEPS.length - 1 ? (
            <span
              aria-hidden
              className={`hidden sm:inline-block w-5 h-0.5 rounded-full ${
                i < idx ? "bg-success" : "bg-outline-variant"
              }`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("details");
  const [error, setError] = useState<string | null>(null);
  const [dbOrder, setDbOrder] = useState<DbOrder | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { format, currency } = useStoreCurrency();

  useEffect(() => {
    const sync = () => setCart(readCart());
    const raf = requestAnimationFrame(sync);
    window.addEventListener("ch-cart-changed", sync);
    fetch("/api/store-config")
      .then((r) => r.json())
      .then((cfg: { org_id?: string; paypal_client_id?: string | null }) => {
        if (cfg.org_id) setOrgId(cfg.org_id);
        if (cfg.paypal_client_id) setPaypalClientId(cfg.paypal_client_id);
      })
      .catch(() => setError("Store configuration unavailable."));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("ch-cart-changed", sync);
    };
  }, []);

  const itemCount = cart.reduce((s, l) => s + l.qty, 0);
  const total = cart.reduce((s, l) => s + l.qty * l.price_cents, 0);
  const fee = total > 0 ? Math.round((total * 29) / 1000) + 50 : 0;
  const grandTotal = total + fee;

  async function placeOrderAndPay(): Promise<string> {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org_id: orgId,
        items: cart.map((l) => ({
          product_id: l.product_id,
          tier_id: l.tier_id,
          qty: l.qty,
        })),
        customer_name: name,
        customer_email: email,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "order_failed");
    }
    const order = json.order as DbOrder;
    setDbOrder(order);

    const pp = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: order.id }),
    });
    const ppJson = await pp.json();
    if (!pp.ok) {
      throw new Error(ppJson.error ?? "paypal_error");
    }
    return ppJson.paypal_order_id as string;
  }

  const buttonProps: PayPalButtonsComponentProps = {
    style: { layout: "vertical", shape: "pill", color: "blue" },
    createOrder: async () => {
      setError(null);
      try {
        return await placeOrderAndPay();
      } catch (e) {
        setError(e instanceof Error ? e.message : "order_failed");
        setStage("error");
        throw e;
      }
    },
    onApprove: async () => {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: dbOrder!.id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "capture_failed");
        clearCart();
        setCart([]);
        setStage("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "capture_failed");
        setStage("error");
      }
    },
    onError: () => {
      setError("PayPal error — please verify your details and try again.");
      setStage("error");
    },
  };

  if (stage === "done") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="rounded-3xl border border-outline-variant/60 bg-surface-lowest p-8 sm:p-10 text-center shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-success-container text-success flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[36px]">
              check_circle
            </span>
          </div>
          <div className="space-y-1.5">
            <Badge tone="success" icon="verified">
              Payment Complete
            </Badge>
            <h1 className="text-display font-bold text-on-surface mt-2">
              Order Confirmed &amp; Passes Issued
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Order{" "}
              <strong className="font-mono text-primary">
                {dbOrder?.order_number}
              </strong>{" "}
              is confirmed. Your receipt and digital QR passes have been sent to{" "}
              <strong className="text-on-surface">{email}</strong>.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/demo"
              className="focus-aura bg-primary text-on-primary inline-flex h-11 items-center gap-2 rounded-full px-6 text-label-lg font-semibold hover:opacity-90 transition-all"
            >
              <span>Return to Storefront</span>
              <span className="material-symbols-outlined text-[17px]">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/demo/events"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-low px-6 text-label-lg font-semibold text-on-surface hover:bg-surface-container transition-all"
            >
              <span>Explore More Events</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Checkout Header + Stepper */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <Link href="/demo" className="hover:text-primary transition-colors">
              Storefront
            </Link>
            <span>/</span>
            <Link
              href="/demo/cart"
              className="hover:text-primary transition-colors"
            >
              Shopping Bag
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">Checkout</span>
          </nav>
          <h1 className="text-display font-bold text-on-surface tracking-tight">
            Express Guest Checkout
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Complete your student details and settle securely with PayPal.
          </p>
        </div>

        <Stepper stage={stage} />
      </div>

      {cart.length === 0 ? (
        <div className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-surface-low border border-outline-variant/40 flex items-center justify-center mx-auto text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px]">
              shopping_bag
            </span>
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">
            Your checkout bag is empty
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
            Add event passes or official society merchandise before proceeding
            to payment.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/demo/events"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary"
            >
              Browse Events &amp; Passes
            </Link>
            <Link
              href="/demo/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-lowest px-6 text-label-lg font-semibold text-on-surface"
            >
              Browse Merch Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Buyer Details + Bag Items Review */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Student / Buyer Information */}
            <section className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-label-md font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-bold text-on-surface">
                      Student &amp; Attendee Details
                    </h2>
                    <p className="text-body-sm text-on-surface-variant">
                      Used for QR pass delivery and order confirmation
                    </p>
                  </div>
                </div>
                <Badge tone="teal">Guest Checkout</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-label-md font-semibold text-on-surface">
                    Full Name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aminah Hassan"
                    required
                    className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
                  />
                </label>
                <label className="block">
                  <span className="text-label-md font-semibold text-on-surface">
                    Campus or Personal Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="aminah.h@campus.edu.my"
                    required
                    className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
                  />
                </label>
              </div>
            </section>

            {/* Step 2: Order Items & Quantity Adjustments */}
            <section className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-label-md font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-bold text-on-surface">
                      Order Items ({itemCount} units)
                    </h2>
                    <p className="text-body-sm text-on-surface-variant">
                      Adjust quantities or remove items before payment
                    </p>
                  </div>
                </div>
                <Link
                  href="/demo/cart"
                  className="text-label-sm font-semibold text-secondary hover:underline"
                >
                  Edit in Full Bag →
                </Link>
              </div>

              <div className="divide-y divide-outline-variant/40">
                {cart.map((l, i) => {
                  const isTicket = Boolean(l.tier_id);
                  return (
                    <div
                      key={`${l.product_id ?? l.tier_id}-${i}`}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone={isTicket ? "teal" : "primary"}>
                            {isTicket ? "Event Pass" : "Merch"}
                          </Badge>
                          <p className="text-body-md font-semibold text-on-surface truncate">
                            {l.name}
                          </p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mt-0.5 tabular-nums">
                          Unit price: {format(l.price_cents)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 tabular-nums">
                        <div className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-low">
                          <button
                            type="button"
                            onClick={() => updateCartQty(i, l.qty - 1)}
                            aria-label={`Decrease ${l.name}`}
                            className="h-8 w-8 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-body-sm font-bold text-on-surface">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(i, l.qty + 1)}
                            aria-label={`Increase ${l.name}`}
                            className="h-8 w-8 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-body-md font-bold text-primary min-w-[85px] text-right">
                          {format(l.qty * l.price_cents)}
                        </span>

                        <button
                          type="button"
                          aria-label={`Remove ${l.name}`}
                          onClick={() => removeFromCart(i)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right 5 Cols: Sticky Receipt & PayPal Settlement */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Order Receipt
                </span>
                <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
                  Payment Summary
                </h2>
              </div>
              <Badge tone="primary" icon="lock">
                {currency}
              </Badge>
            </div>

            <dl className="space-y-2.5 text-body-md tabular-nums">
              <div className="flex justify-between text-on-surface-variant">
                <dt>Items Subtotal ({itemCount} units)</dt>
                <dd className="font-semibold text-on-surface">
                  {format(total)}
                </dd>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <dt>Service &amp; Processing Fee</dt>
                <dd className="font-semibold text-on-surface">{format(fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-outline-variant/50 pt-3 text-headline-md font-bold text-primary">
                <dt>Total Due</dt>
                <dd>{format(grandTotal)}</dd>
              </div>
            </dl>

            {stage === "error" && error ? (
              <div
                role="alert"
                className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-body-sm text-on-error-container flex items-center justify-between gap-2"
              >
                <span>{error}</span>
                <button
                  type="button"
                  className="font-semibold underline shrink-0"
                  onClick={() => setStage("details")}
                >
                  Retry
                </button>
              </div>
            ) : null}

            {paypalClientId && orgId ? (
              <div className="space-y-3 pt-1">
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: "MYR",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    {...buttonProps}
                    disabled={stage !== "paying"}
                  />
                  {!name.trim() || !email.trim() ? (
                    <p className="text-body-sm text-on-surface-variant text-center rounded-xl bg-surface-low p-3 border border-outline-variant/40">
                      Enter your full name and student email in Step 1 to unlock
                      PayPal checkout.
                    </p>
                  ) : stage !== "paying" ? (
                    <Button
                      variant="primary"
                      className="h-11 w-full rounded-full text-label-lg font-semibold"
                      onPress={() => setStage("paying")}
                    >
                      Confirm Details &amp; Pay with PayPal
                    </Button>
                  ) : null}
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="rounded-xl border border-warning/30 bg-warning-container p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge tone="warning" icon="info">
                    Payment Gateway Notice
                  </Badge>
                </div>
                <p className="text-body-sm text-warning leading-relaxed pt-1">
                  PayPal checkout is currently offline in this demo environment
                  until sandbox credentials are configured.
                </p>
              </div>
            )}

            {/* Exclusive PayPal Settlement Notice */}
            <div className="pt-3 border-t border-outline-variant/40 space-y-2.5">
              <div
                className="flex items-center justify-center gap-2"
                aria-label="Exclusive Payment Provider"
              >
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/40 bg-secondary-container/25 px-3.5 py-1.5 text-label-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[17px] text-[#0070ba]">
                    account_balance_wallet
                  </span>
                  <span>PayPal Orders v2 Exclusive Payment</span>
                </span>
              </div>
              <p className="text-[11px] text-center text-on-surface-variant leading-snug">
                All transactions are settled exclusively through PayPal with 100% buyer escrow protection.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
