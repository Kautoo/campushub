"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  value: number;
  decimalPlaces?: number;
  className?: string;
  /** Delay in seconds before the count-up starts once in view. */
  delay?: number;
  startValue?: number;
}

export function NumberTicker({
  value,
  decimalPlaces = 0,
  className,
  delay = 0,
  startValue = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView || !ref.current) return;

    const controls = animate(startValue, value, {
      duration: 2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = latest.toLocaleString("en-MY", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          });
        }
      },
    });

    return () => controls.stop();
  }, [inView, startValue, value, delay, decimalPlaces]);

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums tracking-wider", className)}
    >
      {startValue.toLocaleString("en-MY", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}
    </span>
  );
}

export default NumberTicker;
