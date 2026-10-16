/**
 * Sealed binary blobs: local storage for data that must stay readable only to someone who
 * already holds the wallet's secrets (used for the wallet engine's saved sync state).
 *
 * Key derivation: HKDF-SHA256 (Web Crypto) over a wallet secret (the recovery phrase, or
 * the private view key for watch-only wallets), a random per-blob salt and a context
 * string. Encryption: AES-256-GCM, with the context also bound as additional data, so a
 * blob sealed for one wallet cannot be opened as another's. No custom primitives.
 *
 * Why a wallet secret and not the user's password: the saved state is written repeatedly
 * while the wallet is open, when only the decrypted secrets are in memory. Anyone able to
 * derive this key already holds the seed, which is itself protected by the password vault.
 */
import { VaultError } from "./vault";

export const SEALED_VERSION = 1;

export interface SealedBlob {
  v: typeof SEALED_VERSION;
  alg: "HKDF-SHA256/AES-256-GCM";
  salt: Uint8Array<ArrayBuffer>;
  iv: Uint8Array<ArrayBuffer>;
  data: Uint8Array<ArrayBuffer>; // ciphertext + GCM tag
}

const enc = new TextEncoder();
// Legacy identifier from the pre-rebrand name. Do NOT rename: existing wallets and saved
// state are stored under it, and changing it would make them unreadable.
const INFO_PREFIX = "quietmint/sealed/v1|";

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new VaultError("Web Crypto is not available in this environment", "UNSUPPORTED");
  return s;
}

async function deriveKey(secret: string, salt: Uint8Array<ArrayBuffer>, context: string): Promise<CryptoKey> {
  if (!secret) throw new VaultError("A wallet secret is required", "UNSUPPORTED");
  const base = await subtle().importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode(INFO_PREFIX + context) },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function sealBytes(plain: Uint8Array, secret: string, context: string): Promise<SealedBlob> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt, context);
  const ct = await subtle().encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(context) }, key, new Uint8Array(plain));
  return { v: SEALED_VERSION, alg: "HKDF-SHA256/AES-256-GCM", salt, iv, data: new Uint8Array(ct) };
}

export async function openBytes(blob: SealedBlob, secret: string, context: string): Promise<Uint8Array<ArrayBuffer>> {
  if (blob?.v !== SEALED_VERSION || blob.alg !== "HKDF-SHA256/AES-256-GCM") {
    throw new VaultError("Unsupported sealed data format", "UNSUPPORTED");
  }
  const key = await deriveKey(secret, new Uint8Array(blob.salt), context);
  try {
    return new Uint8Array(await subtle().decrypt({ name: "AES-GCM", iv: new Uint8Array(blob.iv), additionalData: enc.encode(context) }, key, new Uint8Array(blob.data)));
  } catch {
    // Wrong secret, wrong wallet context, or tampered data. Indistinguishable by design.
    throw new VaultError("Sealed data could not be opened", "CORRUPT");
  }
}

/**
 * Length-prefixed packing of several byte arrays into one (4-byte big-endian length per
 * part). Used to store the engine password, keys file and cache file as one sealed blob.
 */
export function packParts(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((n, p) => n + 4 + p.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let o = 0;
  for (const p of parts) {
    view.setUint32(o, p.length);
    out.set(p, o + 4);
    o += 4 + p.length;
  }
  return out;
}

export function unpackParts(bytes: Uint8Array): Uint8Array[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [];
  let o = 0;
  while (o < bytes.length) {
    if (o + 4 > bytes.length) throw new VaultError("Sealed data is corrupt", "CORRUPT");
    const len = view.getUint32(o);
    if (o + 4 + len > bytes.length) throw new VaultError("Sealed data is corrupt", "CORRUPT");
    parts.push(bytes.slice(o + 4, o + 4 + len));
    o += 4 + len;
  }
  return parts;
}
