"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui";
import { Magnetic } from "./magnetic";
import HoverDotsLazy from "./hover-dots-lazy";

/**
 * CampusHub 2.0 SaaS & E-Commerce Hero:
 * Clear service positioning, multi-page storefront + organizer console CTAs,
 * and structured 4-pillar capability summary.
 */
export function CenterHero({
  techIcons,
}: {
  techIcons: { name: string; icon: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 pt-32 pb-16 sm:px-8 lg:px-16"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-36 right-1/4 w-96 h-96 bg-primary-fixed/25 rounded-full blur-3xl -z-10"
      />

      {/* Interactive dot field */}
      <div aria-hidden className="absolute inset-0 z-0">
        <HoverDotsLazy />
      </div>

      {/* Eyebrow + Headline + Detailed Service Summary */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-5 text-center"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-surface-lowest text-on-surface shadow-xs border border-outline-variant/60">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-label-sm font-bold tracking-wider uppercase text-secondary">
            CampusHub 2.0 Platform
          </span>
          <span className="text-outline-variant">•</span>
          <span className="text-label-sm text-on-surface-variant">
            Multi-Page E-Commerce · Bryntum Scheduler · AG Grid · PayPal v2
          </span>
        </div>

        <h1
          id="hero-heading"
          className="max-w-4xl text-[clamp(2.4rem,5.2vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.032em] text-on-surface"
        >
          Run your campus empire with{" "}
          <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
            Verified Commerce &amp; Grounded AI
          </span>
        </h1>

        <p className="max-w-3xl text-body-lg sm:text-lg leading-relaxed text-on-surface-variant">
          One unified platform connecting a{" "}
          <strong className="text-on-surface font-semibold">
            multi-page student storefront
          </strong>{" "}
          (QR event passes, licensed club merchandise, shopping bag &amp; PayPal
          Orders v2 guest checkout) with an{" "}
          <strong className="text-on-surface font-semibold">
            enterprise organizer SaaS console
          </strong>{" "}
          powered by Bryntum Scheduler 8.0, AG Grid Community 36, and zero-PII
          Grounded AI.
        </p>
      </motion.div>

      {/* Primary Action Bar */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-3.5"
      >
        <Magnetic>
          <Link
            href="/dashboard"
            className="btn-step focus-aura bg-primary text-on-primary inline-flex h-12 items-center gap-2 rounded-full px-7 text-label-lg font-semibold shadow-md hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[19px]">
              space_dashboard
            </span>
            <span>Open Organizer SaaS</span>
          </Link>
        </Magnetic>

        <Link href="/demo">
          <ShimmerButton className="btn-step h-12 px-6">
            Explore Multi-Page Storefront →
          </ShimmerButton>
        </Link>

        <Link
          href="/demo/events"
          className="inline-flex h-12 items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-lowest px-5 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            confirmation_number
          </span>
          <span>Event Passes</span>
        </Link>

        <Link
          href="/demo/shop"
          className="inline-flex h-12 items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-lowest px-5 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            shopping_bag
          </span>
          <span>Merch Shop</span>
        </Link>
      </motion.div>

      {/* 4-Pillar Service Summary Cards */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.34 }}
        className="relative z-10 mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full max-w-6xl"
      >
        <Link
          href="/demo"
          className="rounded-2xl bg-surface-lowest/90 backdrop-blur-md border border-outline-variant/55 p-4 text-left hover:border-secondary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              storefront
            </span>
            <span className="text-[10.5px] font-mono font-semibold text-on-surface-variant">
              /demo/*
            </span>
          </div>
          <p className="text-headline-sm font-bold text-on-surface">
            Multi-Page E-Commerce
          </p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Dedicated Events, Merch Shop, PDPs, Shopping Bag &amp; PayPal Checkout.
          </p>
        </Link>

        <Link
          href="/dashboard/events"
          className="rounded-2xl bg-surface-lowest/90 backdrop-blur-md border border-outline-variant/55 p-4 text-left hover:border-secondary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              view_timeline
            </span>
            <span className="text-[10.5px] font-mono font-semibold text-on-surface-variant">
              Bryntum 8.0
            </span>
          </div>
          <p className="text-headline-sm font-bold text-on-surface">
            Venue &amp; Event Scheduler
          </p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Multi-venue timeline, Day/Week/Semester presets &amp; drag rescheduling.
          </p>
        </Link>

        <Link
          href="/dashboard/orders"
          className="rounded-2xl bg-surface-lowest/90 backdrop-blur-md border border-outline-variant/55 p-4 text-left hover:border-secondary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              table_chart
            </span>
            <span className="text-[10.5px] font-mono font-semibold text-on-surface-variant">
              AG Grid 36
            </span>
          </div>
          <p className="text-headline-sm font-bold text-on-surface">
            Enterprise Data Ledgers
          </p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Events, Registrations, Products, Orders &amp; Transactions with CSV export.
          </p>
        </Link>

        <Link
          href="/dashboard/ai-insights"
          className="rounded-2xl bg-surface-lowest/90 backdrop-blur-md border border-outline-variant/55 p-4 text-left hover:border-secondary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              auto_awesome
            </span>
            <span className="text-[10.5px] font-mono font-semibold text-on-surface-variant">
              PayPal + AI
            </span>
          </div>
          <p className="text-headline-sm font-bold text-on-surface">
            Escrow &amp; Grounded AI
          </p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            HMAC-verified PayPal webhooks &amp; zero-hallucination Postgres AI packs.
          </p>
        </Link>
      </motion.div>

      {/* Tech icon row */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.42 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-2 pt-1"
      >
        {techIcons.map((item) => (
          <span
            key={item.name}
            title={item.name}
            aria-label={item.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-lowest/80 px-3 py-1.5 text-label-sm font-medium text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
