"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTED_PROMPTS = [
  {
    icon: "payments",
    title: "Revenue & Sales Performance",
    desc: "Gross revenue, paid orders count, and AOV breakdown",
    prompt: "How much is our gross revenue, order volume, and average order value?",
  },
  {
    icon: "inventory_2",
    title: "Best-Selling Merchandise",
    desc: "Top products ranked by units sold and total revenue",
    prompt: "Which merchandise items are top-selling and generating the most revenue?",
  },
  {
    icon: "confirmation_number",
    title: "Event Pass Sell-Through",
    desc: "Capacity fill rates and seats remaining across events",
    prompt: "How are our event ticket passes performing across published events?",
  },
  {
    icon: "warning",
    title: "Stock & Risk Audit",
    desc: "SKUs below safety thresholds and refund telemetry",
    prompt: "Are any products low on stock, and what is our refund status?",
  },
];

/**
 * Modern ChatGPT-style conversational interface for live PostgreSQL data.
 * Features streaming responses, chat history, suggested prompt cards,
 * copy-to-clipboard, clear session, and live grounded telemetry.
 */
export function InsightsChat({
  disabled,
  notice,
}: {
  disabled?: boolean;
  notice?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll as messages stream in
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, busy]);

  async function copyText(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {}
  }

  function handleReset() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  async function send(queryText?: string) {
    const q = (queryText ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const history = [...messages, { role: "user" as const, text: q }];
    setMessages([...history, { role: "assistant", text: "" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/insights/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok || !res.body) {
        setMessages([
          ...history,
          {
            role: "assistant",
            text:
              res.status === 503
                ? "AI Commerce Agent is offline or busy. Please verify your connection or try again."
                : "Unable to process query at this time.",
          },
        ]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", text: acc }]);
      }
      if (!acc) {
        setMessages([
          ...history,
          { role: "assistant", text: "(No data returned for this query)" },
        ]);
      }
    } catch {
      setMessages([
        ...history,
        {
          role: "assistant",
          text: "Network or streaming error while querying AI Commerce Agent.",
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-3xl border border-outline-variant/45 bg-surface-lowest p-8 shadow-xs text-center space-y-2">
        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">
          lock
        </span>
        <p className="text-body-md font-semibold text-on-surface">
          AI Analyst Unavailable
        </p>
        <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
          {notice ?? "Create or select your active society workspace to unlock live grounded AI queries."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-outline-variant/50 bg-surface-lowest shadow-sm overflow-hidden flex flex-col min-h-[580px] max-h-[700px]">
      {/* ChatGPT-Style Workspace Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/40 bg-surface-low/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-600 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-label-lg font-bold text-on-surface leading-tight">
                CampusHub AI Analyst
              </h2>
              <Badge tone="teal">Grounded</Badge>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Live PostgreSQL telemetry · Zero hallucinations
            </p>
          </div>
        </div>

        {messages.length > 0 ? (
          <button
            type="button"
            onClick={handleReset}
            title="Start new chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/60 bg-surface-lowest hover:bg-surface-low text-on-surface-variant hover:text-on-surface text-label-sm font-semibold transition-colors cursor-pointer outline-none focus:outline-none"
          >
            <span className="material-symbols-outlined text-[15px]">
              restart_alt
            </span>
            <span>New Chat</span>
          </button>
        ) : null}
      </div>

      {/* Main Conversation Canvas */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto py-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/15 to-teal-600/15 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <span className="material-symbols-outlined text-[32px]">
                auto_awesome
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-headline-md font-bold text-on-surface">
                How can I help with your campus data today?
              </h3>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Ask about settled revenue, ticket sell-through rates, top-selling
                merchandise, or low-stock warnings. Answers are strictly grounded
                in your database aggregates.
              </p>
            </div>

            {/* ChatGPT-style 2x2 Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              {SUGGESTED_PROMPTS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(item.prompt)}
                  className="group rounded-2xl border border-outline-variant/60 bg-surface-low/50 hover:bg-surface-low hover:border-primary/50 p-4 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer outline-none focus:outline-none"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-label-md font-bold text-on-surface">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3.5 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                </div>
              ) : null}

              <div
                className={`flex flex-col space-y-1.5 ${
                  m.role === "user" ? "items-end max-w-[80%]" : "items-start max-w-[88%]"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3.5 text-body-md leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-on-primary font-medium rounded-tr-sm shadow-xs"
                      : "bg-surface-low/70 text-on-surface border border-outline-variant/45 rounded-tl-sm shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text || "…"}</p>
                </div>

                {m.role === "assistant" && m.text ? (
                  <div className="flex items-center gap-2 pl-1">
                    <button
                      type="button"
                      onClick={() => void copyText(m.text, i)}
                      title="Copy response"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-0.5 px-1.5 rounded hover:bg-surface-low cursor-pointer outline-none focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIdx === i ? "check" : "content_copy"}
                      </span>
                      <span>{copiedIdx === i ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                ) : null}
              </div>

              {m.role === "user" ? (
                <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 border border-outline-variant/60 shadow-2xs mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </div>
              ) : null}
            </div>
          ))
        )}

        {busy && messages[messages.length - 1]?.text === "" ? (
          <div className="flex items-center gap-3 pl-1 text-on-surface-variant text-xs animate-pulse">
            <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-primary">
                hourglass_top
              </span>
            </div>
            <span>Analyzing live PostgreSQL metrics pack…</span>
          </div>
        ) : null}
      </div>

      {/* ChatGPT-Style Pill Input Bar — No Black Outline, High-Contrast Enter Button */}
      <div className="p-4 sm:p-5 border-t border-outline-variant/40 bg-surface-lowest">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="relative flex items-center rounded-2xl border border-outline-variant/70 bg-surface-low/70 focus-within:bg-surface-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 transition-all p-1.5 pl-4 shadow-xs outline-none focus:outline-none"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message CampusHub AI Analyst (e.g. 'how much revenue?', 'which products sold most?')..."
            disabled={busy}
            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-body-md text-on-surface placeholder:text-on-surface-variant/70 py-1.5 pr-2"
          />

          <button
            type="submit"
            disabled={busy || !input.trim()}
            title={input.trim() ? "Send message" : "Type a message to send"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer outline-none focus:outline-none ${
              input.trim() && !busy
                ? "bg-primary text-on-primary shadow-xs hover:opacity-90 active:scale-95"
                : "bg-surface-container text-on-surface-variant/50 border border-outline-variant/50 cursor-not-allowed opacity-60"
            }`}
          >
            <span className="material-symbols-outlined text-[19px] font-bold">
              arrow_upward
            </span>
          </button>
        </form>

        <p className="text-[11px] text-center text-on-surface-variant/70 mt-2">
          CampusHub AI answers strictly from real-time PostgreSQL aggregates. Zero personally identifiable data.
        </p>
      </div>
    </div>
  );
}
