"use client";

import { useRef, useState } from "react";
import { ShimmerAIButton } from "@/components/ui/kinetic-buttons";

type Msg = { role: "user" | "assistant"; text: string };

/** "Ask your data" chat — streams plain text from /api/insights/chat. */
export function InsightsChat({ disabled, notice }: { disabled?: boolean; notice?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send() {
    const q = input.trim();
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
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "ai_error");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", text: acc }]);
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      }
      if (!acc) {
        setMessages([...history, { role: "assistant", text: "(empty response)" }]);
      }
    } catch (e) {
      setMessages([
        ...history,
        {
          role: "assistant",
          text:
            e instanceof Error && e.message !== "ai_error"
              ? `Error: ${e.message}`
              : "Generation failed — check the AI gateway configuration.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
        <p className="text-body-sm text-muted">
          {notice ?? "AI gateway is not configured."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-lowest p-5">
      <div
        ref={listRef}
        className="max-h-96 space-y-3 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-body-sm text-muted">
            Ask about your data — “How did revenue trend last week?”, “Which
            products should I restock?”, “Any anomalies?” Answers are grounded
            in a live metrics pack, never invented.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "bg-primary ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-white dark:text-[#00201c]"
                  : "bg-surface-container max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2 text-ink"
              }
            >
              <p className="text-body-md whitespace-pre-wrap">{m.text || "…"}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask your data…"
          disabled={busy}
          className="focus-aura h-11 w-full rounded-full border border-outline-variant bg-surface-low px-4 text-body-md text-ink outline-none placeholder:text-muted"
        />
        <ShimmerAIButton onPress={() => void send()} isDisabled={busy || !input.trim()}>
          {busy ? "Thinking…" : "Ask"}
        </ShimmerAIButton>
      </div>
    </div>
  );
}
