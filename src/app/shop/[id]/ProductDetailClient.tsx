"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShoppingBag,
  Heart,
  Check,
  Ruler,
  MapPin,
  RefreshCw,
  Lock,
  Star,
  ArrowRight,
  Sparkles,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { useBag } from "@/context/BagContext";
import { PageHero } from "@/components/ui/page-hero";

const SIZE_STOCK: Record<string, number> = {
  XS: 9,
  S: 18,
  M: 24,
  L: 14,
  XL: 11,
  XXL: 6,
};

export function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { addItem, setCampaignContribution } = useBag();

  const initialProduct = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  const [product, setProduct] = useState(initialProduct || null);
  const [notFound, setNotFound] = useState(!initialProduct);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            setProduct(null);
          }
          throw new Error("Failed to load product");
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled && json?.success && json?.data) {
          setProduct(json.data);
          setNotFound(false);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes?.[2] || product?.sizes?.[0] || "M"
  );
  const [quantity, setQuantity] = useState(1);
  const [includeGrant, setIncludeGrant] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  if (notFound || !product) {
    return (
      <main className="relative pt-28 sm:pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-surface-canvas border border-border-default p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container-low flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold font-headline text-on-surface">
              Product Unavailable or Not Found
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              This campus merchandise item is either not published, currently archived, or does not exist.
            </p>
          </div>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs shadow-xs hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Campus Store</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const gallery =
    product.images.length >= 2
      ? product.images
      : [
          product.images[0],
          MOCK_PRODUCTS[1].images[0],
          MOCK_PRODUCTS[2].images[0],
          MOCK_PRODUCTS[3].images[0],
        ];

  const relatedProducts = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(
    0,
    4
  );

  const totalUnitDisplay = product.price * quantity + (includeGrant ? 5 : 0);

  const handleAddToBag = () => {
    addItem(product, quantity, product.sizes ? selectedSize : undefined);
    if (includeGrant) {
      setCampaignContribution({
        campaignId: "camp_weather_balloon",
        title: `${product.organization.name} Equipment Micro-Grant`,
        amount: 5.0,
        tierTitle: "Storefront Add-On Grant",
      });
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, product.sizes ? selectedSize : undefined);
    if (includeGrant) {
      setCampaignContribution({
        campaignId: "camp_weather_balloon",
        title: `${product.organization.name} Equipment Micro-Grant`,
        amount: 5.0,
        tierTitle: "Storefront Add-On Grant",
      });
    }
    router.push("/checkout");
  };

  const badgeText =
    product.batchDrop || product.releaseModel || product.organization.badge;

  return (
    <main className="min-h-screen bg-surface pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHero
          titleLead={product.name.split(" ").slice(0, -1).join(" ")}
          titleHighlight={product.name.split(" ").slice(-1)[0]}
          description={product.description}
        />
      </div>

      {/* 1. Primary Pinterest Pin Closeup Card & Co-Op Requisition Dossier */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="rounded-3xl bg-surface-canvas border border-border-default p-6 md:p-10 pin-shadow grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left 5 Columns: Studio Pin Gallery + Technical Spec Sheet */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-panel border border-border-default/70 shadow-sm">
              <img
                src={gallery[activeImageIdx] || gallery[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />

              {/* Top-Left Batch Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-sm text-[11px] uppercase tracking-wider shadow-2xs">
                  {badgeText}
                </span>
              </div>

              {/* Top-Right Pinterest Pin Save Pill Button */}
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`absolute top-4 right-4 px-4 py-2 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  isSaved
                    ? "bg-secondary text-white"
                    : "bg-primary hover:bg-primary-container text-white"
                }`}
                aria-label="Save to Campus Pinboard"
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                <span>{isSaved ? "Saved to Board" : "Save Pin"}</span>
              </button>
            </div>

            {/* 4-Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIdx === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border-default opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Technical Material & Compliance Card */}
            <div className="rounded-3xl bg-surface-soft/80 border border-border-default p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider">
                  Material & Audit Specifications
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  ISO-LAB-2026
                </span>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3 rounded-2xl bg-surface-canvas border border-border-default/60"
                  >
                    <dt className="text-[10px] font-mono text-text-muted uppercase">
                      {spec.label}
                    </dt>
                    <dd className="font-semibold text-on-surface mt-0.5 leading-snug">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right 7 Columns: Editorial Typography & Co-Op Requisition Configuration */}
          <div className="lg:col-span-7 space-y-8">
            {/* Society Header & Product Title */}
            <div className="space-y-4 border-b border-border-default pb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-primary/15">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-semibold text-primary">
                    {product.organization.name}
                  </span>
                  <span className="text-[10px] font-mono text-secondary uppercase">
                    • {product.organization.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Star className="w-4 h-4 fill-tertiary-container text-tertiary-container" />
                  <span className="font-bold text-on-surface">
                    {product.rating || 4.9}
                  </span>
                  <span className="text-text-muted">
                    ({product.reviewCount || 48} student ratings)
                  </span>
                </div>
              </div>

              <h1 className="font-display-sm md:text-[2.6rem] text-on-surface leading-[1.12]">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <span className="font-money text-3xl font-extrabold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="font-money text-sm text-text-muted line-through">
                    ${product.originalPrice.toFixed(2)} retail
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-money font-semibold">
                  Co-Op Split: ${(product.price * 0.28).toFixed(2)} (28%) → Lab Grants
                </span>
              </div>

              <p className="font-body-lg text-text-secondary leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            {/* 6-Column Apparel Size Matrix (if applicable) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-xs uppercase tracking-wider text-on-surface">
                    Select Fit & Size:{" "}
                    <span className="font-mono text-primary font-bold">
                      {selectedSize}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSizeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Interactive Size & Chest Chart
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {product.sizes.map((sz) => {
                    const active = selectedSize === sz;
                    const left = SIZE_STOCK[sz] || 12;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface-canvas hover:bg-surface-soft text-on-surface border-border-default"
                        }`}
                      >
                        <span className="block font-mono text-sm font-bold">
                          {sz}
                        </span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            active ? "text-white/80" : "text-text-muted"
                          }`}
                        >
                          {left} Left
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Optional $5 Society Research Micro-Grant */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity Counter */}
                <div className="inline-flex items-center justify-between sm:justify-start gap-4 px-4 py-3 rounded-2xl bg-surface-canvas border border-border-default">
                  <span className="text-xs font-label-sm text-text-muted uppercase">
                    Qty
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-surface-soft hover:bg-surface-panel flex items-center justify-center text-on-surface"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-sm font-bold w-5 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-lg bg-surface-soft hover:bg-surface-panel flex items-center justify-center text-on-surface"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional $5 Guild Grant Add-on */}
                <label className="flex-1 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-low/80 border border-primary/20 cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={includeGrant}
                      onChange={(e) => setIncludeGrant(e.target.checked)}
                      className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        Add +$5.00 Student Lab Equipment Micro-Grant
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        100% direct contribution to {product.organization.name}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-secondary shrink-0">
                    +$5.00
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className={`py-4 px-6 rounded-full font-label-lg text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                    justAdded
                      ? "bg-status-success text-white"
                      : "bg-primary hover:bg-primary-container text-white"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Requisition Tray (${totalUnitDisplay.toFixed(2)})
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Requisition Tray • ${totalUnitDisplay.toFixed(2)}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-4 px-6 rounded-full bg-surface-soft hover:bg-surface-panel text-on-surface border border-border-default font-label-lg text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Express Escrow Settlement</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </button>
              </div>
            </div>

            {/* 3-Card Campus Fulfillment & Protection Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-surface-soft/70 border border-border-default space-y-1.5">
                <MapPin className="w-4 h-4 text-secondary" />
                <p className="font-label-md text-xs text-on-surface">
                  Union Desk B Pickup
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Collect Wed & Fri 12:00–17:00 using your Student ID QR token.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-soft/70 border border-border-default space-y-1.5">
                <RefreshCw className="w-4 h-4 text-primary" />
                <p className="font-label-md text-xs text-on-surface">
                  7-Day Free Size Swap
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Instant garment size exchange at any society fitting booth.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-soft/70 border border-border-default space-y-1.5">
                <Lock className="w-4 h-4 text-status-success" />
                <p className="font-label-md text-xs text-on-surface">
                  Zero-Fee Society Payout
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Audited by the Student Union Treasury with 0% platform rake.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 100% Revenue Transparency & SVG Donut Chart Breakdown (from Screen 06) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="rounded-3xl bg-surface-canvas border border-border-default p-8 md:p-12 pin-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 Cols: Narrative & Breakdown Bars */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="font-label-sm text-secondary uppercase tracking-widest text-xs">
                  Open-Book Society Economics
                </span>
                <h2 className="font-display-sm text-on-surface">
                  Where Every Dollar of Your{" "}
                  <span className="italic font-normal text-primary">
                    ${product.price.toFixed(2)} Goes
                  </span>
                </h2>
                <p className="font-body-md text-text-secondary max-w-xl">
                  {product.societyImpact}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-soft border border-border-default/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-label-md text-sm text-on-surface">
                        Certified Fabrication & Lab-Grade Textiles
                      </p>
                      <p className="text-xs text-text-secondary">
                        Direct factory batch production & embroidery
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-on-surface">62%</p>
                    <p className="text-xs text-text-muted">
                      ${(product.price * 0.62).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-soft border border-border-default/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-secondary shrink-0" />
                    <div>
                      <p className="font-label-md text-sm text-on-surface">
                        {product.organization.name} Student Grant Pool
                      </p>
                      <p className="text-xs text-text-secondary">
                        Funds student lab subsidies, competitions & field workshops
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-secondary">28%</p>
                    <p className="text-xs text-text-muted">
                      ${(product.price * 0.28).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-soft border border-border-default/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-tertiary-container shrink-0" />
                    <div>
                      <p className="font-label-md text-sm text-on-surface">
                        Desk B QR Logistics & Recyclable Packaging
                      </p>
                      <p className="text-xs text-text-secondary">
                        Zero-plastic garment bags & student union sorting
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-tertiary">10%</p>
                    <p className="text-xs text-text-muted">
                      ${(product.price * 0.1).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: SVG Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-soft border border-border-default/60">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#eef2f6"
                    strokeWidth="12"
                  />
                  {/* 62% Primary */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#00306f"
                    strokeWidth="12"
                    strokeDasharray="148 238.76"
                    strokeDashoffset="0"
                  />
                  {/* 28% Secondary */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#00696b"
                    strokeWidth="12"
                    strokeDasharray="66.85 238.76"
                    strokeDashoffset="-148"
                  />
                  {/* 10% Tertiary */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#caa900"
                    strokeWidth="12"
                    strokeDasharray="23.87 238.76"
                    strokeDashoffset="-214.85"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-serif text-3xl font-bold text-on-surface">
                    1,240
                  </span>
                  <span className="text-[11px] font-label-sm text-text-secondary uppercase tracking-wider mt-0.5">
                    Students Outfitted
                  </span>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-status-success font-mono text-[10px] font-bold">
                    0% Platform Cut
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Related Visual Pins */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-label-sm text-secondary uppercase tracking-widest text-xs block mb-1">
              More Like This on Campus Boards
            </span>
            <h2 className="font-headline-lg text-on-surface">
              Paired Co-Op Pins & Essentials
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-label-lg text-primary hover:underline flex items-center gap-1"
          >
            Explore All Boards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              href={`/shop/${item.id}`}
              className="group block space-y-2.5"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-panel pin-shadow group-hover:pin-shadow-hover transition-all">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-[10px] font-label-sm text-on-surface uppercase">
                  {item.batchDrop || item.releaseModel || item.organization.badge}
                </span>
              </div>
              <div className="px-1.5">
                <p className="text-[11px] text-text-secondary">
                  {item.organization.name}
                </p>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <p className="font-serif font-semibold text-base text-on-surface group-hover:text-primary transition-colors truncate">
                    {item.name}
                  </p>
                  <span className="font-mono text-xs font-bold text-primary bg-surface-container-low px-2 py-0.5 rounded-md shrink-0">
                    ${item.price.toFixed(0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Size Guide Modal */}
      {sizeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs"
          onClick={() => setSizeModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-surface-canvas border border-border-default p-6 md:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-label-sm text-secondary uppercase tracking-widest">
                  Union Garment Standard
                </span>
                <h3 className="font-headline-md text-on-surface">
                  Apparel & Lab Coat Sizing Matrix
                </h3>
              </div>
              <button
                onClick={() => setSizeModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-soft text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-default text-text-muted font-mono uppercase">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Chest (cm)</th>
                    <th className="py-2.5">Length (cm)</th>
                    <th className="py-2.5">Sleeve (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60 font-mono">
                  {[
                    ["XS", "86–91", "94", "59"],
                    ["S", "92–97", "96", "61"],
                    ["M", "98–103", "98", "63"],
                    ["L", "104–110", "100", "65"],
                    ["XL", "111–117", "102", "67"],
                    ["XXL", "118–124", "104", "69"],
                  ].map(([sz, chest, len, slv]) => (
                    <tr key={sz} className="hover:bg-surface-soft">
                      <td className="py-2.5 font-bold text-primary">{sz}</td>
                      <td className="py-2.5 text-on-surface">{chest}</td>
                      <td className="py-2.5 text-on-surface">{len}</td>
                      <td className="py-2.5 text-on-surface">{slv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-text-secondary">
              Between sizes? We recommend sizing up if wearing laboratory coats over winter knitwear. Free 7-day swaps available at Student Union Desk B.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

