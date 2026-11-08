"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/** Reading-progress hairline pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-[var(--st-gradient-a)] to-[var(--st-gradient-b)]"
      style={{ scaleX }}
    />
  );
}
