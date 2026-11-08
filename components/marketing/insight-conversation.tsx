"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Weekly-insight conversation card: a grounded AI answering in a chat
 * thread. The question types in, "thinking" dots pulse, the answer
 * types itself out, and grounded-source chips cascade in — then a source
 * footer settles. Real seed figures; reduced motion → final state.
 */
export function InsightConversation() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0); // 0 question → 1 dots → 2 answer → 3 sources
  const [typed, setTyped] = useState("");
  const [answer, setAnswer] = useState("");

  const QUESTION = "How did VIP sales do last week?";
  const ANSWER =
    "VIP tier contributed RM 3,383 — 17 of 50 seats. That's a 34% sell-through with 12 days left. At the current rate the tier sells out before doors open.";

  useEffect(() => {
    if (reduce) {
      // Reduced motion: show the final state via rAF (no setState in effect body).
      const raf = requestAnimationFrame(() => {
        setStage(3);
        setTyped(QUESTION);
        setAnswer(ANSWER);
      });
      return () => cancelAnimationFrame(raf);
    }
    const el = document.getElementById("insight-convo");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        // Stage 0: type the question
        let i = 0;
        const typer = setInterval(() => {
          i++;
          setTyped(QUESTION.slice(0, i));
          if (i >= QUESTION.length) {
            clearInterval(typer);
            setTimeout(() => setStage(1), 350); // thinking dots
            setTimeout(() => setStage(2), 1500); // start answer
          }
        }, 28);

        // Stage 2: stream the answer
        const streamStart = setTimeout(() => {
          let j = 0;
          const streamer = setInterval(() => {
            j += 2;
            setAnswer(ANSWER.slice(0, j));
            if (j >= ANSWER.length) {
              clearInterval(streamer);
              setTimeout(() => setStage(3), 300); // source chips
            }
          }, 16);
        }, 1600);

        return () => {
          clearInterval(typer);
          clearTimeout(streamStart);
        };
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div
      id="insight-convo"
      className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest shadow-card"
    >
      {/* Teal border beam riding the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, var(--st-gradient-a) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
          animation: "borderBeamSweep 7s linear infinite",
          mixBlendMode: "overlay",
        }}
      />
      <div className="relative p-6 sm:p-7">
        {/* Thread header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/15 flex h-8 w-8 items-center justify-center rounded-lg text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </span>
            <div>
              <p className="text-label-md font-semibold text-ink">Weekly insight</p>
              <p className="text-[11px] text-muted">grounded · metrics pack #12</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-success-container px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            live
          </span>
        </div>

        {/* Question bubble */}
        <div className="mt-5 flex justify-end">
          <div className="bg-primary max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-medium text-white dark:text-[#00201c]">
            {typed || "\u00A0"}
            {stage === 0 && !reduce ? (
              <span className="type-caret ml-0.5 inline-block" />
            ) : null}
          </div>
        </div>

        {/* Thinking dots */}
        {stage === 1 ? (
          <div className="mt-4 flex items-center gap-1.5 pl-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : null}

        {/* Answer bubble */}
        {stage >= 2 ? (
          <div className="mt-4 flex justify-start">
            <div className="bg-surface-container max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-ink">
              {answer}
              {stage === 2 && !reduce && answer.length < 999 ? (
                <span className="type-caret ml-0.5 inline-block" />
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Grounded sources cascade */}
        {stage >= 3 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
              grounded in
            </span>
            {["tier sell-through", "orders by day", "stock coverage"].map((chip, i) => (
              <span
                key={chip}
                className="rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-semibold text-primary-container"
                style={{
                  animation: reduce
                    ? undefined
                    : `chipIn 0.35s ease-out ${i * 0.12}s both`,
                }}
              >
                {chip}
              </span>
            ))}
            <span className="text-muted ml-auto font-mono text-[10px]">
              glm-5.3-flash
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
