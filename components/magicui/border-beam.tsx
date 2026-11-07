"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface BorderBeamProps {
  className?: string;
  /** Beam square size in px; also the border corner radius. */
  size?: number;
  /** Seconds per full loop around the border. */
  duration?: number;
  /** Delay in seconds (negative values start mid-loop). */
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  reverse?: boolean;
}

export function BorderBeam({
  className,
  size = 60,
  duration = 6,
  delay = 0,
  colorFrom = "var(--st-gradient-a)",
  colorTo = "var(--st-gradient-b)",
  reverse = false,
}: BorderBeamProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn("absolute aspect-square", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            background: `linear-gradient(to left, transparent, ${colorFrom}, ${colorTo})`,
          } as CSSProperties
        }
        initial={{ offsetDistance: "0%" }}
        animate={{
          offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
}

export default BorderBeam;
