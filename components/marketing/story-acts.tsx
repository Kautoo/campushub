"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-16">
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
    if (reduce) {
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const isOrders = act.id === "sell" || act.id === "act-orders";
  const isInsight = act.id === "insight" || act.id === "act-ai";

  return (
    <div
      ref={ref}
      className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-12 rounded-3xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 lg:p-10 shadow-xs ${
        flip ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Copy Column (6 cols) */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-6 space-y-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-low border border-outline-variant/50 px-3 py-1">
          <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold tabular-nums">
            {index + 1}
          </span>
          <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-bold">
            {act.eyebrow}
          </span>
        </div>

        <h3 className="text-headline-lg font-bold text-on-surface tracking-tight">
          {act.title}
        </h3>

        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          {act.body}
        </p>

        <ul className="space-y-2.5 pt-2 border-t border-outline-variant/40">
          {act.bullets.map((b) => (
            <li
              key={b}
              className="text-on-surface flex items-start gap-2.5 text-body-md"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
                check_circle
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Live UI Visual Panel (6 cols) */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.97, y: 20 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="lg:col-span-6"
      >
        <div className="rounded-2xl border border-outline-variant/60 bg-surface-low/60 p-5 sm:p-6">
          {isOrders ? (
            <MiniOrders />
          ) : isInsight ? (
            <MiniInsight />
          ) : (
            <MiniLaunch />
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Live Product Visual Cards ---------- */

const ORDERS = [
  {
    no: "CH-1040",
    buyer: "Aminah Hassan",
    item: "Hoodie — Midnight × 1",
    cents: 11900,
    status: "paid" as const,
  },
  {
    no: "CH-1039",
    buyer: "Wei Jian Lim",
    item: "Innovation Week — VIP × 2",
    cents: 39800,
    status: "fulfilled" as const,
  },
  {
    no: "CH-1038",
    buyer: "Priya Nair",
    item: "Sticker Pack (12) × 3",
    cents: 2400,
    status: "paid" as const,
  },
];

function MiniLaunch() {
  return (
    <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider font-bold text-secondary block">
            Bryntum Venue Track · Main Hall, Block C
          </span>
          <p className="text-headline-sm font-bold text-on-surface">
            Innovation Week 2026
          </p>
        </div>
        <Badge tone="success" icon="verified">
          Published
        </Badge>
      </div>
      <div className="space-y-3">
        {[
          ["Student Pass", "RM 49.00", 142, 300],
          ["Standard Pass", "RM 99.00", 61, 150],
          ["VIP Pass", "RM 199.00", 17, 50],
        ].map(([name, price, sold, qty]) => {
          const pct = Math.round(((sold as number) / (qty as number)) * 100);
          return (
            <div key={name as string} className="space-y-1">
              <div className="flex justify-between text-body-sm">
                <span className="font-semibold text-on-surface">
                  {name} ·{" "}
                  <span className="text-primary font-bold">{price}</span>
                </span>
                <span className="text-on-surface-variant tabular-nums">
                  {sold}/{qty} ({pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs text-on-surface-variant">
        <span>Instant QR pass token issued on checkout</span>
        <span className="font-semibold text-secondary">220 / 500 sold</span>
      </div>
    </div>
  );
}

function MiniOrders() {
  return (
    <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider font-bold text-secondary block">
            AG Grid Orders Ledger
          </span>
          <p className="text-headline-sm font-bold text-on-surface">
            Live PayPal Orders v2 Captures
          </p>
        </div>
        <Badge tone="teal" icon="lock">
          HMAC Verified
        </Badge>
      </div>
      <ul className="divide-y divide-outline-variant/40">
        {ORDERS.map((o) => (
          <li
            key={o.no}
            className="flex items-center justify-between py-2.5 gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-surface-container px-1.5 py-0.2 font-mono text-[11px] font-semibold text-primary">
                  {o.no}
                </span>
                <span className="text-body-sm font-semibold text-on-surface truncate">
                  {o.buyer}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{o.item}</p>
            </div>
            <div className="text-right shrink-0 tabular-nums">
              <p className="text-body-sm font-bold text-primary">
                RM {(o.cents / 100).toFixed(2)}
              </p>
              <Badge tone={o.status === "fulfilled" ? "teal" : "success"}>
                {o.status}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniInsight() {
  return (
    <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">
              auto_awesome
            </span>
          </div>
          <div>
            <p className="text-headline-sm font-bold text-on-surface">
              Grounded Weekly Brief
            </p>
            <span className="text-[11px] text-on-surface-variant">
              Computed from live Postgres metrics pack
            </span>
          </div>
        </div>
        <Badge tone="teal">Zero-PII</Badge>
      </div>
      <p className="text-body-md leading-relaxed text-on-surface">
        “VIP tier contributed{" "}
        <strong className="text-primary">RM 3,383.00</strong> across 17 sold
        passes (34% sell-through). Mech Keycap Set has{" "}
        <strong className="text-warning">8 units left</strong> — restock
        recommended before Innovation Week.”
      </p>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/40">
        <Badge tone="teal" icon="verified">
          Grounded in Postgres
        </Badge>
        <Badge tone="neutral">Zero fabricated numbers</Badge>
      </div>
    </div>
  );
}
