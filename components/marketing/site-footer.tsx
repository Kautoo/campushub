"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Premium footer: gradient hairline top, staggered link columns, theme toggle. */
export function SiteFooter() {
  const reduce = useReducedMotion();
  const cols = [
    {
      title: "Product",
      links: [
        { href: "/demo", label: "Storefront" },
        { href: "/#story", label: "Product tour" },
        { href: "/#features", label: "Features" },
        { href: "/#pricing", label: "Pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/login", label: "Sign in" },
        { href: "/register", label: "Get started" },
        { href: "/styleguide", label: "Styleguide" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy policy" },
        { href: "/tos", label: "Terms of service" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-outline-variant bg-surface-lowest">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--st-gradient-a) 50%, transparent 100%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label="CampusHub 2.0 home">
            <span className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-white dark:bg-primary dark:text-[#00201c]">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </span>
            <span className="text-headline-sm text-on-surface">CampusHub</span>
            <span className="rounded-full border border-outline-variant px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
              2.0
            </span>
          </Link>
          <p className="text-on-surface-variant mt-4 max-w-xs text-sm leading-relaxed">
            The campus events &amp; commerce platform — ticketing, storefront,
            PayPal payments, and grounded AI insights.
          </p>
          <div className="mt-5">
            <ThemeToggle />
          </div>
        </motion.div>

        {cols.map((col, i) => (
          <motion.div
            key={col.title}
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 * (i + 1) }}
          >
            <p className="text-label-md text-on-surface-variant uppercase tracking-widest">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="link-draw text-on-surface-variant text-sm hover:text-on-surface">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-outline-variant">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 lg:px-8">
          <p className="text-on-surface-variant text-xs">
            © CampusHub 2.0 · Built with Next.js,
            Render Postgres, PayPal, and the Vercel AI SDK
          </p>
          <p className="text-on-surface-variant font-mono text-[11px]">
            status:{" "}
            <Link href="/api/health" className="link-draw text-success">
              operational
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
