"use client";

import { useState } from "react";
import { ShimmerAIButton } from "@/components/ui/kinetic-buttons";
import { BorderBeam } from "@/components/magicui";

type Kind = "summary" | "anomaly" | "recommendation";

/** One-click grounded insight cards (summary / anomaly / recommendation). */
export function InsightGenerator({
  disabled,
  notice,
}: {
  disabled?: boolean;
  notice?: string;
}) {
  const [busy, setBusy] = useState<Kind | null>(null);
  const [results, setResults] = useState<Partial<Record<Kind, string>>>({});
  const [error, setError] = useState<string | null>(null);

  async function generate(kind: Kind) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "ai_not_configured") {
          setError("AI gateway is not configured (AI_BASE_URL / AI_API_KEY).");
        } else {
          setError(json.error ?? "ai_error");
        }
        return;
      }
      setResults((r) => ({ ...r, [kind]: json.response as string }));
    } catch {
      setError("Generation failed.");
    } finally {
      setBusy(null);
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

  const cards: { kind: Kind; title: string; icon: string }[] = [
    { kind: "summary", title: "Commerce summary", icon: "summary" },
    { kind: "anomaly", title: "Anomaly scan", icon: "warning" },
    { kind: "recommendation", title: "Recommendations", icon: "lightbulb" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {cards.map((c) => (
          <ShimmerAIButton
            key={c.kind}
            onPress={() => void generate(c.kind)}
            isDisabled={busy !== null}
          >
            {busy === c.kind ? "Analyzing…" : c.title}
          </ShimmerAIButton>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) =>
          results[c.kind] ? (
            <div
              key={c.kind}
              className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-low p-5"
            >
              <BorderBeam size={70} duration={9} />
              <h3 className="text-headline-sm text-ink">{c.title}</h3>
              <p className="text-body-sm text-muted mt-2 whitespace-pre-wrap">
                {results[c.kind]}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
