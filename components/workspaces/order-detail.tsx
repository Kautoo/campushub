"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/lib/money";
import type { OrderWithItems } from "@/components/workspaces/order-grid";
import { OrderStatusButtons } from "@/components/workspaces/order-actions";

const statusTone: Record<string, "success" | "warning" | "neutral" | "error"> = {
  paid: "success",
  fulfilled: "success",
  pending: "warning",
  cancelled: "neutral",
  refunded: "error",
};

/** Slide-in detail panel for a single order: items, totals, status actions. */
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
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-outline-variant bg-surface-lowest p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${order.order_number}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[13px] text-ink-variant">
              {order.order_number}
            </p>
            <h3 className="text-headline-md text-ink">
              {order.customer_name ?? order.customer_email}
            </h3>
            <p className="text-body-sm text-muted">{order.customer_email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-muted hover:bg-surface-container hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge tone={statusTone[order.status] ?? "neutral"}>
            {order.status}
          </Badge>
          <span className="text-body-sm text-muted">
            {new Date(order.created_at).toLocaleString("en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        <h4 className="text-headline-sm mt-6 text-ink">Items</h4>
        <ul className="mt-2 divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {order.order_items.map((it) => (
            <li
              key={it.name_snapshot + it.qty + it.unit_price_cents}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-body-md text-ink">{it.name_snapshot}</p>
                <p className="text-body-sm text-muted">
                  {it.qty} × {formatMoney(it.unit_price_cents, order.currency)}
                </p>
              </div>
              <p className="text-body-md font-semibold text-ink">
                {formatMoney(it.qty * it.unit_price_cents, order.currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1.5 text-body-md">
          <div className="flex justify-between text-ink-variant">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotal_cents || itemsTotal, order.currency)}</dd>
          </div>
          <div className="flex justify-between text-ink-variant">
            <dt>Fee</dt>
            <dd>{formatMoney(order.fee_cents, order.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-outline-variant pt-2 text-headline-sm font-semibold text-ink">
            <dt>Total</dt>
            <dd>{formatMoney(order.total_cents, order.currency)}</dd>
          </div>
        </dl>

        {order.paypal_order_id ? (
          <p className="mt-4 truncate font-mono text-[12px] text-muted">
            PayPal order: {order.paypal_order_id}
          </p>
        ) : null}

        <div className="mt-6">
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
