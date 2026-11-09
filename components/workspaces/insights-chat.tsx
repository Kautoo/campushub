"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const QUICK_PROMPTS = [
  "What were our top revenue events?",
  "List SKUs below low-stock threshold",
  "Summarize VIP pass sell-through rate",
  "Break down recent refunds and chargebacks",
];

/** "Ask your data" chat — streams plain text from /api/insights/chat. */
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
  const listRef = useRef<HTMLDivElement>(null);

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
                ? "Astropods Agent is offline. Configure ASTRO_GATEWAY_URL and ASTRO_GATEWAY_API_KEY."
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
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
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
          text: "Network or streaming error while querying Astropods Agent.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <p className="text-body-sm text-on-surface-variant">
          {notice ?? "Create your organization first to enable AI chat."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/35">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            forum
          </span>
          <h2 className="text-headline-sm font-bold text-on-surface">
            Ask Your Postgres Data
          </h2>
        </div>
        <span className="text-label-sm text-on-surface-variant">
          Grounded chat via Astropods
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length === 0 ? (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            Suggested Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => void send(p)}
                className="rounded-lg border border-outline-variant/60 bg-surface-low px-3 py-1.5 text-label-sm font-medium text-on-surface hover:bg-surface-container hover:border-primary/50 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Chat History Box */}
      <div
        ref={listRef}
        className="h-72 overflow-y-auto space-y-3 rounded-xl border border-outline-variant/40 bg-surface-low/60 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
              smart_toy
            </span>
            <p className="text-body-sm font-medium text-on-surface">
              Ask any question about your campus store or event velocity.
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Answers are computed strictly from real Postgres numbers with zero hallucinations.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-primary text-on-primary font-medium"
                    : "bg-surface-lowest text-on-surface border border-outline-variant/50"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text || "…"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Box & High-Contrast Send Button */}
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask about revenue, low stock items, or event ticket sales…"
          disabled={busy}
          className="focus-aura h-11 flex-1 rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-label-md font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-all shrink-0 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">
            {busy ? "hourglass_top" : "send"}
          </span>
          <span>{busy ? "Thinking…" : "Send"}</span>
        </button>
      </div>
    </div>
  );
}
