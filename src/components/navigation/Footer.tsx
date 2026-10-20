import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 border-t border-outline-variant/25 bg-surface-container-low mt-16">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-outline-variant/20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
              </div>
              <span className="text-lg font-extrabold text-on-surface font-headline tracking-tight">
                CampusHub
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest">
                Academic Horizon
              </span>
            </Link>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
              The unified university ecosystem for curated student experiences,
              recognized societies, 2-hour smart locker commerce, and AI-synced
              academic scheduling.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary pt-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>All Systems Operational • Canvas & Smart Lockers Synced</span>
            </div>
          </div>

          {/* Campus Life & Discovery */}
          <div className="lg:col-span-2 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline font-label">
              Discovery
            </p>
            <ul className="space-y-2 text-xs font-medium text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Explore Campus
                </Link>
              </li>
              <li>
                <Link
                  href="/clubs"
                  className="hover:text-primary transition-colors"
                >
                  Clubs Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-primary transition-colors"
                >
                  Event Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="hover:text-primary transition-colors"
                >
                  Interactive Venue Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Commerce & Escrow */}
          <div className="lg:col-span-3 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline font-label">
              Store & Grants
            </p>
            <ul className="space-y-2 text-xs font-medium text-on-surface-variant">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-primary transition-colors"
                >
                  Official Campus Store
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-primary transition-colors"
                >
                  Shopping Bag & Locker Pickup
                </Link>
              </li>
              <li>
                <Link
                  href="/campaigns"
                  className="hover:text-primary transition-colors"
                >
                  Student Grant Incubator
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/prod_archival_hoodie"
                  className="hover:text-primary transition-colors"
                >
                  Heavyweight Archival Hoodie
                </Link>
              </li>
            </ul>
          </div>

          {/* Intelligence & Identity */}
          <div className="lg:col-span-3 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline font-label">
              Student OS & Studio
            </p>
            <ul className="space-y-2 text-xs font-medium text-on-surface-variant">
              <li>
                <Link
                  href="/copilot"
                  className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-primary"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    auto_awesome
                  </span>
                  AI Copilot Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:text-primary transition-colors"
                >
                  Verified Profile & Credentials
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors"
                >
                  Student Onboarding & NFC ID
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer"
                  className="hover:text-primary transition-colors"
                >
                  Organizer Studio & Event Wizard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <p>
            © 2025 CampusHub University Platform. Crafted with Academic Horizon
            & React Bits.
          </p>
          <div className="flex flex-wrap gap-6 font-medium">
            <Link
              href="/account"
              className="hover:text-primary transition-colors"
            >
              Student Privacy
            </Link>
            <Link href="/map" className="hover:text-primary transition-colors">
              Smart Lockers (94% Free)
            </Link>
            <Link
              href="/organizer"
              className="hover:text-primary transition-colors"
            >
              Organizer API
            </Link>
            <span className="font-mono text-primary font-semibold">
              PayPal Orders API v2
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
