"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlurText, ShinyText, AnimatedContent } from "@/components/ui/react-bits";

export interface PageHeroStat {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  icon?: string;
  accent?: boolean;
}

export interface PageHeroProps {
  /** Top status pill primary text (rendered with React Bits ShinyText) */
  badge?: string;
  /** Optional secondary pill text or link next to the divider */
  badgeSubtext?: string;
  badgeHref?: string;
  /** Leading text before the italic editorial highlight (animated with BlurText) */
  titleLead?: string;
  /** Italic Instrument Serif highlight text in primary olive */
  titleHighlight?: string;
  /** Optional trailing text after the italic highlight */
  titleTrail?: string;
  /** Optional custom title component (e.g. TypewriterHero) */
  customTitle?: React.ReactNode;
  /** Supporting description below the headline */
  description: string;
  /** Layout alignment: 'split' (default for inner pages) or 'center' (for landing/explore) */
  align?: "center" | "split";
  /** Optional telemetry stat cards (reserved for landing page) */
  stats?: PageHeroStat[];
  /** Optional custom right-side action buttons or widget */
  actions?: React.ReactNode;
  /** Optional bottom slot (e.g., AI Search capsule, filter pills, or step progress arc) */
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({
  badge,
  badgeSubtext,
  badgeHref,
  titleLead,
  titleHighlight,
  titleTrail,
  customTitle,
  description,
  align = "split",
  stats,
  actions,
  children,
  className,
}: PageHeroProps) {
  const isCenter = align === "center";
  const hasRightSlot = Boolean((stats && stats.length > 0) || actions);

  return (
    <section
      className={cn(
        "relative z-10 pb-8 mb-8 border-b border-outline-variant/25",
        className
      )}
    >
      {/* Unified Ambient Background Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 overflow-hidden -z-10">
        <div className="w-full h-full bg-gradient-to-tr from-secondary-container/20 via-primary-fixed/12 to-transparent rounded-full blur-[100px]" />
      </div>

      <div
        className={cn(
          "flex flex-col gap-6",
          isCenter
            ? "items-center text-center max-w-4xl mx-auto"
            : hasRightSlot
            ? "lg:flex-row lg:items-end justify-between"
            : "items-start"
        )}
      >
        {/* Left / Center Copy Column */}
        <AnimatedContent
          trigger="mount"
          distance={32}
          direction="vertical"
          duration={0.7}
          ease="power3.out"
          stagger={0.06}
          className={cn(
            isCenter
              ? "w-full"
              : hasRightSlot
              ? "max-w-2xl xl:max-w-3xl"
              : "max-w-4xl"
          )}
        >
          {/* Unified React Bits Animated Status Pill (only when badge is provided) */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-2xs mb-5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <ShinyText className="text-[11px] font-bold uppercase tracking-widest text-primary font-label">
                {badge}
              </ShinyText>
              {badgeSubtext && (
                <>
                  <span className="text-outline-variant">|</span>
                  {badgeHref ? (
                    <Link
                      href={badgeHref}
                      className="text-[11px] font-semibold text-on-surface-variant hover:text-primary flex items-center gap-0.5 transition-colors"
                    >
                      <span>{badgeSubtext}</span>
                      <span className="material-symbols-outlined text-[13px]">
                        arrow_outward
                      </span>
                    </Link>
                  ) : (
                    <span className="text-[11px] font-mono font-semibold text-on-surface-variant">
                      {badgeSubtext}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Unified Display Headline with BlurText or Custom Kinetic Component */}
          {customTitle ? (
            customTitle
          ) : (
            <h1
              className={cn(
                "font-extrabold tracking-tight text-on-surface font-headline leading-[1.05] mb-4",
                isCenter
                  ? "text-5xl sm:text-6xl md:text-7xl lg:text-[4.85rem] xl:text-[5.15rem]"
                  : "text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.35rem]"
              )}
            >
              <BlurText text={titleLead || ""} delayStepMs={45} />{" "}
              <span className="font-editorial italic font-normal text-primary px-0.5">
                {titleHighlight}
              </span>
              {titleTrail && (
                <>
                  {" "}
                  <BlurText text={titleTrail} delayStepMs={55} />
                </>
              )}
            </h1>
          )}

          {/* Unified Description */}
          <p
            className={cn(
              "text-sm sm:text-base text-on-surface-variant font-normal leading-relaxed",
              isCenter ? "max-w-2xl mx-auto" : "max-w-2xl"
            )}
          >
            {description}
          </p>
        </AnimatedContent>

        {/* Right / Bottom Telemetry Stat Pills or Action Buttons */}
        {hasRightSlot && (
          <AnimatedContent
            trigger="mount"
            distance={28}
            direction="vertical"
            duration={0.7}
            delay={0.1}
            stagger={0.06}
            ease="power3.out"
            className="flex flex-wrap items-center gap-3 shrink-0"
          >
            {stats?.map((st, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border shadow-2xs transition-all",
                  st.accent
                    ? "bg-secondary-container/35 border-primary/25"
                    : "bg-surface-container-lowest border-outline-variant/40"
                )}
              >
                {st.icon && (
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      st.accent
                        ? "bg-primary text-on-primary"
                        : "bg-secondary-container text-on-secondary-fixed"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {st.icon}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-outline block">
                    {st.label}
                  </span>
                  <div className="text-sm font-extrabold font-headline text-on-surface leading-tight">
                    {st.value}
                  </div>
                  {st.sublabel && (
                    <span className="text-[10px] text-primary font-semibold block">
                      {st.sublabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {actions}
          </AnimatedContent>
        )}
      </div>

      {/* Optional Bottom Slot (Search Capsule, Filter Pills, Step Arc, etc.) */}
      {children && (
        <AnimatedContent
          trigger="mount"
          distance={24}
          direction="vertical"
          duration={0.7}
          delay={0.16}
          ease="power3.out"
          className="mt-7"
        >
          {children}
        </AnimatedContent>
      )}
    </section>
  );
}
