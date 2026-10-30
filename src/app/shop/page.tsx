"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { Product } from "@/types";
import { useBag } from "@/context/BagContext";
import { SpotlightCard, AnimatedContent, GlideSelect } from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

const CATEGORIES = [
  "All Collection",
  "Apparel",
  "Essentials",
  "Tech & Stationery",
  "Laboratory & Safety",
] as const;

const LOCKER_HUBS = [
  {
    id: "union_hub_a",
    name: "Student Union Hub A (#B-01 to #B-48)",
    location: "Ground Floor, West Entrance • Open 24/7",
    freeUnits: "14 Free",
    status: "online",
  },
  {
    id: "science_quad",
    name: "Science Quad Station (#S-01 to #S-24)",
    location: "Engineering Breezeway • Open 6 AM – 11 PM",
    freeUnits: "8 Free",
    status: "online",
  },
  {
    id: "north_dorm",
    name: "North Dormitory Commons (#N-01 to #N-32)",
    location: "Resident Mailroom Lobby • 24/7 Student ID Access",
    freeUnits: "3 Left",
    status: "busy",
  },
];

export default function CampusStorePage() {
  const { addItem, itemCount, subtotal } = useBag();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Collection");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured"
  );
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {}
  );
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [selectedLockerHub, setSelectedLockerHub] = useState("union_hub_a");
  const [lockerSaved, setLockerSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {
        // Keeps verified initial data on offline/network error
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (inStockOnly && !p.inStock) return false;
      if (selectedCategory !== "All Collection") {
        if (selectedCategory === "Apparel") {
          if (
            p.category !== "Apparel" &&
            p.category !== "Faculty Outerwear" &&
            p.category !== "Society Merch"
          ) {
            return false;
          }
        } else if (selectedCategory === "Essentials") {
          if (
            p.category !== "Essentials" &&
            p.category !== "Sustainable Living"
          ) {
            return false;
          }
        } else if (p.category !== selectedCategory) {
          return false;
        }
      }
      if (
        searchQuery.trim() &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.organization.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [selectedCategory, searchQuery, inStockOnly, sortBy]);

  const handleAdd = (product: Product) => {
    const chosenSize =
      selectedSizes[product.id] ||
      product.sizes?.[1] ||
      product.sizes?.[0] ||
      undefined;
    addItem(product, 1, chosenSize);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1600);
  };

  return (
    <main className="relative pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. UNIFIED STORE HERO */}
      <PageHero
        titleLead="Official Collegiate Gear &"
        titleHighlight="Essentials"
        titleTrail="curated for campus."
        description="Heavyweight archival fleece, laboratory safety coats, and insulated campus essentials. Zero platform rake with instant 24/7 Union Smart Locker pickup."
      />

      {/* 2. FILTER, SEARCH & SORT BAR */}
      <section className="sticky top-20 z-30 mb-10">
        <div className="glass-pill rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    active
                      ? "px-4 py-2 rounded-xl text-xs font-bold bg-on-surface text-surface shadow-xs shrink-0 cursor-pointer transition-all"
                      : "px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all shrink-0 cursor-pointer"
                  }
                >
                  {cat === "All Collection"
                    ? `All Collection (${MOCK_PRODUCTS.length})`
                    : cat}
                </button>
              );
            })}
          </div>

          {/* Search, In-Stock Toggle & Sort */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hoodies, flasks, lab coats..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low/80 rounded-xl text-xs text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => setInStockOnly((v) => !v)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  inStockOnly ? "bg-primary" : "bg-outline"
                }`}
              />
              <span className="text-[11px] font-semibold text-on-surface">
                In-Stock Only
              </span>
            </button>

            <GlideSelect
              options={[
                { value: "featured", label: "Sort: Featured", tag: "Curated" },
                { value: "price-asc", label: "Price: Low to High", tag: "↑" },
                { value: "price-desc", label: "Price: High to Low", tag: "↓" },
              ]}
              value={sortBy}
              onChange={(val) =>
                setSortBy(val as "featured" | "price-asc" | "price-desc")
              }
              ariaLabel="Sort products"
              menuWidth={210}
              align="right"
              size="md"
              surfaceColor="#ffffff"
              highlightColor="#c1ee78"
              textColor="#131b2e"
              accentColor="#4b671b"
            />
          </div>
        </div>
      </section>

      {/* 3. REACT BITS SPOTLIGHT PRODUCT CATALOG GRID */}
      <section className="mb-20">
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          stagger={0.08}
          threshold={0.1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filteredProducts.map((product) => {
            const activeSize =
              selectedSizes[product.id] ||
              product.sizes?.[1] ||
              product.sizes?.[0] ||
              "M";
            const isAdded = justAddedId === product.id;
            const isFav = Boolean(favorites[product.id]);

            return (
              <SpotlightCard
                key={product.id}
                className="group bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-4 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
              >
                <div>
                  <div className="relative h-72 rounded-[1.5rem] bg-surface-container-low overflow-hidden mb-4">
                    <Link href={`/shop/${product.id}`} className="block h-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                          product.organization.badge === "Low Stock"
                            ? "bg-amber-400 text-amber-950"
                            : product.organization.badge === "Best Seller"
                            ? "bg-on-surface text-surface"
                            : "bg-secondary-container text-on-secondary-fixed"
                        }`}
                      >
                        {product.organization.badge}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container-lowest/90 backdrop-blur-md text-on-surface">
                        {product.batchDrop || "Campus Drop"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFavorites((prev) => ({
                          ...prev,
                          [product.id]: !prev[product.id],
                        }))
                      }
                      aria-label="Favorite item"
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                        isFav
                          ? "bg-primary text-white"
                          : "bg-surface-container-lowest/80 text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{
                          fontVariationSettings: isFav
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  <div className="px-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                      <span>
                        {product.category} • {product.organization.name}
                      </span>
                      <span className="text-primary flex items-center gap-0.5">
                        ★ {product.rating || 4.9} ({product.reviewCount || 48})
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/shop/${product.id}`}
                        className="text-lg font-extrabold font-headline text-on-surface group-hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-extrabold font-money text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] font-money text-outline line-through block">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="px-2 pb-1">
                  {/* Size / Variant Selector */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/25">
                    {product.sizes && product.sizes.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {product.sizes.slice(0, 5).map((sz) => {
                          const active = activeSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                setSelectedSizes((prev) => ({
                                  ...prev,
                                  [product.id]: sz,
                                }))
                              }
                              className={
                                active
                                  ? "w-7 h-7 rounded-lg text-[10px] font-bold bg-on-surface text-surface cursor-pointer"
                                  : "w-7 h-7 rounded-lg text-[10px] font-bold bg-surface-container-low hover:bg-secondary-container text-on-surface transition-colors cursor-pointer"
                              }
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-on-surface-variant">
                        {product.dispatchNote || "Ready at Union Lockers"}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full bg-[#364e01] ring-2 ring-offset-1 ring-primary"
                        title="Forest Olive"
                      />
                      <span
                        className="w-4 h-4 rounded-full bg-[#131b2e]"
                        title="Oxford Navy"
                      />
                      <span
                        className="w-4 h-4 rounded-full bg-[#d5d7ce]"
                        title="Heather Grey"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className={`flex-1 font-headline font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isAdded
                          ? "bg-secondary-container text-on-secondary-fixed shadow-sm"
                          : "bg-on-surface hover:bg-primary text-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAdded ? "check_circle" : "shopping_bag"}
                      </span>
                      <span>
                        {isAdded
                          ? `Added to Bag (${
                              product.sizes ? activeSize : "1x"
                            })`
                          : "Add to Bag"}
                      </span>
                    </button>
                    <Link
                      href={`/shop/${product.id}`}
                      className="px-3.5 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors"
                      title="Inspect Product Specs"
                    >
                      Specs
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </AnimatedContent>
      </section>

      {/* 4. SMART LOCKER PICKUP STATIONS BANNER */}
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        threshold={0.1}
        className="rounded-[2rem] bg-surface-container-lowest border border-outline-variant/40 p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <span className="material-symbols-outlined text-[14px]">
                qr_code_scanner
              </span>
              Zero-Wait Fulfillment
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-headline text-on-surface tracking-tight mb-2">
              Campus Smart Locker{" "}
              <span className="font-editorial italic font-normal text-primary">
                Network
              </span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-5">
              Select your preferred locker hub during checkout. Once your order
              is packed, unlock your compartment instantly using your CampusHub
              Dynamic QR Student Pass.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLockerSaved(true);
                  setTimeout(() => setLockerSaved(false), 2000);
                }}
                className="bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {lockerSaved
                    ? "Default Locker Saved ✓"
                    : "Set Default Locker"}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  my_location
                </span>
              </button>
              {itemCount > 0 && (
                <Link
                  href="/checkout"
                  className="bg-on-surface hover:bg-primary text-surface font-headline font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2"
                >
                  <span>
                    Checkout Bag ({itemCount} • ${subtotal.toFixed(2)})
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LOCKER_HUBS.map((hub) => {
              const active = selectedLockerHub === hub.id;
              return (
                <div
                  key={hub.id}
                  onClick={() => setSelectedLockerHub(hub.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-surface-container-low border-primary ring-2 ring-primary/15"
                      : "bg-surface-container-low/50 border-outline-variant/30 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        hub.status === "online"
                          ? "bg-primary"
                          : "bg-amber-500"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        hub.status === "online"
                          ? "text-primary bg-secondary-container/50"
                          : "text-amber-900 bg-amber-200/60"
                      }`}
                    >
                      {hub.freeUnits}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold font-headline text-on-surface mb-0.5">
                    {hub.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {hub.location}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedContent>
    </main>
  );
}
