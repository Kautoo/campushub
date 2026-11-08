import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/files";
import { files } from "@/lib/db/repo";
import { hasDatabaseEnv } from "@/lib/db";

/**
 * Signed file download route: validates the HMAC token + expiry (403 on
 * tamper/expiry), then streams the bytes with the stored mime type and an
 * attachment Content-Disposition. Replaces Supabase Storage signed URLs.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseEnv()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!verifyToken(id, token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 403 });
  }

  const file = await files.getWithBytes(id);
  if (!file) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  return new NextResponse(new Uint8Array(file.bytes), {
    status: 200,
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": String(file.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
