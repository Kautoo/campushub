"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Icon } from "@/components/ui/icon";

export type NavItem = { href: string; label: string; icon: string };
export type NavSection = { title: string; items: NavItem[] };

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
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Close the search overlay and clear its query (was an effect branch). */
  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const allItems = nav.flatMap((s) => s.items);
  const results = query
    ? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-background">
{/* Header — Stitch: fixed, clears the w-72 sidebar on lg+ */}
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex h-16 w-full items-center justify-between gap-space-lg px-space-md lg:px-space-xl">
          <div className="flex items-center gap-space-md">
            {/* Breadcrumb: Organizer Workspace / <org> chip → /dashboard/settings */}
            <span className="font-label-lg text-label-lg text-on-surface-variant hidden md:inline">
              Organizer Workspace
            </span>
            <span className="text-outline-variant font-body-sm text-body-sm hidden md:inline">
              /
            </span>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-1.5 px-space-sm py-1 bg-surface-container-low rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="font-label-md text-label-md font-semibold">
                {orgName}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                expand_more
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="focus-aura ml-auto hidden h-9 w-64 items-center gap-2 rounded-full border border-outline-variant bg-surface-low px-3 text-body-sm text-on-surface-variant hover:bg-surface-container md:flex"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search
              <kbd className="ml-auto rounded border border-outline-variant bg-surface-lowest px-1.5 text-label-sm">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/dashboard/notifications"
              aria-label={`Notifications (${unreadCount} unread)`}
              className="focus-aura relative inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              {unreadCount > 0 ? (
                <span className="bg-error absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <ThemeToggle />
            <span
              aria-label="Account"
              className="bg-primary flex h-9 w-9 items-center justify-center rounded-full text-label-md text-on-primary"
            >
              {userInitials || "?"}
            </span>
          </div>
        </div>
      </header>

{/* Sidebar — Stitch: fixed w-72, full height, not collapsible */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-surface-container-lowest z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:flex">
        <div className="flex flex-col flex-1 overflow-y-auto px-space-md pt-space-lg">
          {/* Brand row */}
          <div className="flex items-center gap-space-sm px-space-sm mb-space-xl">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                school
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary leading-tight tracking-tight">
                CampusHub
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                ORGANIZER 2.0
              </span>
            </div>
          </div>

          {/* Nav groups */}
          <div className="flex flex-col gap-space-lg">
            {nav.map((section) => (
              <div key={section.title} className="flex flex-col gap-space-xs">
                <span className="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {section.title}
                </span>
                <nav className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-space-md py-space-sm rounded-lg transition-all",
                        isActive(item.href)
                          ? "bg-secondary-container text-on-secondary-container font-semibold"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      )}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="font-label-lg text-label-lg">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom org card → settings */}
        <div className="p-space-md">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                {orgName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface leading-snug">
                  {orgName}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Campus Org
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              unfold_more
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav (top 5) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-outline-variant bg-surface-lowest py-2 lg:hidden">
        {allItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1",
              isActive(item.href) ? "text-primary" : "text-on-surface-variant",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>

{/* Main — pt-16 clears fixed header, lg:pl-72 clears fixed sidebar */}
      <main className="pt-16 pb-20 lg:pl-72 lg:pb-0 bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          {children}
        </div>
        <footer className="mt-8 border-t border-outline-variant px-4 py-6 lg:px-8">
          <p className="text-body-sm text-on-surface-variant">
            CampusHub 2.0 · Campus events &amp; commerce · Payments secured by
            PayPal
          </p>
        </footer>
      </main>

            {/* Command palette */}
      {searchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
          onClick={closeSearch}
          role="presentation"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search navigation"
          >
            <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to…"
                className="w-full bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
              />
              <kbd className="rounded border border-outline-variant px-1.5 text-label-sm text-on-surface-variant">
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-4 text-body-sm text-on-surface-variant">
                  No matches
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSearch}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container",
                        isActive(item.href) && "text-primary font-semibold",
                      )}
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
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
