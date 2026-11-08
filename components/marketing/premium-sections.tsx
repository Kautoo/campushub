"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Big-stat section where numerals count up from zero when the section
 * enters view. Real seed figures; runs once.
 */
export function StatWall({
  stats,
}: {
  stats: { label: string; value: number; money?: boolean; icon: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? undefined : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="bg-surface-lowest p-8 text-center"
        >
          <p className="text-ink text-4xl font-bold tracking-tight tabular-nums">
            {s.money ? <span className="text-muted text-2xl font-semibold">RM </span> : null}
            <Counter to={s.value} reduce={!!reduce} />
          </p>
          <p className="text-muted mt-2 flex items-center justify-center gap-1.5 text-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">{s.icon}</span>
            {s.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function Counter({ to, reduce }: { to: number; reduce: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) {
      // Reduced motion: jump straight to the target via rAF (no setState in
      // effect body).
      const raf = requestAnimationFrame(() => setN(to));
      return () => cancelAnimationFrame(raf);
    }
    // Count up when the element first becomes visible (IO, fires once)
    const els = document.querySelectorAll("[data-counter-target]");
    const el = Array.from(els).find((e) => e.textContent === to.toLocaleString("en-MY"));
    if (!el) {
      const fallback = requestAnimationFrame(() => setN(to));
      return () => cancelAnimationFrame(fallback);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          const t0 = performance.now();
          const dur = 1200;
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, reduce]);

  return (
    <span data-counter-target={to}>
      {n.toLocaleString("en-MY")}
    </span>
  );
}

/**
 * Parallax-rising section divider: a gradient hairline that widens as it
 * scrolls into view — a quiet premium rhythm beat between sections.
 */
export function SectionBeat() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const width = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "64%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div ref={ref} aria-hidden className="flex justify-center py-2">
      <motion.div
        style={{ width, opacity }}
        className="animate-gradient-flow bg-gradient-kinetic h-px rounded-full"
      />
    </div>
  );
}
