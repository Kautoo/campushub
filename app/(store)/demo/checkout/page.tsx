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
  removeFromCart,
  clearCart,
  type CartLine,
} from "@/components/store/cart";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

type Stage = "cart" | "details" | "paying" | "done" | "error";
type DbOrder = { id: string; order_number: string; total_cents: number };

/** Stitch checkout stepper — Items → Details → Payment → Done, mapped onto the stage machine. */
const STEPS = [
  { key: "cart", label: "Items", icon: "shopping_bag" },
  { key: "details", label: "Details", icon: "badge" },
  { key: "paying", label: "Payment", icon: "account_balance_wallet" },
  { key: "done", label: "Done", icon: "check_circle" },
] as const;

function Stepper({ stage }: { stage: Stage }) {
  const current =
    stage === "error" ? 1 : STEPS.findIndex((s) => s.key === stage);
  const idx = current < 0 ? 0 : current;
  return (
    <div
      className="flex items-center gap-space-sm"
      aria-label="Checkout progress"
    >
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-space-sm">
          <div
            aria-current={i === idx ? "step" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-label-sm text-label-sm ${
              i < idx
                ? "bg-tertiary-fixed/30 text-on-tertiary-container"
                : i === idx
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {i < idx ? "check" : s.icon}
            </span>
            {s.label}
          </div>
          {i < STEPS.length - 1 ? (
            <span aria-hidden className="w-6 h-0.5 bg-secondary rounded-full" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("cart");
  const [error, setError] = useState<string | null>(null);
  const [dbOrder, setDbOrder] = useState<DbOrder | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Sync external stores (localStorage + fetch) into state from callbacks;
    // the cart read is deferred a tick so the effect body stays a pure sync.
    const raf = requestAnimationFrame(() => setCart(readCart()));
    fetch("/api/store-config")
      .then((r) => r.json())
      .then((cfg: { org_id?: string; paypal_client_id?: string | null }) => {
        if (cfg.org_id) setOrgId(cfg.org_id);
        if (cfg.paypal_client_id) setPaypalClientId(cfg.paypal_client_id);
      })
      .catch(() => setError("Store unavailable."));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only store sync
  }, []);

  const total = cart.reduce((s, l) => s + l.qty * l.price_cents, 0);
  const fee = Math.round((total * 29) / 1000) + 50;

  async function placeOrderAndPay(): Promise<string> {
    // 1. create DB order (server validates stock/price)
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
    // 2. create PayPal order from DB total
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
      setError("PayPal error — try again.");
      setStage("error");
    },
  };

  if (stage === "done") {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
        <span className="material-symbols-outlined text-[48px] text-success">
          check_circle
        </span>
        <h1 className="text-headline-lg text-on-surface mt-2">
          Payment complete
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          Order {dbOrder?.order_number} is confirmed. A receipt is on its way to{" "}
          {email}.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/demo"
            className="focus-aura bg-primary text-white dark:text-[#00201c] inline-flex h-11 items-center rounded-full px-6 text-label-lg font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-space-xl">
      <div className="flex flex-col gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Checkout
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Guest checkout — pay with PayPal.
          </p>
        </div>
        <Stepper stage={stage} />
      </div>

      {cart.length === 0 ? (
        <div className="mt-space-xl rounded-xl bg-surface-container-low p-10 text-center">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
            shopping_bag
          </span>
          <p className="font-headline-sm text-headline-sm text-on-surface mt-2">
            Your cart is empty
          </p>
          <Link
            href="/demo"
            className="text-primary mt-3 inline-block font-label-lg text-label-lg font-semibold"
          >
            Browse the store →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-5">
          {/* Cart lines */}
          <section className="md:col-span-3 space-y-3">
            {cart.map((l, i) => (
              <div
                key={`${l.product_id ?? l.tier_id}-${i}`}
                className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-lowest px-4 py-3"
              >
                <div>
                  <p className="text-body-md text-on-surface">{l.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {l.qty} × {formatMoney(l.price_cents)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-headline-sm text-on-surface">
                    {formatMoney(l.qty * l.price_cents)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${l.name}`}
                    onClick={() => {
                      removeFromCart(i);
                      setCart(readCart());
                    }}
                    className="text-on-surface-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Summary + pay */}
          <section className="md:col-span-2">
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Summary
              </h2>
              <dl className="mt-3 space-y-2 text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(total)}</dd>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <dt>Fee (2.9% + RM 0.50)</dt>
                  <dd>{formatMoney(fee)}</dd>
                </div>
                <div className="flex justify-between border-t border-outline-variant pt-2 text-headline-sm font-semibold text-on-surface">
                  <dt>Total</dt>
                  <dd>{formatMoney(total + fee)}</dd>
                </div>
              </dl>

              {stage === "error" ? (
                <p
                  role="alert"
                  className="mt-3 rounded-lg bg-error-container px-3 py-2 text-body-sm text-error"
                >
                  {error}
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => setStage("details")}
                  >
                    Retry
                  </button>
                </p>
              ) : null}

              {paypalClientId && orgId ? (
                <div className="mt-4">
                  {stage !== "paying" ? (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-label-md text-on-surface">
                          Name
                        </span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-on-surface outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-label-md text-on-surface">
                          Email
                        </span>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          required
                          className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-on-surface outline-none"
                        />
                      </label>
                    </div>
                  ) : null}
                  <div className={stage === "paying" ? "" : "mt-4"}>
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
                      {!name || !email ? (
                        <p className="text-body-sm text-on-surface-variant mt-2 text-center">
                          Enter your name and email to enable PayPal.
                        </p>
                      ) : (
                        <Button
                          variant="primary"
                          className="mt-3 h-11 w-full rounded-full text-label-lg"
                          onPress={() => setStage("paying")}
                        >
                          Continue to PayPal
                        </Button>
                      )}
                    </PayPalScriptProvider>
                  </div>
                  {/* Supported gateways — display-only branding; PayPal button above is the real flow */}
                  <div
                    className="mt-4 flex items-center justify-center gap-2"
                    aria-label="Supported payment methods"
                  >
                    {["PayPal", "FPX", "Visa", "Mastercard"].map((g) => (
                      <span
                        key={g}
                        className="rounded-md bg-surface-container-low px-2 py-1 font-label-sm text-[10px] font-bold tracking-wide text-on-surface-variant"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-warning-container px-3 py-3 text-center">
                  <Badge tone="warning">Checkout disabled</Badge>
                  <p className="text-body-sm text-warning mt-1">
                    PayPal keys are not configured. Set PAYPAL_CLIENT_ID and
                    NEXT_PUBLIC_PAYPAL_CLIENT_ID — see README.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
