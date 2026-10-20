export type NetworkType = "mainnet" | "stagenet" | "testnet";

/** Atomic units per XMR (1 XMR = 10^12 piconero). */
export const ATOMIC_UNITS = 1_000_000_000_000n;

export function formatXmr(atomic: bigint, maxDecimals = 12): string {
  const neg = atomic < 0n;
  const a = neg ? -atomic : atomic;
  const whole = a / ATOMIC_UNITS;
  const frac = (a % ATOMIC_UNITS).toString().padStart(12, "0").slice(0, maxDecimals).replace(/0+$/, "");
  return `${neg ? "-" : ""}${whole.toString()}${frac ? "." + frac : ""}`;
}

/** The largest amount Monero can represent: 2^64 - 1 atomic units (18446744.073709551615 XMR). */
export const MAX_ATOMIC = (1n << 64n) - 1n;

export const AMBIGUOUS_COMMA = "Use a dot for decimals, like 1000.5";

/**
 * Why a user-entered XMR amount cannot be read, or null if it can. A single comma is read as a
 * decimal point ("0,25"), except where it looks like a thousands separator ("1,000"), which is
 * rejected rather than guessed.
 */
export function xmrAmountProblem(input: string): string | null {
  const t = input.trim();
  if (t.includes(",")) {
    if (t.includes(".") || /,\d{3}(?!\d)/.test(t) || t.indexOf(",") !== t.lastIndexOf(",")) return AMBIGUOUS_COMMA;
  }
  const s = t.replace(",", ".");
  if (!/^\d+(\.\d{0,12})?$/.test(s)) return "Enter an amount in XMR, like 0.5, with up to 12 decimal places.";
  const [w, f = ""] = s.split(".");
  if (BigInt(w!) * ATOMIC_UNITS + BigInt(f.padEnd(12, "0")) > MAX_ATOMIC) return "That is more than Monero can represent (18446744.073709551615 XMR).";
  return null;
}

/** Parses a user-entered XMR amount into atomic units. Returns null if invalid (see xmrAmountProblem for why). */
export function parseXmr(input: string): bigint | null {
  if (xmrAmountProblem(input) !== null) return null;
  const [w, f = ""] = input.trim().replace(",", ".").split(".");
  return BigInt(w!) * ATOMIC_UNITS + BigInt(f.padEnd(12, "0"));
}
