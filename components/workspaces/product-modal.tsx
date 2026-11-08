"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/app/actions/products";
import { Icon } from "@/components/ui/icon";

export type ProductModalRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  stock: number;
  low_stock_threshold: number;
  sku: string | null;
  status: "active" | "draft" | "archived";
};

const inputCls =
  "focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-on-surface outline-none";

/** Create/edit product modal, validated server-side via productSchema. */
export function ProductModal({
  product,
  onClose,
}: {
  product: ProductModalRow | null;
  onClose: () => void;
}) {
  // Keyed inner form: re-initializes useActionState when switching new ↔ edit.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface-container-lowest p-space-lg shadow-sm shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product ? "Edit product" : "New product"}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md text-on-surface">
            {product ? "Edit product" : "New product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        </div>
        <ProductModalForm key={product?.id ?? "new"} product={product} onClose={onClose} />
      </div>
    </div>
  );
}

function ProductModalForm({
  product,
  onClose,
}: {
  product: ProductModalRow | null;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<ProductActionState, FormData>(
    product ? updateProduct : createProduct,
    null,
  );

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state?.ok, onClose]);

  return (
    <form action={action} className="grid gap-space-md sm:grid-cols-2">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <label className="block sm:col-span-2">
        <span className="text-label-md text-on-surface">Name</span>
        <input
          name="name"
          required
          maxLength={200}
          defaultValue={product?.name ?? ""}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Slug</span>
        <input
          name="slug"
          placeholder="auto from name"
          maxLength={120}
          defaultValue={product?.slug ?? ""}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Category</span>
        <input
          name="category"
          maxLength={60}
          defaultValue={product?.category ?? ""}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Price (RM)</span>
        <input
          name="price"
          required
          inputMode="decimal"
          defaultValue={
            product ? (product.price_cents / 100).toFixed(2) : ""
          }
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">SKU</span>
        <input
          name="sku"
          maxLength={60}
          defaultValue={product?.sku ?? ""}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Stock</span>
        <input
          name="stock"
          type="number"
          min={0}
          required
          defaultValue={product?.stock ?? 0}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Low stock threshold</span>
        <input
          name="low_stock_threshold"
          type="number"
          min={0}
          required
          defaultValue={product?.low_stock_threshold ?? 5}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-label-md text-on-surface">Status</span>
        <select
          name="status"
          defaultValue={product?.status ?? "active"}
          className={`${inputCls} cursor-pointer`}
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="text-label-md text-on-surface">Description</span>
        <textarea
          name="description"
          rows={3}
          maxLength={4000}
          defaultValue={product?.description ?? ""}
          className="focus-aura mt-1 w-full rounded-lg border border-outline-variant bg-surface-low px-4 py-3 text-body-md text-on-surface outline-none"
        />
      </label>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Button
          type="submit"
          variant="primary"
          isDisabled={pending}
          className="h-11 rounded-full px-6 text-label-lg"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onPress={onClose}
          className="h-11 rounded-full px-6 text-label-lg"
        >
          Cancel
        </Button>
      </div>

      {state?.error ? (
        <p className="text-body-sm text-error sm:col-span-2">{state.error}</p>
      ) : null}
    </form>
  );
}
