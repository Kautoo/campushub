/** Channel3 market discovery (server-only; key stays in env). */
export type Channel3Result = {
  title: string;
  price_cents: number | null;
  url: string;
  source: string;
};

const CHANNEL3_BASE = "https://api.trychannel3.com";

export function hasChannel3(): boolean {
  return Boolean(process.env.CHANNEL3_API_KEY);
}

export async function channel3Search(
  query: string,
): Promise<Channel3Result[] | null> {
  const key = process.env.CHANNEL3_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `${CHANNEL3_BASE}/v1/search?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) {
    console.error("channel3 search failed", res.status);
    return null;
  }
  const json = (await res.json()) as {
    results?: { title?: string; price_cents?: number; url?: string; source?: string }[];
  };
  return (json.results ?? [])
    .filter((r) => r.title && r.url)
    .slice(0, 6)
    .map((r) => ({
      title: r.title!,
      price_cents: typeof r.price_cents === "number" ? r.price_cents : null,
      url: r.url!,
      source: r.source ?? "channel3",
    }));
}
