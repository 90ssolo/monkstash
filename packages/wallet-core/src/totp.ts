/**
 * Optional local TOTP (authenticator app) unlock step.
 *
 * Honest scope: the secret lives inside the password-encrypted vault, so this is a
 * second unlock gate on this device. It does not protect a leaked seed phrase.
 */
import { Secret, TOTP } from "otpauth";

export interface TotpConfig {
  secret: string; // base32
}

export function createTotpSecret(): TotpConfig {
  return { secret: new Secret({ size: 20 }).base32 };
}

function totp(cfg: TotpConfig, label = "Wallet") {
  return new TOTP({ issuer: "MonkStash", label, algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(cfg.secret) });
}

export function totpUri(cfg: TotpConfig, label?: string): string {
  return totp(cfg, label).toString();
}

/** Accepts the current code and one step either side to tolerate clock drift. */
export function verifyTotp(cfg: TotpConfig, code: string, timestamp = Date.now()): boolean {
  const clean = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  return totp(cfg).validate({ token: clean, timestamp, window: 1 }) !== null;
}

export function currentTotp(cfg: TotpConfig, timestamp = Date.now()): string {
  return totp(cfg).generate({ timestamp });
}
