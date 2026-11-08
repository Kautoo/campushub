"use client";

import { motion, useReducedMotion } from "motion/react";

import Link from "next/link";
import { ShimmerButton } from "@/components/magicui";
import { Magnetic } from "./magnetic";

/**
 * UIAble-style hero: centered composition, gradient glow bar, stat pill,
 * icon row. Reuses the project's fonts/tokens; motion rests under
 * reduced-motion.
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
      className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full flex-col items-center justify-center gap-12 overflow-hidden px-4 pt-40 pb-32 sm:px-8 lg:px-24"
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
        className="relative z-10 flex w-full flex-col items-center gap-6 text-center"
      >
        <h1
          id="hero-heading"
          className="max-w-4xl text-[clamp(2.6rem,6.5vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.03em] text-on-surface"
        >
          Powering Campus Societies, Hackathons &amp; Collegiate Commerce with{" "}
          <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
            Autonomous AI
          </span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          CampusHub is the events &amp; commerce platform for campus societies —
          ticketing, storefront, PayPal payments, and AI insights computed from
          your real numbers.
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

      {/* Tech icon row */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.42 }}
        className="relative z-10 flex items-center justify-center gap-2"
      >
        {techIcons.map((item) => (
          <span
            key={item.name}
            title={item.name}
            aria-label={item.name}
            className="focus-aura flex h-11 w-11 cursor-default items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">
              {item.icon}
            </span>
          </span>
        ))}
      </motion.div>

      {/* Free-demo note */}
      <motion.p
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-on-surface-variant relative z-10 text-sm"
      >
        <span className="material-symbols-outlined align-text-bottom text-[15px] text-success">
          verified
        </span>{" "}
        RM 45,230 tracked in the live demo — explore free, no signup.
      </motion.p>
    </section>
  );
}

function GetStarted() {
  return (
    <Link
      href="/register"
      className="btn-step focus-aura bg-primary text-white dark:text-[#00201c] inline-flex h-11 items-center rounded-full px-7 text-label-lg font-semibold shadow-lg shadow-primary/20"
    >
      Start building free
    </Link>
  );
}

import HoverDotsLazy from "./hover-dots-lazy";
