/**
 * scrypt password hashing via node:crypto (no external deps).
 * Format: scrypt$N$r$p$salthex$keyhex — self-describing for future param changes.
 */
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEYLEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltHex, keyHex] = parts;
  try {
    const key = await scryptAsync(password, Buffer.from(saltHex, "hex"), keyHex.length / 2, {
      N: Number(nStr),
      r: Number(rStr),
      p: Number(pStr),
    });
    return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
  } catch {
    return false;
  }
}
