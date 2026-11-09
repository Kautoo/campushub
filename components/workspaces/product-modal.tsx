"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/app/actions/products";
import { Badge } from "@/components/ui/badge";

export type ProductModalRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images?: string[] | null;
  category: string | null;
  price_cents: number;
  stock: number;
  low_stock_threshold: number;
  sku: string | null;
  status: "active" | "draft" | "archived";
};

const PRODUCT_PHOTO_PRESETS = [
  {
    label: "Navy Crest Tee",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZoqsNaO5Ex0N6IVf_qkLrMqYjQYpS9fQZd7UOjq6jxmBrFEwyD8YUXaDodlsuiFKADPYe9GJnBXIutDmIQ3YU64oOvxrol49FWL3XBF93KmZo4IRRVyC-yuPm7VfE9ZBFgWQjphAQyGmDuGTVo15bSKE53aAIWtkdn-fOcrvYv8HdCAgpGFJoFyQ5dEPX1xCh19GgEcZOsW4rcVARrn93fx4OpxqUL_cjuPyiCmoO",
  },
  {
    label: "Teal Logo Tee",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgdgBNZAglNUgA4NfljycnAMlSIV439BpXAkAU4H1n1Pb8nm0uXu03hOELtZSWS2xFFV97Ev-sqgYY_Vv9xVv8EGfI0-fAQ4kqKTlCSdAyMx619n311WmaMzMlvaCnZfYxc52v_1fh55E-Ke14GMK7M-NjLw1OSpEeJtmIa9cW9dk38lUcdJpbXdf_sSeb5amGsfJL_SHrdthsW1dYr9P8jWCysYwGhiMiEER_Ehl",
  },
  {
    label: "Midnight Hoodie",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBONDIJOCIm1jFOr9QdvzBv29vbS8tn1Pai5hmfAk2sx2uu58dydkk-138wEQzSgv6M0iTycK8cowKCBp5Hbs0PAapK4jVgfUZvzY81eDZxIBXcBtDhQ-3BxvWQ9MJqKl57jDBK81xbO_sad_e64LjxgQLiIiR3i0M1P7KVA9FikrgUG7zqSJ5qcEkldg2GXYRQ0kI-9dSYeSi1pJQl6qr0ofsmRR1InF9iW83odl_A",
  },
  {
    label: "Vinyl Sticker Pack",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD_2YTpJx99AsnOecnGehlcpmmVfxkczvNDIycmJE9GbvAqccUwy5dMpxRCv_tB-Kt_CyAxL3P4syHNjq_FuRIX5uw8vPMBq7xyHQDL0je0NY2masYRF6HD23A0ThNsxBKkRVMi3SwZXyIR9u9-QxsQ6CXXyy_McPjPFBAm_vh74VGKaY0x5Xu5XouFZp4GOvsY815n7Tw3hwfrxhMV2JUWONgkusvbcut--SzP60C",
  },
  {
    label: "Enamel Rocket Pin",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2S_NAZYf91_23nGKR1lgk7wuNb1Jf4R9SSitfZftXGqRxLmsmvXTD8wJQwVfQqG87XtnIYRryRis61bPiYuqHbiRGtJWTs-d4K0kHSiNIVZ4Z0Rj4sRMUcW_jqUaz30cmh6zC37lyqpum35h7QZwWwek3CzTGAY5szKrZ31UsBl3QJsTzPRjg-705mpdx4qDr0EnpPDCpmQ5wpzbOJBxwsArG4m3ZSUP7v1vaNiD2",
  },
  {
    label: "Dot Grid Notebook",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0E0_i8ge6BkDxFl3QzbA6OttXNAYbAapvTJFfr7N_tjJob_1JK23MB7zQVHgpDsl2UFwzs1PNF0Jqg1HJLSOrAfhiaYpXtTdXRiUnLqTjWASr73tEpzz1wZ0BdtZUCUmyHTcPw0kvze1RxQX7kX4HIYYAqfVQ3DgORw2Ay_KGbLcpHow7zEf7YJMrEabNbYuLcUMDjyL9GofYJ449Uca0FpPpNvAE6yHfhlCBfRA",
  },
  {
    label: "Canvas Tote Bag",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhwGBAmx0qVOA9hWsPi2LaYs5_qQg89KyZzDDkoEj7gxZ9j61AFBXfiTUlkN55DVFf5K9R7wdqfIg5oU_Q_tuvI8hy-xEElULcqoZNw4JEv-IpOXAkpJ5R_oUzOX8E_8qTx_K5hgK61l27ynj2RNci6A48PpoyvOdHSTsQ1wdSN9gtEDfkVShY7oivDbiZYR1xLOpimqpof3zJiaHn0CP6v9kaCSSWeMs3b83EuTuq",
  },
  {
    label: "Steel Water Bottle",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0rI0hkm4ObQPP6bZ8RRp4h2EuNd7OtQro7xzq12KEf0vDNXvCS8wHPs8br6NfsaVIBYgqcP9JnUdIFXf2qCczzeiJxnzrLzJd2IHYKC1-SiQV8BK2rN2IhocSP12V93SlH_vIs8azHJzoiXYVZohp70sWsRbN479HmxDc_PIaelq1dHDEG2rODtRz162pVYJkXPkp4WnSwMn3BSbTbpNd8GzsLSUA4hMxA9_8Q_u",
  },
];

const inputCls =
  "focus-aura mt-1 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors";

export function ProductModal({
  product,
  onClose,
}: {
  product: ProductModalRow | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={product ? "Edit product" : "New product"}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-outline-variant/70 bg-surface-lowest p-6 sm:p-8 shadow-2xl opacity-100 space-y-6">
        <ProductModalForm
          key={product?.id ?? "new"}
          product={product}
          onClose={onClose}
        />
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

  // Live state for Wix-style real-time product card preview
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(
    product ? (product.price_cents / 100).toFixed(2) : "45.00",
  );
  const [category, setCategory] = useState(product?.category ?? "Apparel");
  const [imageUrl, setImageUrl] = useState(
    product?.images?.[0] ?? PRODUCT_PHOTO_PRESETS[0].url,
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(product?.stock ?? 50);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state?.ok, onClose]);

  const numPrice = Number(price) || 0;

  return (
    <form action={action} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Badge tone="teal" icon="inventory_2">
              Catalog SKU Studio
            </Badge>
            {product?.id ? (
              <Link
                href={`/demo/products/${product.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
              >
                <span>View live on storefront</span>
                <span className="material-symbols-outlined text-[13px]">
                  open_in_new
                </span>
              </Link>
            ) : null}
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">
            {product?.id ? "Edit Merchandise SKU" : "Add New Merchandise Item"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Wix-style Edit vs Storefront Preview Tab Switcher */}
          <div className="inline-flex rounded-xl border border-outline-variant/60 bg-surface-low p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode("edit")}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
                previewMode === "edit"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Form Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1 ${
                previewMode === "preview"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                visibility
              </span>
              <span>Live Store Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>
      </div>

      {/* Wix-Style Live Storefront Product Card Preview */}
      {previewMode === "preview" ? (
        <div className="space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-low/70 p-6">
          <div className="flex items-center justify-between">
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
              Wix Live Product Card Preview
            </span>
            <span className="text-xs text-on-surface-variant">
              Updates in real time as you edit
            </span>
          </div>

          <div className="max-w-xs mx-auto rounded-2xl bg-surface-lowest border border-outline-variant/60 shadow-lg overflow-hidden flex flex-col">
            <div className="relative h-48 w-full bg-surface-low overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <Badge tone="primary">{category || "Merch"}</Badge>
                <Badge tone={stock === 0 ? "error" : stock <= 5 ? "warning" : "success"}>
                  {stock === 0 ? "Out of Stock" : `${stock} in stock`}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <span className="font-mono text-[11px] text-on-surface-variant">
                {sku || "SKU-CODE"}
              </span>
              <p className="text-headline-sm font-bold text-on-surface truncate">
                {name || "Untitled Product"}
              </p>
              <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    Member Price
                  </span>
                  <span className="text-headline-sm font-bold text-primary tabular-nums">
                    RM {numPrice.toFixed(2)}
                  </span>
                </div>
                <span className="rounded-full bg-primary text-on-primary px-3 py-1 text-label-sm font-semibold">
                  Add to Bag
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-space-md sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-label-md font-semibold text-on-surface">
            Item Name
          </span>
          <input
            name="name"
            required
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CampusHub Tee — Navy"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            URL Slug
          </span>
          <input
            name="slug"
            placeholder="auto-generated from name"
            maxLength={120}
            defaultValue={product?.slug ?? ""}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Merchandise Category
          </span>
          <input
            name="category"
            maxLength={60}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Apparel, Tech, Merch, Stationery"
            className={inputCls}
          />
        </label>

        {/* Photo Customizer Section */}
        <div className="sm:col-span-2 space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-low/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-bold text-on-surface">
              Product Photo Customizer (Displayed on Storefront &amp; PDP)
            </span>
            <span className="text-xs text-secondary font-semibold">
              Official Merch Gallery
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRODUCT_PHOTO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className={`relative h-20 rounded-xl overflow-hidden border transition-all text-left group ${
                  imageUrl === preset.url
                    ? "ring-2 ring-secondary border-secondary scale-102"
                    : "border-outline-variant/60 hover:border-secondary/60 opacity-80 hover:opacity-100"
                }`}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${preset.url}')` }}
                />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors" />
                <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold text-white leading-tight drop-shadow truncate">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          <label className="block pt-1">
            <span className="text-label-sm font-semibold text-on-surface-variant">
              Or paste custom Product Image URL
            </span>
            <input
              name="image_url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Price (RM)
          </span>
          <input
            name="price"
            required
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            SKU Code
          </span>
          <input
            name="sku"
            maxLength={60}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="TS-TEE-NVY"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Inventory Units in Stock
          </span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Low Stock Alert Threshold
          </span>
          <input
            name="low_stock_threshold"
            type="number"
            min={0}
            required
            defaultValue={product?.low_stock_threshold ?? 5}
            className={inputCls}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-label-md font-semibold text-on-surface">
            Publication Status
          </span>
          <select
            name="status"
            defaultValue={product?.status ?? "active"}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="active">Active (Visible on Storefront &amp; PDP)</option>
            <option value="draft">Draft (Hidden from storefront)</option>
            <option value="archived">Archived (Catalog history only)</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-label-md font-semibold text-on-surface">
            Product Description &amp; Material Notes
          </span>
          <textarea
            name="description"
            rows={3}
            maxLength={4000}
            defaultValue={product?.description ?? ""}
            placeholder="100% cotton, heavyweight embroidered crest, campus union pick-up..."
            className="focus-aura mt-1.5 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 py-3 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors"
          />
        </label>
      </div>

      {state?.error ? (
        <p className="rounded-xl border border-error/30 bg-error-container p-3 text-body-sm text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/40">
        <p className="text-xs text-on-surface-variant">
          Edits revalidate and update the public storefront catalog immediately.
        </p>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="button"
            variant="ghost"
            onPress={onClose}
            className="h-11 rounded-full px-6 text-label-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={pending}
            className="h-11 rounded-full px-7 text-label-lg font-semibold shadow-xs"
          >
            {pending
              ? "Saving…"
              : product
                ? "Save Changes"
                : "Create & Publish Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
