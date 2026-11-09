"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/lib/money";
import type { OrderWithItems } from "@/components/workspaces/order-grid";
import { OrderStatusButtons } from "@/components/workspaces/order-actions";

const statusTone: Record<string, "success" | "warning" | "neutral" | "error" | "teal"> = {
  paid: "success",
  fulfilled: "teal",
  pending: "warning",
  cancelled: "neutral",
  refunded: "error",
};

/** Slide-in detail panel for a single order: items, totals, PayPal verification, and status actions. */
export function OrderDetail({
  order,
  onClose,
}: {
  order: OrderWithItems;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const itemsTotal = order.order_items.reduce(
    (s, it) => s + it.qty * it.unit_price_cents,
    0,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-outline-variant/60 bg-surface-lowest p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${order.order_number}`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-surface-container px-2.5 py-0.5 font-mono text-label-md font-bold text-primary">
                  {order.order_number}
                </span>
                <Badge tone={statusTone[order.status] ?? "neutral"}>
                  {order.status}
                </Badge>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface mt-2">
                {order.customer_name ?? "Campus Student"}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {order.customer_email}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Order Meta Strip */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface-low p-3.5 text-body-sm">
            <div>
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant block">
                Placed On
              </span>
              <span className="font-semibold text-on-surface tabular-nums mt-0.5 block">
                {new Date(order.created_at).toLocaleString("en-MY", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div>
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant block">
                Payment Gateway
              </span>
              <span className="font-semibold text-secondary mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">
                  account_balance_wallet
                </span>
                PayPal Orders v2
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h4 className="text-label-md uppercase tracking-wider text-on-surface-variant mb-2.5">
              Purchased Line Items ({order.order_items.length})
            </h4>
            <ul className="divide-y divide-outline-variant/40 rounded-xl border border-outline-variant/50 bg-surface-lowest overflow-hidden">
              {order.order_items.map((it, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-body-md"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface truncate">
                      {it.name_snapshot}
                    </p>
                    <p className="text-body-sm text-on-surface-variant tabular-nums">
                      Qty {it.qty} × {formatMoney(it.unit_price_cents, order.currency)}
                    </p>
                  </div>
                  <span className="font-bold text-primary tabular-nums shrink-0">
                    {formatMoney(it.qty * it.unit_price_cents, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Financial Summary */}
          <dl className="space-y-2 rounded-xl border border-outline-variant/50 bg-surface-low/60 p-4 text-body-md tabular-nums">
            <div className="flex justify-between text-on-surface-variant">
              <dt>Items Subtotal</dt>
              <dd className="font-medium text-on-surface">
                {formatMoney(order.subtotal_cents || itemsTotal, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <dt>Platform &amp; Gateway Fee (2.9% + RM 0.50)</dt>
              <dd className="font-medium text-on-surface">
                {formatMoney(order.fee_cents, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-outline-variant/50 pt-2.5 text-headline-sm font-bold text-primary">
              <dt>Total Settled</dt>
              <dd>{formatMoney(order.total_cents, order.currency)}</dd>
            </div>
          </dl>

          {/* PayPal Reference Audit Box */}
          {order.paypal_order_id ? (
            <div className="rounded-xl border border-outline-variant/40 bg-surface-low/40 p-3.5 space-y-1">
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant block">
                PayPal Settlement Reference
              </span>
              <p className="font-mono text-[12px] text-on-surface break-all">
                Order ID: {order.paypal_order_id}
              </p>
              {order.paypal_capture_id ? (
                <p className="font-mono text-[12px] text-secondary break-all">
                  Capture ID: {order.paypal_capture_id}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 border-t border-outline-variant/40 pt-4">
          <OrderStatusButtons
            orderId={order.id}
            status={order.status}
            onDone={onClose}
          />
        </div>
      </aside>
    </div>
  );
}
