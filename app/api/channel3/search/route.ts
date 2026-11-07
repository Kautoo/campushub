import { NextResponse } from "next/server";
import { z } from "zod";
import { channel3Search } from "@/lib/channel3";

/**
 * Channel3 market-discovery proxy. API key stays server-side.
 * Without CHANNEL3_API_KEY the widget is hidden client-side; this route
 * returns 503 so nothing fake can leak through.
 */
const bodySchema = z.object({
  query: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  if (!process.env.CHANNEL3_API_KEY) {
    return NextResponse.json({ error: "channel3_not_configured" }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const results = await channel3Search(parsed.data.query);
  if (!results) {
    return NextResponse.json({ error: "channel3_error" }, { status: 502 });
  }
  return NextResponse.json({ results });
}
