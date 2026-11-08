"use client";

import { useState, useTransition } from "react";
import { setProductStatus } from "@/app/actions/products";
import { Icon } from "@/components/ui/icon";

/** Archive / activate toggle for a product row. */
export function ProductStatusButton({
  id,
  status,
}: {
  id: string;
  status: "active" | "draft" | "archived";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next: "active" | "archived" =
    status === "archived" ? "active" : "archived";
  const archived = status === "archived";

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await setProductStatus(id, next);
            if (res.error) setError(res.error);
          })
        }
        className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50"
        title={archived ? "Reactivate product" : "Archive product"}
      >
        <Icon name={archived ? "unarchive" : "archive"} size={14} />
        {pending ? "…" : archived ? "Activate" : "Archive"}
      </button>
      {error ? <span className="text-label-sm text-error">{error}</span> : null}
    </span>
  );
}
