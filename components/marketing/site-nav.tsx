"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Floating pill navbar: centered links, blur backdrop, shadow on scroll.
 * Mobile: hamburger → full-screen menu with staggered link entry.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/#story", label: "Product" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/demo", label: "Storefront" },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3">
        <nav
          aria-label="Primary"
          className={`mx-auto flex h-14 max-w-4xl items-center gap-3 rounded-2xl border px-4 transition-all duration-300 ${
            scrolled
              ? "border-outline-variant bg-surface-lowest/85 shadow-card backdrop-blur-lg"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label="CampusHub 2.0 home">
            <span className="bg-primary-container flex h-8 w-8 items-center justify-center rounded-lg text-white transition-transform duration-200 hover:scale-105 dark:bg-primary dark:text-[#00201c]">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </span>
            <span className="text-headline-sm text-ink">CampusHub</span>
            <span className="hidden rounded-full border border-outline-variant px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
              2.0
            </span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-label-lg text-muted transition-colors hover:bg-surface-container hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Link
              href="/register"
              className="btn-step bg-primary text-white dark:text-[#00201c] focus-aura hidden h-9 items-center rounded-full px-4 text-label-md font-semibold sm:inline-flex"
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="focus-aura flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface-container md:hidden"
            >
              <span className="material-symbols-outlined text-[22px]">
                {open ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 pt-24 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-2">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-headline-md text-ink rounded-xl px-4 py-3 hover:bg-surface-container"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-headline-md text-muted rounded-xl px-4 py-3 hover:bg-surface-container"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-step bg-primary mt-4 inline-flex h-12 items-center justify-center rounded-full text-label-lg font-semibold text-white dark:text-[#00201c]"
            >
              Get started
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
