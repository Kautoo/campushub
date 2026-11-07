"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type UseInViewOptions, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

export interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  /** Travel distance in px. */
  offset?: number;
  /** Direction the content travels from. */
  direction?: "up" | "down" | "left" | "right";
  inViewMargin?: UseInViewOptions["margin"];
  /** Initial blur amount. */
  blur?: string;
}

export function BlurFade({
  children,
  className,
  duration = 0.5,
  delay = 0,
  offset = 6,
  direction = "up",
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: inViewMargin });

  const variants: Variants = {
    hidden: {
      y: direction === "up" ? offset : direction === "down" ? -offset : 0,
      x: direction === "left" ? offset : direction === "right" ? -offset : 0,
      filter: `blur(${blur})`,
      opacity: 0,
    },
    visible: {
      y: 0,
      x: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        delay: 0.04 + delay,
        duration,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export default BlurFade;
