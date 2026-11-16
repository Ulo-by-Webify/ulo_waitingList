import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// ---------- Random tokens & hashing ----------

/** URL-safe random token with `bytes` bytes of entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 hex digest. Suitable for high-entropy secrets (tokens, recovery codes), not passwords. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// ---------- Encryption at rest (AES-256-GCM) ----------

const ENCRYPTION_VERSION = "v1";

function encryptionKey(): Buffer {
  const hex = process.env.DATA_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("DATA_ENCRYPTION_KEY must be 64 hex characters (openssl rand -hex 32)");
  }
  return Buffer.from(hex, "hex");
}

/** Returns `v1.iv.tag.ciphertext` (base64url parts). */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [ENCRYPTION_VERSION, iv, cipher.getAuthTag(), ciphertext].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decrypt(payload: string): string {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== ENCRYPTION_VERSION || !iv || !tag || !ciphertext) throw new Error("Unrecognised encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

// ---------- TOTP (RFC 6238: SHA-1, 6 digits, 30-second steps) ----------

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
/** Accept the previous and next step too, to tolerate small clock drift. */
const TOTP_DRIFT_STEPS = 1;

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 secret");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

function hotp(secret: Buffer, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", secret).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** TOTP_DIGITS;
  return binary.toString().padStart(TOTP_DIGITS, "0");
}

export function currentTotpStep(now = Date.now()): number {
  return Math.floor(now / 1000 / TOTP_STEP_SECONDS);
}

/** Returns the matching time step (for replay protection) or null if the code is wrong. */
export function verifyTotp(secretBase32: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const secret = base32Decode(secretBase32);
  const step = currentTotpStep(now);
  for (let drift = -TOTP_DRIFT_STEPS; drift <= TOTP_DRIFT_STEPS; drift++) {
    if (safeEqual(hotp(secret, step + drift), code)) return step + drift;
  }
  return null;
}

export function totpAuthUri(secretBase32: string, accountEmail: string, issuer = "Ulô Admin"): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({ secret: secretBase32, issuer, algorithm: "SHA1", digits: String(TOTP_DIGITS), period: String(TOTP_STEP_SECONDS) });
  return `otpauth://totp/${label}?${params}`;
}

// ---------- Recovery codes ----------

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i

/** Format: xxxxx-xxxxx (~50 bits of entropy each). */
export function generateRecoveryCode(): string {
  const bytes = randomBytes(10);
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join("");
  return `${chars.slice(0, 5)}-${chars.slice(5)}`;
}

export function normalizeRecoveryCode(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
