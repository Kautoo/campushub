"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetic hover on a focal CTA: element drifts toward the pointer,
 * clamped to 30% of the offset so it never leaves its hit box.
 * Max 1-2 magnetic elements per screen (used only on the hero primary).
 * Respects prefers-reduced-motion by doing nothing.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left - r.width / 2) * strength;
      y = (e.clientY - r.top - r.height / 2) * strength;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span
      ref={ref}
      className={`inline-block will-change-transform transition-transform duration-300 ease-out ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
