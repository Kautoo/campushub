"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBag } from "@/context/BagContext";
import { SearchDialog } from "@/components/search/SearchDialog";
import { FastPassModal, Magnet } from "@/components/ui/react-bits";

const NAV_LINKS = [
  { href: "/shop", label: "Store", icon: "storefront" },
  { href: "/copilot", label: "AI Copilot", icon: "auto_awesome" },
  { href: "/clubs", label: "Clubs", icon: "groups" },
  { href: "/campaigns", label: "Charity", icon: "volunteer_activism" },
  { href: "/map", label: "Campus Map", icon: "map" },
  { href: "/organizer", label: "Studio", icon: "hub" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useBag();
  const [searchOpen, setSearchOpen] = useState(false);
  const [fastPassOpen, setFastPassOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {/* REACT BITS SLEEK MINIMAL FLOATING PILL HEADER */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="CampusHub Primary Navigation"
          className="glass-pill rounded-full px-3 py-2 flex items-center justify-between gap-2 md:gap-4 w-full max-w-6xl pointer-events-auto transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(19,27,46,0.1)]"
        >
          {/* Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 pl-2 pr-2 group shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <span className="text-base font-extrabold tracking-tight text-on-surface font-headline">
              CampusHub
            </span>
            <span
              className="flex h-2 w-2 rounded-full bg-secondary-container ring-4 ring-secondary-container/30"
              title="All Systems Operational"
            />
          </Link>

          {/* Center Pill Links (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-1 bg-surface-container-low/80 p-1 rounded-full border border-outline-variant/25">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-container-lowest text-primary shadow-sm transition-all flex items-center gap-1.5"
                      : "px-3.5 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60 transition-all flex items-center gap-1.5"
                  }
                >
                  {link.icon && (
                    <span
                      className={`material-symbols-outlined text-[14px] ${
                        active ? "text-primary" : "text-secondary"
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {link.icon}
                    </span>
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 pr-1 shrink-0">
            {/* Search ⌘K Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Quick Search (⌘K)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-outline-variant/30 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">
                search
              </span>
              <kbd className="font-mono text-[10px] text-outline">⌘K</kbd>
            </button>

            {/* NFC Fast-Pass Quick Trigger */}
            <button
              type="button"
              onClick={() => setFastPassOpen(true)}
              title="Open Verified NFC Campus Fast-Pass"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors relative"
            >
              <span className="material-symbols-outlined text-[19px]">
                qr_code_scanner
              </span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>

            {/* Bag / Checkout Link */}
            <Link
              href="/checkout"
              aria-label="Shopping Bag & Checkout"
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname === "/checkout"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                shopping_bag
              </span>
              <span className="font-mono">{itemCount}</span>
            </Link>

            <div className="h-4 w-[1px] bg-outline-variant/40 mx-0.5 hidden sm:block" />

            {/* Verified Student Profile Dropdown Selection Menu */}
            <div ref={userMenuRef} className="relative">
              <Magnet strength={0.12}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                    userMenuOpen || pathname === "/account"
                      ? "bg-primary text-white"
                      : "bg-on-surface text-surface hover:bg-primary"
                  }`}
                >
                  <span className="hidden sm:inline pl-1 text-xs">Alex R.</span>
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[10px]">
                    AR
                  </div>
                  <span
                    className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
              </Magnet>

              {/* Floating Profile Selection Menu Popover */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-64 rounded-3xl bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/40 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Mini Header */}
                  <div className="p-3 rounded-2xl bg-surface-container-low/80 border border-outline-variant/25 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        AR
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-on-surface truncate">
                          Alex Rivera
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono truncate">
                          CS '26 • #CH-882194
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary-container ring-2 ring-primary/20" />
                    </div>
                  </div>

                  {/* Menu Action Options */}
                  <div className="space-y-1 text-xs font-semibold">
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        pathname === "/account"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        badge
                      </span>
                      <div className="flex-1">
                        <span className="block">Student Profile & ID</span>
                        <span className="text-[10px] opacity-75 font-normal block">
                          3D Lanyard & Academic History
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        pathname === "/register"
                          ? "bg-secondary-container text-on-secondary-fixed"
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        how_to_reg
                      </span>
                      <div className="flex-1">
                        <span className="block">Event Registration</span>
                        <span className="text-[10px] opacity-75 font-normal block">
                          Join hackathons & workshops
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/events"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        pathname === "/events"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        confirmation_number
                      </span>
                      <div className="flex-1">
                        <span className="block">Campus Events & Tickets</span>
                        <span className="text-[10px] opacity-75 font-normal block">
                          Explore schedule & RSVP
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/organizer"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        pathname?.startsWith("/organizer")
                          ? "bg-primary text-on-primary"
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        dashboard
                      </span>
                      <div className="flex-1">
                        <span className="block">Organizer Studio</span>
                        <span className="text-[10px] opacity-75 font-normal block">
                          Manage campus programs
                        </span>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-outline-variant/30" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setFastPassOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-on-surface hover:bg-surface-container-low transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px] text-primary">
                        nfc
                      </span>
                      <div className="flex-1">
                        <span className="block text-primary font-bold">
                          NFC Fast-Pass
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-normal block">
                          Instant reader tap pass
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Floating Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-20 inset-x-4 z-50 lg:hidden glass-pill rounded-3xl p-4 shadow-2xl border border-outline-variant/40 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-low/80 text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {link.icon || "arrow_outward"}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-secondary-container/60 text-on-secondary-fixed"
            >
              <span className="material-symbols-outlined text-[16px]">
                how_to_reg
              </span>
              <span>Event Registration</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-surface-container-low text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">
                badge
              </span>
              <span>Student Profile</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-surface-container-low text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">
                search
              </span>
              <span>Search (⌘K)</span>
            </button>
          </div>
        </div>
      )}

      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <FastPassModal
        isOpen={fastPassOpen}
        onClose={() => setFastPassOpen(false)}
      />
    </>
  );
}
