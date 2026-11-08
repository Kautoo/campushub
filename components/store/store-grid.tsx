"use client";

import { useState } from "react";
import { addToCart } from "@/components/store/cart";
import { formatMoney } from "@/lib/money";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images?: string[] | null;
  category: string | null;
  price_cents: number;
  stock: number;
};

// Fallback images matching Stitch merchandise palette if a product has no image
const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "tee-navy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCZoqsNaO5Ex0N6IVf_qkLrMqYjQYpS9fQZd7UOjq6jxmBrFEwyD8YUXaDodlsuiFKADPYe9GJnBXIutDmIQ3YU64oOvxrol49FWL3XBF93KmZo4IRRVyC-yuPm7VfE9ZBFgWQjphAQyGmDuGTVo15bSKE53aAIWtkdn-fOcrvYv8HdCAgpGFJoFyQ5dEPX1xCh19GgEcZOsW4rcVARrn93fx4OpxqUL_cjuPyiCmoO",
  "tee-teal":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgdgBNZAglNUgA4NfljycnAMlSIV439BpXAkAU4H1n1Pb8nm0uXu03hOELtZSWS2xFFV97Ev-sqgYY_Vv9xVv8EGfI0-fAQ4kqKTlCSdAyMx619n311WmaMzMlvaCnZfYxc52v_1fh55E-Ke14GMK7M-NjLw1OSpEeJtmIa9cW9dk38lUcdJpbXdf_sSeb5amGsfJL_SHrdthsW1dYr9P8jWCysYwGhiMiEER_Ehl",
  "hoodie-midnight":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBONDIJOCIm1jFOr9QdvzBv29vbS8tn1Pai5hmfAk2sx2uu58dydkk-138wEQzSgv6M0iTycK8cowKCBp5Hbs0PAapK4jVgfUZvzY81eDZxIBXcBtDhQ-3BxvWQ9MJqKl57jDBK81xbO_sad_e64LjxgQLiIiR3i0M1P7KVA9FikrgUG7zqSJ5qcEkldg2GXYRQ0kI-9dSYeSi1pJQl6qr0ofsmRR1InF9iW83odl_A",
  "sticker-pack":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDD_2YTpJx99AsnOecnGehlcpmmVfxkczvNDIycmJE9GbvAqccUwy5dMpxRCv_tB-Kt_CyAxL3P4syHNjq_FuRIX5uw8vPMBq7xyHQDL0je0NY2masYRF6HD23A0ThNsxBKkRVMi3SwZXyIR9u9-QxsQ6CXXyy_McPjPFBAm_vh74VGKaY0x5Xu5XouFZp4GOvsY815n7Tw3hwfrxhMV2JUWONgkusvbcut--SzP60C",
  "pin-rocket":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2S_NAZYf91_23nGKR1lgk7wuNb1Jf4R9SSitfZftXGqRxLmsmvXTD8wJQwVfQqG87XtnIYRryRis61bPiYuqHbiRGtJWTs-d4K0kHSiNIVZ4Z0Rj4sRMUcW_jqUaz30cmh6zC37lyqpum35h7QZwWwek3CzTGAY5szKrZ31UsBl3QJsTzPRjg-705mpdx4qDr0EnpPDCpmQ5wpzbOJBxwsArG4m3ZSUP7v1vaNiD2",
  "notebook-dotgrid":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0E0_i8ge6BkDxFl3QzbA6OttXNAYbAapvTJFfr7N_tjJob_1JK23MB7zQVHgpDsl2UFwzs1PNF0Jqg1HJLSOrAfhiaYpXtTdXRiUnLqTjWASr73tEpzz1wZ0BdtZUCUmyHTcPw0kvze1RxQX7kX4HIYYAqfVQ3DgORw2Ay_KGbLcpHow7zEf7YJMrEabNbYuLcUMDjyL9GofYJ449Uca0FpPpNvAE6yHfhlCBfRA",
  "tote-canvas":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhwGBAmx0qVOA9hWsPi2LaYs5_qQg89KyZzDDkoEj7gxZ9j61AFBXfiTUlkN55DVFf5K9R7wdqfIg5oU_Q_tuvI8hy-xEElULcqoZNw4JEv-IpOXAkpJ5R_oUzOX8E_8qTx_K5hgK61l27ynj2RNci6A48PpoyvOdHSTsQ1wdSN9gtEDfkVShY7oivDbiZYR1xLOpimqpof3zJiaHn0CP6v9kaCSSWeMs3b83EuTuq",
  "bottle-750":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0rI0hkm4ObQPP6bZ8RRp4h2EuNd7OtQro7xzq12KEf0vDNXvCS8wHPs8br6NfsaVIBYgqcP9JnUdIFXf2qCczzeiJxnzrLzJd2IHYKC1-SiQV8BK2rN2IhocSP12V93SlH_vIs8azHJzoiXYVZohp70sWsRbN479HmxDc_PIaelq1dHDEG2rODtRz162pVYJkXPkp4WnSwMn3BSbTbpNd8GzsLSUA4hMxA9_8Q_u",
};

/**
 * 1:1 Stitch Product Grid Card from `4e0845fd823449faa93d81e37db30de5.html` Section 4.
 */
export function StoreGrid({
  products,
  currency,
}: {
  products: StoreProduct[];
  currency: string;
}) {
  const [addedId, setAddedId] = useState<string | null>(null);

  function add(p: StoreProduct) {
    addToCart({
      product_id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      qty: 1,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
      {products.map((p) => {
        const imageUrl =
          p.images?.[0] ||
          DEFAULT_PRODUCT_IMAGES[p.slug] ||
          DEFAULT_PRODUCT_IMAGES["hoodie-midnight"];
        const isLow = p.stock > 0 && p.stock <= 10;
        const isOut = p.stock <= 0;

        return (
          <article
            key={p.id}
            className="group rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/30 hover:ring-secondary/40 shadow-sm hover:shadow-lg transition-all flex flex-col p-3"
          >
            {/* Image Container with Stitch Zoom & Status Pill */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-surface-container-low mb-3">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
              <span
                className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                  isOut
                    ? "bg-error-container text-on-error-container"
                    : isLow
                      ? "bg-warning-container text-warning"
                      : "bg-tertiary-fixed/40 text-on-tertiary-container"
                }`}
              >
                {isOut ? "Out of Stock" : isLow ? `${p.stock} left` : "Active"}
              </span>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  {p.category ?? "Collegiate Merch"}
                </span>
                <h4 className="font-headline-sm text-body-lg font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1 mt-0.5">
                  {p.name}
                </h4>
                {p.description ? (
                  <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2 mt-1">
                    {p.description}
                  </p>
                ) : null}
              </div>

              {/* Price & Action Button */}
              <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-2">
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {formatMoney(p.price_cents, currency)}
                </span>
                <button
                  type="button"
                  disabled={isOut}
                  onClick={() => add(p)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {addedId === p.id ? "check" : "add_shopping_cart"}
                  </span>
                  <span>{addedId === p.id ? "Added" : isOut ? "Sold" : "Add"}</span>
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
