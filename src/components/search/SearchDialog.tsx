"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS, MOCK_CAMPAIGNS } from "@/data/mockData";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ROUTES = [
  { href: "/", label: "Explore Campus", icon: "explore" },
  { href: "/clubs", label: "Clubs Directory", icon: "groups" },
  { href: "/events", label: "Neon 5K Registration", icon: "confirmation_number" },
  { href: "/map", label: "Interactive Venue Map", icon: "map" },
  { href: "/shop", label: "Campus Store", icon: "shopping_bag" },
  { href: "/copilot", label: "AI Copilot Schedule", icon: "auto_awesome" },
  { href: "/account", label: "Verified Student Profile", icon: "verified" },
  { href: "/register", label: "Student ID Onboarding", icon: "badge" },
  { href: "/organizer", label: "Organizer Studio", icon: "dashboard" },
];

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.organization.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_PRODUCTS.slice(0, 4);

  const filteredCampaigns = query.trim()
    ? MOCK_CAMPAIGNS.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.organization.name.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_CAMPAIGNS.slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-20 px-4 bg-on-surface/50 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/25 bg-surface-container-low/60">
          <span
            className="material-symbols-outlined text-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <input
            type="text"
            placeholder="Ask AI Copilot or search clubs, events, smart lockers, archival hoodies..."
            className="flex-1 bg-transparent text-on-surface placeholder:text-outline font-body text-sm focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-[10px] rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant font-mono font-bold"
          >
            ESC
          </button>
        </div>

        {/* Quick Platform Screens */}
        <div className="px-5 py-3 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest shrink-0">
            Jump to:
          </span>
          {QUICK_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low hover:bg-secondary-container text-on-surface-variant hover:text-on-secondary-fixed transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">
                {route.icon}
              </span>
              {route.label}
            </Link>
          ))}
        </div>

        {/* Results Feed */}
        <div className="max-h-[62vh] overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-outline uppercase tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">
                  shopping_bag
                </span>
                Campus Store & Locker Ready Gear ({filteredProducts.length})
              </span>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-primary hover:underline flex items-center gap-1 text-xs font-bold normal-case tracking-normal"
              >
                Full Catalog →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all group"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover bg-surface-container shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {p.organization.name}
                    </p>
                    <p className="font-mono text-xs font-extrabold text-primary mt-0.5">
                      ${p.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-outline uppercase tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">
                  volunteer_activism
                </span>
                Student Initiatives & Grants ({filteredCampaigns.length})
              </span>
              <Link
                href="/campaigns"
                onClick={onClose}
                className="text-primary hover:underline flex items-center gap-1 text-xs font-bold normal-case tracking-normal"
              >
                All Grants →
              </Link>
            </div>
            <div className="space-y-2">
              {filteredCampaigns.map((c) => {
                const pct = Math.round((c.raisedAmount / c.goalAmount) * 100);
                return (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={c.featuredImage}
                        alt={c.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {c.organization.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed shrink-0">
                      {pct}% Funded
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
