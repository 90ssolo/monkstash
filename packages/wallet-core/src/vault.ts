/**
 * Password-encrypted storage for wallet secrets.
 *
 * Key derivation: PBKDF2-SHA256 (Web Crypto). Encryption: AES-256-GCM.
 * Everything runs locally; the password and plaintext never leave the device.
 */

export const VAULT_VERSION = 1;
export const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation for PBKDF2-SHA256

export interface EncryptedVault {
  v: typeof VAULT_VERSION;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64 ciphertext + GCM tag
}

export class VaultError extends Error {
  constructor(message: string, readonly code: "WRONG_PASSWORD" | "CORRUPT" | "UNSUPPORTED") {
    super(message);
    this.name = "VaultError";
  }
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new VaultError("Web Crypto is not available in this environment", "UNSUPPORTED");
  return s;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await subtle().importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(value: unknown, password: string, iterations = PBKDF2_ITERATIONS): Promise<EncryptedVault> {
  if (!password) throw new VaultError("Password is required", "UNSUPPORTED");
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, iterations);
  const ct = await subtle().encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(value)));
  return { v: VAULT_VERSION, kdf: "PBKDF2-SHA256", iterations, salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(ct)) };
}

export async function decryptJson<T>(vault: EncryptedVault, password: string): Promise<T> {
  if (vault?.v !== VAULT_VERSION || vault.kdf !== "PBKDF2-SHA256") {
    throw new VaultError("Unsupported vault format", "UNSUPPORTED");
  }
  let key: CryptoKey;
  let iv: Uint8Array<ArrayBuffer>;
  let data: Uint8Array<ArrayBuffer>;
  try {
    key = await deriveKey(password, fromB64(vault.salt), vault.iterations);
    iv = fromB64(vault.iv);
    data = fromB64(vault.data);
  } catch {
    throw new VaultError("Vault data is corrupt", "CORRUPT");
  }
  let plain: ArrayBuffer;
  try {
    plain = await subtle().decrypt({ name: "AES-GCM", iv }, key, data);
  } catch {
    // GCM authentication failure: wrong password or tampered data. Indistinguishable by design.
    throw new VaultError("Wrong password", "WRONG_PASSWORD");
  }
  try {
    return JSON.parse(dec.decode(plain)) as T;
  } catch {
    throw new VaultError("Vault data is corrupt", "CORRUPT");
  }
}
