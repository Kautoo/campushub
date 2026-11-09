"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Weekly-insight conversation card: a grounded AI answering in a chat
 * thread without exposing internal model identifiers.
 */
export function InsightConversation() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState("");
  const [answer, setAnswer] = useState("");

  const QUESTION = "How did VIP sales do last week?";
  const ANSWER =
    "VIP tier contributed RM 3,383 — 17 of 50 seats. That's a 34% sell-through with 12 days left. At the current rate the tier sells out before doors open.";

  useEffect(() => {
    if (reduce) {
      const raf = requestAnimationFrame(() => {
        setTyped(QUESTION);
        setAnswer(ANSWER);
        setStage(3);
      });
      return () => cancelAnimationFrame(raf);
    }
    const el = document.getElementById("insight-convo");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        let qi = 0;
        const qTimer = setInterval(() => {
          qi++;
          setTyped(QUESTION.slice(0, qi));
          if (qi >= QUESTION.length) {
            clearInterval(qTimer);
            setStage(1);
            setTimeout(() => {
              setStage(2);
              let ai = 0;
              const aTimer = setInterval(() => {
                ai += 2;
                setAnswer(ANSWER.slice(0, ai));
                if (ai >= ANSWER.length) {
                  clearInterval(aTimer);
                  setStage(3);
                }
              }, 22);
            }, 650);
          }
        }, 32);
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
      <div className="relative p-6 sm:p-7">
        {/* Thread header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
            </span>
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Weekly insight
              </p>
              <p className="text-[11px] text-on-surface-variant">
                grounded · live metrics pack
              </p>
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
          <div className="bg-primary text-on-primary max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-semibold">
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
            <div className="bg-surface-container max-w-[92%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-on-surface">
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
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
              grounded in
            </span>
            {["tier sell-through", "orders by day", "stock coverage"].map(
              (chip, i) => (
                <span
                  key={chip}
                  className="rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-semibold text-on-secondary-container"
                  style={{
                    animation: reduce
                      ? undefined
                      : `chipIn 0.35s ease-out ${i * 0.12}s both`,
                  }}
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
