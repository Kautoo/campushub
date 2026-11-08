"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui";
import { Magnetic } from "./magnetic";

/**
 * UIAble-style hero: centered composition, gradient glow bar, stat pill,
 * icon row. Reuses the project's fonts/tokens; motion rests under
 * reduced-motion.
 */
export function CenterHero({ stats, techIcons }: {
  stats: { label: string; value: string }[];
  techIcons: { name: string; icon: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto flex w-full flex-col items-center gap-8 overflow-hidden px-4 pt-24 pb-16 sm:px-8 lg:px-24"
    >
      {/* Gradient glow bar — blurred ribbon across the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 z-0 h-80 w-[min(900px,120vw)] -translate-x-1/2 opacity-30 dark:opacity-55"
        style={{
          background:
            "linear-gradient(90deg, var(--st-gradient-c) 0%, var(--st-gradient-a) 50%, var(--st-gradient-b) 100%)",
          filter: "blur(240px)",
        }}
      />

      {/* Interactive dot field */}
      <div aria-hidden className="absolute inset-0 z-0">
        <HoverDotsLazy />
      </div>

      {/* Stat pill */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 flex max-w-full flex-wrap items-center justify-center rounded-full border border-outline-variant bg-surface-lowest/80 px-1.5 py-1 shadow-card backdrop-blur"
      >
        {stats.map((item, index) => (
          <Fragment key={item.label}>
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap sm:text-sm">
              <span className="text-ink font-semibold tabular-nums">{item.value}</span>
              <span className="text-muted">{item.label}</span>
            </span>
            {index < stats.length - 1 && (
              <span aria-hidden className="h-3.5 w-px shrink-0 bg-outline-variant" />
            )}
          </Fragment>
        ))}
      </motion.div>

      {/* Headline + subcopy */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full flex-col items-center gap-6 text-center"
      >
        <h1
          id="hero-heading"
          className="max-w-4xl text-[clamp(2.6rem,6.5vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink"
        >
          Run your campus{" "}
          <span className="font-editorial text-primary italic font-medium">
            empire
          </span>{" "}
          from one hub.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          CampusHub is the events &amp; commerce platform for campus
          societies — ticketing, storefront, PayPal payments, and AI answers
          computed from your real numbers.
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
            className="focus-aura flex h-11 w-11 cursor-default items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-container hover:text-ink"
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
          </span>
        ))}
      </motion.div>

      {/* Free-demo note */}
      <motion.p
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-muted relative z-10 text-sm"
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
