/**
 * DB-backed file store replacing Supabase Storage.
 * Files live in public.files (bytea); "signed URLs" are HMAC-token URLs to
 * /api/files/[id] with a 24h expiry embedded — mirroring the old signed-URL
 * semantics without any external storage service.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { files } from "@/lib/db/repo";

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is required for file signing");
  return s;
}

/** HMAC token: `<fileId>.<expiresEpochSec>.<hex signature>`. */
export function signedToken(fileId: string, now = Date.now()): {
  token: string;
  expires: number;
} {
  const expires = Math.floor(now / 1000) + TOKEN_TTL_SECONDS;
  const sig = createHmac("sha256", secret())
    .update(`${fileId}.${expires}`)
    .digest("hex");
  return { token: `${fileId}.${expires}.${sig}`, expires };
}

/** Validate a token for a file id. Returns false on tamper/expiry. */
export function verifyToken(
  fileId: string,
  token: string,
  now = Date.now(),
): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenFileId, expiresStr, sig] = parts;
  if (tokenFileId !== fileId) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires * 1000 < now) return false;
  const expected = createHmac("sha256", secret())
    .update(`${fileId}.${expiresStr}`)
    .digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function putFile(fields: {
  orgId: string;
  bucket: string;
  name: string;
  mime: string;
  bytes: Buffer;
  createdBy: string | null;
}): Promise<string | null> {
  const row = await files.insert({
    org_id: fields.orgId,
    bucket: fields.bucket,
    name: fields.name,
    mime: fields.mime,
    bytes: fields.bytes,
    created_by: fields.createdBy,
  });
  return row?.id ?? null;
}

/** Build the signed download URL for a stored file. */
export function signedUrl(fileId: string): string {
  const { token, expires } = signedToken(fileId);
  return `/api/files/${fileId}?token=${token}&expires=${expires}`;
}
