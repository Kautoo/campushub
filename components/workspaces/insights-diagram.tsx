"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/magicui";
import { Icon } from "@/components/ui/icon";

/**
 * Animated-beam diagram: storefront → CampusHub → (PayPal, Render Postgres, AI).
 * Purely decorative data-flow visualization per the Stitch AI screen.
 */
export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  const node =
    "flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm text-on-surface shadow-card";

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg">
      <p className="text-label-md text-on-surface-variant">Data flow</p>
      <div
        ref={containerRef}
        className="relative mt-4 flex h-40 items-center justify-between px-6"
      >
        <div className="flex flex-col items-center gap-1">
          <div ref={paypalRef} className={node}>
            <Icon name="account_balance_wallet" size={22} />
          </div>
          <span className="text-label-sm text-on-surface-variant">PayPal</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div ref={dbRef} className={node}>
            <Icon name="database" size={22} />
          </div>
          <span className="text-label-sm text-on-surface-variant">Render Postgres</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            ref={hubRef}
            className="bg-primary-container flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-glow dark:bg-primary dark:text-[#00201c]"
          >
            <Icon name="hub" size={26} />
          </div>
          <span className="text-label-md text-on-surface">CampusHub</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div ref={aiRef} className={node}>
            <Icon name="auto_awesome" size={22} />
          </div>
          <span className="text-label-sm text-on-surface-variant">AI</span>
        </div>

        <AnimatedBeam containerRef={containerRef} fromRef={paypalRef} toRef={hubRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={dbRef} toRef={hubRef} delay={0.5} />
        <AnimatedBeam containerRef={containerRef} fromRef={aiRef} toRef={hubRef} delay={1} />
      </div>
      <p className="text-body-sm text-on-surface-variant mt-2">
        Insights are generated from a live metrics pack — never from invented
        numbers.
      </p>
    </div>
  );
}
