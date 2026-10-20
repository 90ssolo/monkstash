/** Shape of /api/fee-stats: live Monero fee data measured from recent mainnet blocks. */
export interface FeeStats {
  ok: true;
  /** Height of the newest block sampled. */
  height: number;
  /** When the numbers were measured (ISO). */
  fetchedAt: string;
  blocksSampled: number;
  txsSampled: number;
  /** Fee per byte for each priority, in piconero, as reported by the node: unimportant, normal, elevated, priority. */
  perByte: [number, number, number, number];
  /** Fees are rounded up to a multiple of this (piconero). */
  quantizationMask: number;
  /** Median transaction size in bytes for 1 to 4 inputs with 2 outputs (null if not enough samples). */
  sizeByInputs: Record<1 | 2 | 3 | 4, number | null>;
  /** How many sampled transactions paid each tier (index as perByte), plus other/unknown. */
  tierCounts: [number, number, number, number, number];
}

export interface FeeStatsUnavailable {
  ok: false;
  fetchedAt: string;
}

export const PRIORITY_NAMES = ["Unimportant", "Normal", "Elevated", "Priority"] as const;

/** Fee in piconero for a transaction of `bytes` at `perByte`, rounded up like the wallet does. */
export function feeFor(bytes: number, perByte: number, mask: number): number {
  const raw = bytes * perByte;
  return mask > 0 ? Math.ceil(raw / mask) * mask : raw;
}

export const PICONERO = 1e12;
