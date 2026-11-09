"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui";
import { Magnetic } from "./magnetic";
import HoverDotsLazy from "./hover-dots-lazy";

/**
 * Centered SaaS Hero:
 * Clean vertical alignment in the center of the viewport without top pill clutter
 * or extra secondary buttons.
 */
export function CenterHero() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-[92svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-28 sm:px-8 lg:px-16"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-fixed/25 rounded-full blur-3xl -z-10"
      />

      {/* Interactive dot field */}
      <div aria-hidden className="absolute inset-0 z-0">
        <HoverDotsLazy />
      </div>

      {/* Centered Headline + Subcopy + 2 Core CTAs */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-6 text-center my-auto"
      >
        <h1
          id="hero-heading"
          className="max-w-4xl text-[clamp(2.6rem,5.6vw,4.5rem)] font-bold leading-[1.06] tracking-[-0.032em] text-on-surface"
        >
          Run your campus empire with{" "}
          <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
            Verified Commerce &amp; Grounded AI
          </span>
        </h1>

        <p className="max-w-2xl text-body-lg sm:text-lg leading-relaxed text-on-surface-variant">
          The all-in-one platform for university societies — connecting a
          student event &amp; merchandise storefront with Bryntum venue
          scheduling, AG Grid financial ledgers, PayPal escrow, and grounded AI
          analytics.
        </p>

        {/* 2 Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Magnetic>
            <Link
              href="/dashboard"
              className="btn-step focus-aura bg-primary text-on-primary inline-flex h-12 items-center gap-2 rounded-full px-8 text-label-lg font-semibold shadow-md hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[19px]">
                space_dashboard
              </span>
              <span>Open Organizer SaaS</span>
            </Link>
          </Magnetic>

          <Link href="/demo">
            <ShimmerButton className="btn-step h-12 px-7">
              Explore Student Storefront →
            </ShimmerButton>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
