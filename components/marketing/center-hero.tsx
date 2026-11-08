"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui";
import { Magnetic } from "./magnetic";
import HoverDotsLazy from "./hover-dots-lazy";

/**
 * Stitch-aligned CenterHero:
 * Headline, subcopy, Magnetic CTAs, Stitch Trust Metrics Bar, and Tech stack icons.
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
      className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 pt-36 pb-20 sm:px-8 lg:px-24"
    >
      {/* Ambient blobs (Stitch landing) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 z-0 h-80 w-[min(900px,120vw)] -translate-x-1/2 bg-secondary-fixed/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-[10%] z-0 h-72 w-96 rounded-full bg-tertiary-fixed/10 blur-3xl"
      />

      {/* Interactive dot field */}
      <div aria-hidden className="absolute inset-0 z-0">
        <HoverDotsLazy />
      </div>

      {/* Headline + subcopy */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full flex-col items-center gap-4 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-label-sm font-semibold tracking-wide uppercase text-secondary">
            CampusHub 2.0
          </span>
          <span className="text-outline-variant">•</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Higher Ed Commerce Ecosystem
          </span>
        </div>

        <h1
          id="hero-heading"
          className="max-w-4xl text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1.08] tracking-[-0.03em] text-on-surface"
        >
          Powering Campus Societies, Hackathons &amp; Collegiate Commerce with{" "}
          <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
            Autonomous AI
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-on-surface-variant">
          CampusHub is the verified platform for university student
          organizations — dynamic QR ticketing, storefront merchandise, PayPal
          escrow settlements, and AI insights computed from your live ledger.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.32 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Magnetic>
          <GetStarted />
        </Magnetic>
        <Link href="/demo">
          <ShimmerButton className="btn-step h-11 px-6">
            Visit the demo store →
          </ShimmerButton>
        </Link>
      </motion.div>

      {/* Stitch Trust Metrics Bar (1:1 with Stitch Landing) */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.38 }}
        className="relative z-10 mt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-6 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-sm ring-1 ring-outline-variant/30"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            verified
          </span>
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            320+ University Societies
          </span>
        </div>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-outline-variant" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            payments
          </span>
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            RM 142K+ Gross Escrow
          </span>
        </div>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-outline-variant" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            speed
          </span>
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            99.98% Gateway SLA
          </span>
        </div>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-outline-variant" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            lock
          </span>
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            PCI-DSS &amp; PayPal Secure
          </span>
        </div>
      </motion.div>

      {/* Tech icon row */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.44 }}
        className="relative z-10 flex items-center justify-center gap-2"
      >
        {techIcons.map((item) => (
          <span
            key={item.name}
            title={item.name}
            aria-label={item.name}
            className="focus-aura flex h-10 w-10 cursor-default items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function GetStarted() {
  return (
    <Link
      href="/register"
      className="btn-step focus-aura bg-primary text-white dark:text-[#00201c] inline-flex h-11 items-center rounded-full px-7 text-label-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all"
    >
      Start building free
    </Link>
  );
}
