"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dealt moment (type-led): the insight types itself once when the section
 * enters the viewport, with a blinking caret. Reduced motion → full text
 * immediately, no caret. Runs once per load.
 */
export function TypewriterInsight({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      aria-label={text}
      className={`text-body-lg text-ink leading-relaxed ${run ? "type-run" : ""}`}
    >
      <span className="type-reveal" aria-hidden>
        {text}
      </span>
      <span className="type-caret" aria-hidden />
    </p>
  );
}
