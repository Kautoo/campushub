"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CurrencyProvider, UniversalCurrencySelector, type CurrencyCode } from "@/components/ui/currency-context";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";
import { signOut, createDemoSandbox } from "@/app/actions/auth";
import { SandboxPromptModal } from "@/components/workspaces/sandbox-prompt-modal";

export type NavItem = { href: string; label: string; icon: string };
export type NavSection = { title: string; items: NavItem[] };

export type ShellNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

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

const NOTIF_ICONS: Record<string, string> = {
  order: "receipt_long",
  stock: "inventory_2",
  event: "event",
  registration: "how_to_reg",
  ai: "auto_awesome",
  system: "info",
};

function formatNotifDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
  });
}

export function AppShell({
  orgName,
  userInitials,
  userEmail = "owner@campushub.test",
  userName = "Campus Organizer",
  unreadCount = 0,
  notifications = [],
  nav,
  initialCurrency = "MYR",
  isReadOnly = false,
  orgsList = [],
  children,
}: {
  orgName: string;
  userInitials: string;
  userEmail?: string;
  userName?: string;
  unreadCount?: number;
  notifications?: ShellNotification[];
  nav: NavSection[];
  initialCurrency?: CurrencyCode;
  isReadOnly?: boolean;
  orgsList?: Array<{ id: string; name: string; slug: string; isReadOnly?: boolean }>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sandboxPromptOpen, setSandboxPromptOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        setNotifOpen(false);
        setAccountOpen(false);
        setOrgMenuOpen(false);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setAccountOpen(false);
        setOrgMenuOpen(false);
        setMobileDrawerOpen(false);
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
        setAccountOpen(false);
        setOrgMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function closeAllPopovers() {
    setNotifOpen(false);
    setAccountOpen(false);
    setOrgMenuOpen(false);
    setMobileDrawerOpen(false);
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
    <CurrencyProvider initialCurrency={initialCurrency}>
      <div className="min-h-screen bg-background">
      {/* Top Workspace Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-lowest/95 backdrop-blur-xl z-40 border-b border-outline-variant/55"
      >
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 lg:px-8">
          {/* Left: Mobile Menu Button + Interactive Org Switcher + Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 relative">
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen((v) => !v);
                setNotifOpen(false);
                setAccountOpen(false);
                setOrgMenuOpen(false);
              }}
              aria-label="Open workspace navigation drawer"
              aria-expanded={mobileDrawerOpen}
              className="focus-aura inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-low text-on-surface hover:bg-surface-container lg:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">
                menu
              </span>
            </button>

            {/* Organization Switcher Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOrgMenuOpen((v) => !v);
                  setNotifOpen(false);
                  setAccountOpen(false);
                }}
                aria-expanded={orgMenuOpen}
                aria-haspopup="menu"
                className="focus-aura flex items-center gap-2 px-2.5 py-1.5 bg-surface-low rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container transition-colors shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-label-md font-bold truncate max-w-[140px]">
                  {orgName}
                </span>
                <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                  unfold_more
                </span>
              </button>
              {/* Organization Switcher Popover Menu */}
              {orgMenuOpen ? (
                <div
                  role="menu"
                  aria-label="Organization workspace menu"
                  className="absolute left-0 top-12 z-50 w-80 sm:w-88 rounded-2xl border border-outline-variant/70 bg-surface-lowest p-3 shadow-2xl space-y-3"
                >
                  {/* Current Active Workspace Header Card */}
                  <div className="flex items-center gap-3 rounded-xl bg-surface-low p-3 border border-outline-variant/50">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center text-label-lg font-bold shrink-0">
                      {orgName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-md font-bold text-on-surface truncate">
                        {orgName}
                      </p>
                      <div className="mt-0.5">
                        {isReadOnly ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[13px]">lock</span>
                            Read-Only Showcase
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Editable Sandbox
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Workspaces List */}
                  <div className="space-y-1.5 pb-2 border-b border-outline-variant/40">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                        Select Workspace
                      </span>
                      <span className="text-[11px] font-medium text-secondary">
                        {orgsList?.length ?? 1} available
                      </span>
                    </div>
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {orgsList && orgsList.length > 0 ? (
                        orgsList.map((o) => {
                          const isActive = o.name === orgName;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => {
                                document.cookie = `ch-active-org=${o.id}; path=/; max-age=31536000; SameSite=Lax`;
                                window.location.reload();
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                                isActive
                                  ? "bg-primary/10 border border-primary/30 text-on-surface font-semibold shadow-2xs"
                                  : "hover:bg-surface-low text-on-surface-variant hover:text-on-surface border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`material-symbols-outlined text-[18px] shrink-0 ${
                                    isActive
                                      ? "text-primary font-bold"
                                      : "text-outline-variant"
                                  }`}
                                >
                                  {isActive
                                    ? "check_circle"
                                    : "radio_button_unchecked"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-body-sm font-semibold truncate text-on-surface">
                                    {o.name}
                                  </p>
                                  <p className="text-[11px] text-on-surface-variant">
                                    {o.isReadOnly
                                      ? "Master Showcase · Read-Only"
                                      : "Private Sandbox · Full Access"}
                                  </p>
                                </div>
                              </div>
                              {o.isReadOnly ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-container text-warning font-bold shrink-0 ml-1">
                                  Template
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary font-bold shrink-0 ml-1">
                                  Sandbox
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : null}
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <div className="pt-1">
                    <form action={createDemoSandbox}>
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-label-sm font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          science
                        </span>
                        <span>Launch New Sandbox Workspace</span>
                      </button>
                    </form>
                  </div>

                  {/* Quick Settings Links */}
                  <div className="pt-2 border-t border-outline-variant/40 space-y-0.5">
                    <Link
                      href="/dashboard/settings"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        settings
                      </span>
                      <span>Workspace Profile &amp; Gateways</span>
                    </Link>
                    <Link
                      href="/dashboard/members"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        groups
                      </span>
                      <span>Committee &amp; Permissions</span>
                    </Link>
                    <Link
                      href="/demo"
                      onClick={closeAllPopovers}
                      className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-body-sm font-semibold text-primary hover:bg-surface-low transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          storefront
                        </span>
                        <span>Public Storefront</span>
                      </span>
                      <span className="material-symbols-outlined text-[14px]">
                        open_in_new
                      </span>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <span className="text-outline-variant text-body-sm hidden sm:inline">
              /
            </span>
            <span className="text-label-lg font-semibold text-on-surface truncate hidden sm:inline">
              {currentPageLabel}
            </span>
          </div>

          {/* Right Command Actions */}
          <div className="flex items-center gap-2 relative">
            {isReadOnly ? (
              <button
                type="button"
                onClick={() => setSandboxPromptOpen(true)}
                title="Showcase Workspace (Read-Only) — Click to view sandbox options"
                className="focus-aura hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-low/80 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-body-sm font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-500">
                  lock
                </span>
                <span>Showcase (Read-Only)</span>
              </button>
            ) : null}
            {/* Command Search Trigger */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                closeAllPopovers();
              }}
              className="focus-aura hidden h-9 w-56 xl:w-64 items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-low/80 px-3 text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors md:flex"
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
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3 text-label-md font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                storefront
              </span>
              <span>Live Storefront</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                open_in_new
              </span>
            </Link>

            {/* Interactive Notification Bell Button + Popover Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setAccountOpen(false);
                  setOrgMenuOpen(false);
                }}
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
                className={cn(
                  "focus-aura relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                  notifOpen
                    ? "border-secondary bg-secondary-container/40 text-on-surface"
                    : "border-outline-variant/50 bg-surface-lowest text-on-surface-variant hover:bg-surface-low hover:text-on-surface",
                )}
              >
                <span className="material-symbols-outlined text-[19px]">
                  notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="bg-error absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              {/* Notifications Dropdown Popup Menu */}
              {notifOpen ? (
                <div
                  role="dialog"
                  aria-label="Notifications menu"
                  className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-outline-variant/70 bg-surface-lowest shadow-2xl overflow-hidden"
                >
                  {/* Popup Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-outline-variant/50 bg-surface-low/70 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-headline-sm font-bold text-on-surface">
                        Notifications
                      </span>
                      <Badge tone={unreadCount > 0 ? "error" : "neutral"}>
                        {unreadCount} unread
                      </Badge>
                    </div>
                    {unreadCount > 0 ? (
                      <form action={markAllNotificationsRead}>
                        <button
                          type="submit"
                          className="text-label-sm font-semibold text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            done_all
                          </span>
                          <span>Mark all read</span>
                        </button>
                      </form>
                    ) : null}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/40">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center space-y-1">
                        <span className="material-symbols-outlined text-[26px] text-on-surface-variant">
                          notifications_none
                        </span>
                        <p className="text-body-sm font-semibold text-on-surface">
                          No notifications yet
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Order, stock, and registration alerts appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const unread = n.read_at === null;
                        return (
                          <div
                            key={n.id}
                            className={cn(
                              "px-4 py-3 flex items-start justify-between gap-3 transition-colors",
                              unread
                                ? "bg-secondary-container/15 hover:bg-secondary-container/25"
                                : "hover:bg-surface-low/60 opacity-80",
                            )}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                  unread
                                    ? "bg-secondary-container text-on-secondary-container"
                                    : "bg-surface-container text-on-surface-variant",
                                )}
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  {NOTIF_ICONS[n.type] ?? NOTIF_ICONS.system}
                                </span>
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-body-sm font-semibold text-on-surface truncate">
                                    {n.title}
                                  </p>
                                  {unread ? (
                                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                                  ) : null}
                                </div>
                                {n.body ? (
                                  <p className="text-xs text-on-surface-variant line-clamp-2">
                                    {n.body}
                                  </p>
                                ) : null}
                                <div className="flex items-center gap-2.5 pt-0.5">
                                  <span className="text-[10.5px] text-on-surface-variant tabular-nums">
                                    {formatNotifDate(n.created_at)}
                                  </span>
                                  {n.link ? (
                                    <Link
                                      href={n.link}
                                      onClick={closeAllPopovers}
                                      className="text-[11px] font-semibold text-secondary hover:underline"
                                    >
                                      Open workspace →
                                    </Link>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {unread ? (
                              <form
                                action={markNotificationRead.bind(null, n.id)}
                              >
                                <button
                                  type="submit"
                                  title="Mark as read"
                                  className="h-7 w-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    check
                                  </span>
                                </button>
                              </form>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Popup Footer CTA to Full Notifications Page */}
                  <div className="border-t border-outline-variant/50 bg-surface-low/60 p-2.5">
                    <Link
                      href="/dashboard/notifications"
                      onClick={closeAllPopovers}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 px-4 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all"
                    >
                      <span>Go to Notifications Page</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <UniversalCurrencySelector />

            <ThemeToggle />
            {/* Interactive Account Avatar Button + Popover Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((v) => !v);
                  setNotifOpen(false);
                  setOrgMenuOpen(false);
                }}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="focus-aura bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-label-md font-bold text-on-primary shadow-2xs hover:opacity-90 transition-opacity"
              >
                {userInitials || "?"}
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-outline-variant/70 bg-surface-lowest p-3 shadow-2xl space-y-2.5"
                >
                  <div className="rounded-xl bg-surface-low p-3 border border-outline-variant/40">
                    <p className="text-body-md font-bold text-on-surface truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {userEmail}
                    </p>
                    <div className="mt-2">
                      <Badge tone="teal" icon="verified_user">
                        {orgName}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard/settings?tab=account"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">
                        person
                      </span>
                      <span>Personal Account Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings?tab=organization"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">
                        domain
                      </span>
                      <span>Organization &amp; Gateways</span>
                    </Link>
                    <Link
                      href="/dashboard/members"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">
                        groups
                      </span>
                      <span>Committee &amp; Roles</span>
                    </Link>
                    <Link
                      href="/dashboard/notifications"
                      onClick={closeAllPopovers}
                      className="flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[17px] text-secondary">
                          notifications
                        </span>
                        <span>Notifications</span>
                      </span>
                      {unreadCount > 0 ? (
                        <Badge tone="error">{unreadCount}</Badge>
                      ) : null}
                    </Link>
                    <Link
                      href="/dashboard/help"
                      onClick={closeAllPopovers}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-secondary">
                        help
                      </span>
                      <span>Documentation &amp; Runbook</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/40">
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm font-semibold text-error hover:bg-error-container/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          logout
                        </span>
                        <span>Sign out of workspace</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Left Fixed Sidebar (Desktop lg+) */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-surface-lowest z-50 flex-col justify-between border-r border-outline-variant/55 lg:flex">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-5">
          {/* Brand Lockup */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-low border border-outline-variant/60 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                <Image
                  src="/brand/campushub-mark.svg"
                  alt="CampusHub Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-headline-sm font-bold text-on-surface leading-tight tracking-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  ORGANIZER
                </span>
              </div>
            </Link>
            <Badge tone="teal">Console</Badge>
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
                              active ? "text-on-primary" : "",
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
                                ? "bg-black/20 text-on-primary"
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

        {/* Bottom Organization Card + Sign Out */}
        <div className="p-4 border-t border-outline-variant/45 space-y-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between p-2.5 bg-surface-low rounded-xl border border-outline-variant/45 hover:bg-surface-container transition-colors"
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

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileDrawerOpen ? (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/45 backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
          role="presentation"
        >
          <aside
            className="w-72 max-w-[85vw] h-full bg-surface-lowest border-r border-outline-variant/60 p-4 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile workspace navigation"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-outline-variant/60 bg-surface-low shadow-2xs flex items-center justify-center shrink-0">
                    <Image
                      src="/brand/campushub-mark.svg"
                      alt="CampusHub Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className="text-headline-sm font-bold text-on-surface">
                    CampusHub
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close drawer"
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              {nav.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="px-2 text-[10.5px] uppercase tracking-widest text-on-surface-variant font-bold block">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl",
                          active
                            ? "bg-primary text-on-primary font-semibold"
                            : "text-on-surface-variant hover:bg-surface-low",
                        )}
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          {item.icon}
                        </span>
                        <span className="text-label-lg">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-outline-variant/45">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-label-md font-semibold text-error hover:bg-error-container/40"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

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
              CampusHub Organizer Console · Powered by AG Grid Community &amp; Bryntum Scheduler
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
      {/* Master Sandbox Prompt Modal */}
      <SandboxPromptModal
        isOpen={sandboxPromptOpen}
        onClose={() => setSandboxPromptOpen(false)}
      />
      </div>
    </CurrencyProvider>
  );
}
