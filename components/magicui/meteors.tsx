import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface MeteorsProps {
  /** Number of meteors. */
  number?: number;
  className?: string;
}

const METEOR_KEYFRAMES = `
@keyframes magicui-meteor {
  0% {
    transform: rotate(var(--meteor-angle)) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--meteor-angle)) translateX(-500px);
    opacity: 0;
  }
}
`;

/** Deterministic PRNG (mulberry32) — same offsets on server and client. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Meteors({ number = 12, className }: MeteorsProps) {
  return (
    <>
      <style>{METEOR_KEYFRAMES}</style>
      {Array.from({ length: number }, (_, idx) => {
        const rand = mulberry32(idx + 1);
        const left = Math.floor(rand() * 100);
        const top = Math.floor(rand() * 30) - 10;
        const animationDelay = `${(rand() * 6).toFixed(2)}s`;
        const animationDuration = `${(2 + rand() * 4).toFixed(2)}s`;

        return (
          <span
            key={idx}
            className={cn(
              "pointer-events-none absolute size-0.5 rounded-full bg-current shadow-[0_0_0_1px_rgba(255,255,255,0.1)] before:absolute before:top-1/2 before:left-0 before:h-px before:w-[60px] before:-translate-x-full before:-translate-y-1/2 before:bg-gradient-to-r before:from-current before:to-transparent",
              className
            )}
            style={
              {
                "--meteor-angle": "215deg",
                left: `${left}%`,
                top: `${top}px`,
                color: "var(--st-primary)",
                animation: `magicui-meteor ${animationDuration} linear ${animationDelay} infinite`,
              } as CSSProperties
            }
          />
        );
      })}
    </>
  );
}

export default Meteors;
