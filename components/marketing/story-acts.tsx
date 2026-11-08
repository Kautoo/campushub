"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Alternating "spotlight" panels that scroll-story the platform:
 * visual on one side, headline + copy revealing on the other.
 */
export type StoryAct = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  icon: string;
};

export function StoryActs({ acts }: { acts: StoryAct[] }) {
  return (
    <div className="space-y-24">
      {acts.map((act, i) => (
        <StoryActRow key={act.id} act={act} flip={i % 2 === 1} index={i} />
      ))}
    </div>
  );
}

function StoryActRow({
  act,
  flip,
  index,
}: {
  act: StoryAct;
  flip: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      // Reduced motion: reveal immediately via rAF (no setState in effect body).
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "-20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        flip ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Copy */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-label-sm uppercase tracking-[0.2em] text-primary">
          {String(index + 1).padStart(2, "0")} · {act.eyebrow}
        </p>
        <h3 className="text-on-surface mt-3 text-3xl font-semibold tracking-tight">
          {act.title}
        </h3>
        <p className="text-on-surface-variant mt-4 max-w-md text-base leading-relaxed">
          {act.body}
        </p>
        <ul className="mt-6 space-y-2.5">
          {act.bullets.map((b) => (
            <li key={b} className="text-on-surface-variant flex items-center gap-2.5 text-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">
                check_circle
              </span>
              {b}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Visual panel: real data, real UI, no screenshots */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.96, y: 24 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <div className="relative rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-card">
          <div className="animate-glow pointer-events-none absolute -inset-px rounded-2xl" aria-hidden />
          {act.id === "sell" ? <MiniOrders /> : act.id === "insight" ? <MiniInsight /> : <MiniLaunch />}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- mini product visuals (real seed figures) ---------- */

const ORDERS: { no: string; item: string; cents: number; status: string }[] = [
  { no: "CH-1040", item: "Hoodie — Midnight × 1", cents: 11900, status: "paid" },
  { no: "CH-1039", item: "Innovation Week — VIP × 2", cents: 39800, status: "paid" },
  { no: "CH-1038", item: "Sticker Pack × 3", cents: 2400, status: "pending" },
];

function MiniOrders() {
  const tone: Record<string, string> = {
    paid: "bg-success-container text-success",
    pending: "bg-warning-container text-warning",
  };
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-label-md font-semibold text-on-surface">Orders</p>
        <span className="font-mono text-[11px] text-on-surface-variant">live · MYR</span>
      </div>
      <ul>
        {ORDERS.map((o) => (
          <li key={o.no} className="flex items-center justify-between border-t border-outline-variant py-3 first:border-t-0">
            <div>
              <p className="font-mono text-[11px] text-on-surface-variant">{o.no}</p>
              <p className="text-sm text-on-surface">{o.item}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-on-surface tabular-nums">
                RM {(o.cents / 100).toFixed(2)}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone[o.status]}`}>
                {o.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniInsight() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
        <p className="text-label-md font-semibold text-on-surface">Weekly insight</p>
      </div>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        “VIP tier contributed <strong className="text-on-surface">RM 3,383</strong> —
        17 of 50 seats sold. Keycap stock covers{" "}
        <strong className="text-on-surface">3 weeks</strong> at current sell rate.”
      </p>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-[11px] font-semibold text-primary-container">
          grounded
        </span>
        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] text-on-surface-variant">
          zero fabricated numbers
        </span>
      </div>
    </div>
  );
}

function MiniLaunch() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-label-md font-semibold text-on-surface">Innovation Week 2026</p>
        <span className="rounded-full bg-success-container px-2.5 py-0.5 text-[11px] font-semibold text-success">
          published
        </span>
      </div>
      <div className="space-y-3">
        {[
          ["Student Pass", "RM 49", 142, 300],
          ["Standard Pass", "RM 99", 61, 150],
          ["VIP Pass", "RM 199", 17, 50],
        ].map(([name, price, sold, qty]) => (
          <div key={name as string}>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface">
                {name} · <span className="text-on-surface-variant">{price}</span>
              </span>
              <span className="text-on-surface-variant tabular-nums">
                {sold}/{qty}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container">
              <div
                className="animate-gradient-flow bg-gradient-kinetic h-full rounded-full"
                style={{ width: `${Math.round(((sold as number) / (qty as number)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-on-surface-variant">
        QR check-in, capacity control, PayPal checkout included.
      </p>
    </div>
  );
}
