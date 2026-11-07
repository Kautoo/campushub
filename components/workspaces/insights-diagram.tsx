"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/magicui";
import { Icon } from "@/components/ui/icon";

/**
 * Animated-beam diagram: storefront → CampusHub → (PayPal, Supabase, AI).
 * Purely decorative data-flow visualization per the Stitch AI screen.
 */
export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  const node =
    "flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-lowest text-ink shadow-card";

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-lowest p-5">
      <p className="text-label-md text-muted">Data flow</p>
      <div
        ref={containerRef}
        className="relative mt-4 flex h-40 items-center justify-between px-6"
      >
        <div className="flex flex-col items-center gap-1">
          <div ref={paypalRef} className={node}>
            <Icon name="account_balance_wallet" size={22} />
          </div>
          <span className="text-label-sm text-muted">PayPal</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div ref={supabaseRef} className={node}>
            <Icon name="database" size={22} />
          </div>
          <span className="text-label-sm text-muted">Supabase</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            ref={hubRef}
            className="bg-primary-container flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-glow dark:bg-primary dark:text-[#00201c]"
          >
            <Icon name="hub" size={26} />
          </div>
          <span className="text-label-md text-ink">CampusHub</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div ref={aiRef} className={node}>
            <Icon name="auto_awesome" size={22} />
          </div>
          <span className="text-label-sm text-muted">AI</span>
        </div>

        <AnimatedBeam containerRef={containerRef} fromRef={paypalRef} toRef={hubRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={supabaseRef} toRef={hubRef} delay={0.5} />
        <AnimatedBeam containerRef={containerRef} fromRef={aiRef} toRef={hubRef} delay={1} />
      </div>
      <p className="text-body-sm text-muted mt-2">
        Insights are generated from a live metrics pack — never from invented
        numbers.
      </p>
    </div>
  );
}
