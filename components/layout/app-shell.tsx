"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Icon } from "@/components/ui/icon";

export type NavItem = { href: string; label: string; icon: string };
export type NavSection = { title: string; items: NavItem[] };

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Executive Overview",
  "/dashboard/ai-insights": "AI Commerce Intelligence",
  "/dashboard/events": "Events & Venue Scheduler",
  "/dashboard/registrations": "Registrations & Gate Check-In",
  "/dashboard/products": "Product & SKU Catalog",
  "/dashboard/orders": "Order Fulfillment",
  "/dashboard/transactions": "Transactions & Webhooks",
  "/dashboard/members": "Committee & Access Control",
  "/dashboard/notifications": "Activity & Alerts",
  "/dashboard/reports": "Audit Reports & CSV Exports",
  "/dashboard/settings": "Organization Settings",
  "/dashboard/help": "Documentation & Runbook",
};

export function AppShell({
  orgName,
  userInitials,
  unreadCount = 0,
  nav,
  children,
}: {
  orgName: string;
  userInitials: string;
  unreadCount?: number;
  nav: NavSection[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const allItems = nav.flatMap((s) => s.items);
  const results = query
    ? allItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const currentPageLabel = ROUTE_TITLES[pathname] ?? "Workspace";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Workspace Header */}
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-lowest/90 backdrop-blur-xl z-40 border-b border-outline-variant/45">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 lg:px-8">
          {/* Breadcrumb Context */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-2.5 py-1 bg-surface-low rounded-lg border border-outline-variant/40 text-on-surface hover:bg-surface-container transition-colors shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-label-md font-bold truncate max-w-[140px]">
                {orgName}
              </span>
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                unfold_more
              </span>
            </Link>
            <span className="text-outline-variant text-body-sm hidden sm:inline">
              /
            </span>
            <span className="text-label-lg font-semibold text-on-surface truncate hidden sm:inline">
              {currentPageLabel}
            </span>
          </div>

          {/* Right Command Actions */}
          <div className="flex items-center gap-2">
            {/* Command Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="focus-aura hidden h-9 w-60 items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-low/80 px-3 text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors md:flex"
            >
              <span className="material-symbols-outlined text-[17px]">
                search
              </span>
              <span>Quick jump…</span>
              <kbd className="ml-auto rounded border border-outline-variant/60 bg-surface-lowest px-1.5 py-0.2 font-mono text-[10px] font-semibold">
                ⌘K
              </kbd>
            </button>

            {/* Quick Link to Public Storefront */}
            <Link
              href="/demo"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3 text-label-md font-semibold text-primary hover:bg-surface-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                storefront
              </span>
              <span>Live Storefront</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                open_in_new
              </span>
            </Link>

            <Link
              href="/dashboard/notifications"
              aria-label={`Notifications (${unreadCount} unread)`}
              className="focus-aura relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-lowest text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">
                notifications
              </span>
              {unreadCount > 0 ? (
                <span className="bg-error absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white tabular-nums">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>

            <ThemeToggle />

            <span
              aria-label="Account"
              className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-label-md font-bold text-on-primary shadow-2xs"
            >
              {userInitials || "?"}
            </span>
          </div>
        </div>
      </header>

      {/* Left Fixed Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-surface-lowest z-50 flex-col justify-between border-r border-outline-variant/45 lg:flex">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-5">
          {/* Brand Lockup */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px] text-secondary-fixed">
                  school
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-headline-sm font-bold text-primary leading-tight tracking-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  ORGANIZER 2.0
                </span>
              </div>
            </Link>
            <span className="rounded-full bg-tertiary-fixed/35 px-2 py-0.5 text-[10px] font-bold text-on-tertiary-container">
              v2.0
            </span>
          </div>

          {/* Navigation Groups */}
          <div className="flex flex-col gap-6">
            {nav.map((section) => (
              <div key={section.title} className="flex flex-col gap-1.5">
                <span className="px-2.5 text-[10.5px] uppercase tracking-widest text-on-surface-variant font-bold">
                  {section.title}
                </span>
                <nav className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-all",
                          active
                            ? "bg-primary text-on-primary font-semibold shadow-xs"
                            : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface font-medium",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "material-symbols-outlined text-[19px]",
                              active ? "text-secondary-fixed" : "",
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="text-label-lg">{item.label}</span>
                        </div>
                        {item.href === "/dashboard/notifications" &&
                        unreadCount > 0 ? (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
                              active
                                ? "bg-secondary-fixed text-on-secondary-fixed"
                                : "bg-error-container text-error",
                            )}
                          >
                            {unreadCount}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Organization Card */}
        <div className="p-4 border-t border-outline-variant/40 space-y-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between p-2.5 bg-surface-low rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center text-label-md font-bold shrink-0">
                {orgName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-label-md font-bold text-on-surface truncate">
                  {orgName}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  Verified Society · MYR
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              settings
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-outline-variant bg-surface-lowest py-2 lg:hidden">
        {allItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1",
              isActive(item.href)
                ? "text-primary font-semibold"
                : "text-on-surface-variant",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="pt-16 pb-20 lg:pl-72 lg:pb-0 bg-surface min-h-screen flex flex-col justify-between">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
        <footer className="mt-12 border-t border-outline-variant/45 bg-surface-lowest/60 px-4 py-5 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm text-on-surface-variant">
            <p>
              CampusHub 2.0 Organizer Console · Powered by AG Grid Community &amp; Bryntum Scheduler
            </p>
            <div className="flex items-center gap-4">
              <Link href="/demo" className="hover:text-primary transition-colors">
                Public Storefront
              </Link>
              <Link href="/styleguide" className="hover:text-primary transition-colors">
                Design System
              </Link>
              <Link href="/dashboard/help" className="hover:text-primary transition-colors">
                System Runbook
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Command Palette Modal */}
      {searchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 backdrop-blur-xs px-4 pt-24"
          onClick={closeSearch}
          role="presentation"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-lowest shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search navigation"
          >
            <div className="flex items-center gap-2.5 border-b border-outline-variant/50 px-4 py-3.5">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                search
              </span>
              <input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to workspace, ledger, or tool…"
                className="w-full bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
              />
              <kbd className="rounded border border-outline-variant px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
                Esc
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-body-sm text-on-surface-variant">
                  No matching workspace found
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSearch}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-body-md text-on-surface hover:bg-surface-low transition-colors",
                        isActive(item.href) &&
                          "bg-secondary-container/35 text-primary font-semibold",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon name={item.icon} size={18} />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-on-surface-variant">
                        {item.href}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
