"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartPill } from "@/components/store/cart-pill";
import { CurrencySelector } from "@/components/store/currency-provider";

const NAV_ITEMS = [
  { href: "/demo", label: "Storefront", exact: true },
  { href: "/demo/events", label: "Events & Passes", exact: false },
  { href: "/demo/shop", label: "Merch Shop", exact: false },
  { href: "/demo/societies", label: "Clubs & Societies", exact: false },
] as const;

function StoreNavLinks({
  pathname,
  org,
  onNavigate,
  mobile = false,
}: {
  pathname: string | null;
  org?: string | null;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "flex flex-col gap-1.5"
          : "mx-auto hidden items-center gap-1 md:flex"
      }
    >
      {NAV_ITEMS.map((item) => {
        const href = org ? `${item.href}?org=${encodeURIComponent(org)}` : item.href;
        const active = pathname
          ? item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/")
          : false;
        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              mobile
                ? "rounded-xl px-4 py-3 text-headline-sm font-semibold transition-colors"
                : "link-draw rounded-lg px-3 py-1.5 text-label-md font-semibold whitespace-nowrap transition-colors",
              active
                ? mobile
                  ? "bg-primary text-on-primary"
                  : "text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function StoreNavActive({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const org = searchParams.get("org");
  return (
    <StoreNavLinks
      pathname={pathname}
      org={org}
      onNavigate={onNavigate}
      mobile={mobile}
    />
  );
}

/**
 * Floating pill navbar for the /demo Storefront.
 * Preserves multi-tenant organization state across subpages.
 */
export function StoreNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3">
        <nav
          aria-label="Storefront navigation"
          className={`mx-auto flex h-14 max-w-5xl items-center gap-3 rounded-2xl border px-4 transition-all duration-300 ${
            scrolled
              ? "border-outline-variant/70 bg-surface-lowest/90 shadow-lg backdrop-blur-xl"
              : "border-outline-variant/45 bg-surface-lowest/80 backdrop-blur-md"
          }`}
        >
          <Link
            href="/demo"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="CampusHub Storefront home"
          >
            <span className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
            </span>
            <span className="text-headline-sm font-bold text-on-surface tracking-tight">
              CampusHub <span className="text-secondary">Store</span>
            </span>
          </Link>

          <Suspense fallback={<StoreNavLinks pathname={null} />}>
            <StoreNavActive />
          </Suspense>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <CurrencySelector />
            <ThemeToggle />
            <CartPill />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="focus-aura text-on-surface inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container md:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">
                {open ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 pt-24 md:hidden">
          <Suspense
            fallback={
              <StoreNavLinks
                pathname={null}
                onNavigate={() => setOpen(false)}
                mobile
              />
            }
          >
            <StoreNavActive onNavigate={() => setOpen(false)} mobile />
          </Suspense>
        </div>
      ) : null}
    </>
  );
}
