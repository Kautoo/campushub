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
  orgs,
  userInitials,
  unreadCount = 0,
  nav,
  children,
}: {
  orgName: string;
  orgs?: { id: string; name: string }[];
  userInitials: string;
  unreadCount?: number;
  nav: NavSection[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
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
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-outline-variant bg-surface-lowest/90 px-4 backdrop-blur lg:px-6">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((c) => !c)}
          className="focus-aura hidden h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-container lg:inline-flex"
        >
          <span className="material-symbols-outlined text-[20px]">
            {collapsed ? "menu" : "menu_open"}
          </span>
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-white dark:bg-primary dark:text-[#00201c]">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </span>
          <span className="hidden text-headline-sm text-ink sm:block">
            CampusHub
          </span>
        </Link>

        {/* Org switcher */}
        {orgs && orgs.length > 1 ? (
          <label className="ml-2 hidden items-center gap-1 text-body-sm text-muted md:inline-flex">
            <span className="material-symbols-outlined text-[16px]">
              domain
            </span>
            <select
              defaultValue={orgName}
              className="rounded-full border border-outline-variant bg-surface-low px-3 py-1.5 text-label-md text-ink outline-none"
              aria-label="Switch organization"
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="text-label-md text-muted hidden md:block">
            {orgName}
          </span>
        )}

        {/* Search */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="focus-aura ml-auto hidden h-9 w-64 items-center gap-2 rounded-full border border-outline-variant bg-surface-low px-3 text-body-sm text-muted hover:bg-surface-container md:flex"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          Search
          <kbd className="ml-auto rounded border border-outline-variant bg-surface-lowest px-1.5 text-label-sm">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/dashboard/notifications"
            aria-label={`Notifications (${unreadCount} unread)`}
            className="focus-aura relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-container"
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
            className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-full text-label-md text-white dark:bg-primary dark:text-[#00201c]"
          >
            {userInitials || "?"}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-30 hidden flex-col gap-1 overflow-y-auto border-r border-outline-variant bg-surface-lowest px-3 py-4 transition-all lg:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {nav.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed ? (
              <p className="text-label-sm text-muted px-3 pt-3 pb-1 tracking-wide uppercase">
                {section.title}
              </p>
            ) : null}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3 py-2 text-label-lg transition-colors",
                  collapsed && "justify-center px-0",
                  isActive(item.href)
                    ? "bg-primary/10 font-semibold text-primary dark:bg-primary/15"
                    : "text-muted hover:bg-surface-container hover:text-ink",
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {!collapsed ? item.label : null}
              </Link>
            ))}
          </div>
        ))}
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
              isActive(item.href) ? "text-primary" : "text-muted",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main */}
      <main
        className={cn(
          "pt-16 transition-all pb-20 lg:pb-0",
          collapsed ? "lg:pl-16" : "lg:pl-60",
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          {children}
        </div>
        <footer className="mt-8 border-t border-outline-variant px-4 py-6 lg:px-8">
          <p className="text-body-sm text-muted">
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
            className="w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search navigation"
          >
            <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-muted">
                search
              </span>
              <input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to…"
                className="w-full bg-transparent text-body-md text-ink outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-outline-variant px-1.5 text-label-sm text-muted">
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-4 text-body-sm text-muted">
                  No matches
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSearch}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-body-md text-ink hover:bg-surface-container",
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
