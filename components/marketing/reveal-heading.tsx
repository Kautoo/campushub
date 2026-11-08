"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Word-by-word masked rise for section headings — each word slides up from
 * behind its own clip line when the heading enters the viewport. Runs once.
 * Reduced motion: words render in place, no animation.
 */
export function RevealHeading({
  text,
  className,
  accentWord,
}: {
  text: string;
  className?: string;
  /** This word renders in the editorial serif italic accent. */
  accentWord?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045 } },
  };
  const word = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <motion.h2
      ref={ref}
      className={className}
      variants={container}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            variants={word}
            className={`inline-block ${accentWord && w === accentWord ? "font-editorial text-primary italic font-medium" : ""}`}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}
