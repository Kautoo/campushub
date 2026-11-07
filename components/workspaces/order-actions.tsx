"use client";

import { useState, useTransition } from "react";
import { setOrderStatus } from "@/app/actions/orders";
import { Icon } from "@/components/ui/icon";

/** Fulfill / cancel buttons for an order, per allowed transitions. */
export function OrderStatusButtons({
  orderId,
  status,
  onDone,
}: {
  orderId: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canFulfill = status === "paid";
  const canCancel = status === "pending";
  if (!canFulfill && !canCancel) return null;

  const run = (next: "fulfilled" | "cancelled") =>
    startTransition(async () => {
      setError(null);
      const res = await setOrderStatus(orderId, next);
      if (res.error) setError(res.error);
      else onDone?.();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canFulfill ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("fulfilled")}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-label-lg font-semibold text-[var(--accent-foreground)] disabled:opacity-50"
        >
          <Icon name="local_shipping" size={16} />
          {pending ? "Working…" : "Mark fulfilled"}
        </button>
      ) : null}
      {canCancel ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("cancelled")}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant px-4 py-2 text-label-lg font-semibold text-ink-variant hover:bg-surface-container hover:text-ink disabled:opacity-50"
        >
          <Icon name="cancel" size={16} />
          {pending ? "Working…" : "Cancel order"}
        </button>
      ) : null}
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
    </div>
  );
}
