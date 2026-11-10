"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Floating pill navbar with links to Product Architecture, Storefront Subpages, and Organizer SaaS.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#architecture", label: "Architecture" },
    { href: "/#story", label: "Live Console" },
    { href: "/#features", label: "Capabilities" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/demo", label: "Storefront" },
    { href: "/demo/shop", label: "Merch Shop" },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3">
        <nav
          aria-label="Primary"
          className={`mx-auto flex h-14 max-w-5xl items-center gap-3 rounded-2xl border px-4 transition-all duration-300 ${
            scrolled
              ? "border-outline-variant/70 bg-surface-lowest/90 shadow-lg backdrop-blur-xl"
              : "border-outline-variant/40 bg-surface-lowest/75 backdrop-blur-md"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="CampusHub 2.0 home"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-outline-variant/60 bg-surface-low shadow-2xs shrink-0">
              <Image
                src="/brand/campushub-mark.svg"
                alt="CampusHub Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </span>
            <span className="text-headline-sm font-bold text-on-surface tracking-tight">
              CampusHub <span className="text-secondary">2.0</span>
            </span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-draw text-on-surface-variant hover:text-on-surface rounded-lg px-3 py-1.5 text-label-md font-semibold transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-on-surface hidden rounded-lg px-3 py-1.5 text-label-md font-semibold sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="btn-step focus-aura bg-primary text-on-primary inline-flex h-9 items-center rounded-full px-4 text-label-md font-semibold shadow-2xs"
            >
              Console
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="focus-aura text-on-surface inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container lg:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">
                {open ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 pt-24 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-headline-md text-on-surface rounded-xl px-4 py-3 font-semibold hover:bg-surface-container"
              >
                {l.label}
              </Link>
            ))}
            <hr className="my-3 border-outline-variant" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-headline-sm text-on-surface-variant rounded-xl px-4 py-3"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="bg-primary text-on-primary mt-2 inline-flex h-12 items-center justify-center rounded-full text-label-lg font-semibold"
            >
              Open Organizer Console
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
