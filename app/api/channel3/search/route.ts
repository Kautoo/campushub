import { NextResponse } from "next/server";
import { z } from "zod";
import { channel3Search } from "@/lib/channel3";

const bodySchema = z.object({
  query: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const results = await channel3Search(parsed.data.query);
  return NextResponse.json({ results });
}
