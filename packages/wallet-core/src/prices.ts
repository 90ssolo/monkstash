/**
 * XMR exchange rates from public sources that need no API key. This module only parses and
 * combines; fetching happens on the server (apps/web /api/price, or a merchant's own
 * MonkStash Pay), so a customer's browser never contacts an exchange.
 *
 * XMR/USD is the median of several exchanges, with outliers dropped, so one bad or stale
 * source cannot move the price. Other currencies come from the European Central Bank's daily
 * reference rates.
 */

export interface SourcePrice {
  source: string;
  /** XMR price in USD (or USDT, treated as USD). */
  usd: number;
}

export class PriceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceError";
  }
}

const positive = (n: unknown): number | null => {
  const v = typeof n === "string" ? Number(n) : n;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
};

/** https://api.kraken.com/0/public/Ticker?pair=XMRUSD : last trade price. */
export function parseKraken(j: unknown): number | null {
  const r = (j as { error?: unknown[]; result?: Record<string, { c?: [string, string] }> }) ?? {};
  if (r.error?.length || !r.result) return null;
  const t = Object.values(r.result)[0];
  return positive(t?.c?.[0]);
}

/** https://api-pub.bitfinex.com/v2/ticker/tXMRUSD : index 6 is the last price. */
export function parseBitfinex(j: unknown): number | null {
  return Array.isArray(j) && j.length >= 7 ? positive(j[6]) : null;
}

/** https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=XMR-USDT */
export function parseKucoin(j: unknown): number | null {
  const r = j as { code?: string; data?: { price?: string } } | null;
  return r?.code === "200000" ? positive(r.data?.price) : null;
}

/** https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd */
export function parseCoingecko(j: unknown): number | null {
  return positive((j as { monero?: { usd?: number } } | null)?.monero?.usd);
}

/** POST https://api.livecoinwatch.com/coins/single {currency:"USD",code:"XMR"} (needs a free key). */
export function parseLiveCoinWatch(j: unknown): number | null {
  return positive((j as { rate?: number } | null)?.rate);
}

/** The ECB daily reference rates XML: units of each currency per 1 EUR. */
export function parseEcb(xml: string): { date: string; perEur: Record<string, number> } | null {
  const date = /time=['"](\d{4}-\d{2}-\d{2})['"]/.exec(xml)?.[1];
  const perEur: Record<string, number> = {};
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    const v = positive(m[2]);
    if (v) perEur[m[1]!] = v;
  }
  return date && perEur.USD ? { date, perEur: { ...perEur, EUR: 1 } } : null;
}

/** Sources further than this from the median are ignored. */
export const MAX_DEVIATION = 0.03;
export const MIN_SOURCES = 2;

/** Median XMR/USD from agreeing sources. Throws if fewer than MIN_SOURCES agree. */
export function combineUsd(prices: SourcePrice[]): { usd: number; sources: string[] } {
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
  };
  const valid = prices.filter((p) => Number.isFinite(p.usd) && p.usd > 0);
  if (valid.length < MIN_SOURCES) throw new PriceError("Not enough price sources answered.");
  const mid = median(valid.map((p) => p.usd));
  const agree = valid.filter((p) => Math.abs(p.usd - mid) / mid <= MAX_DEVIATION);
  if (agree.length < MIN_SOURCES) throw new PriceError("Price sources disagree too much.");
  return { usd: median(agree.map((p) => p.usd)), sources: agree.map((p) => p.source).sort() };
}

/**
 * Exchanges first; backup sources (aggregators like CoinGecko) are only asked when the
 * exchanges alone cannot give an agreeing price. Saves calls to rate-limited free APIs.
 */
export async function combineWithBackup(
  primary: SourcePrice[],
  loadBackup: () => Promise<SourcePrice[]>,
): Promise<{ usd: number; sources: string[]; usedBackup: boolean }> {
  try {
    return { ...combineUsd(primary), usedBackup: false };
  } catch {
    const backup = await loadBackup();
    return { ...combineUsd([...primary, ...backup]), usedBackup: true };
  }
}

/** Rounds a rate to 8 significant digits as a plain decimal string (no exponent). */
export function rateString(n: number): string {
  if (!Number.isFinite(n) || n <= 0) throw new PriceError("Invalid rate.");
  const digits = Math.max(0, 8 - Math.floor(Math.log10(n)) - 1);
  return n.toFixed(Math.min(digits, 12)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

/** XMR price in every ECB currency (plus USD and EUR), from XMR/USD and the ECB table. */
export function xmrRates(usd: number, ecb: { perEur: Record<string, number> }): Record<string, string> {
  const usdPerEur = ecb.perEur.USD;
  if (!usdPerEur) throw new PriceError("Missing USD rate.");
  const out: Record<string, string> = {};
  for (const [cur, perEur] of Object.entries(ecb.perEur)) out[cur] = rateString((usd / usdPerEur) * perEur);
  out.USD = rateString(usd);
  return out;
}

/** What /api/price returns. */
export type PriceFeed =
  | {
      ok: true;
      /** When the exchange prices were fetched (ms since epoch). */
      quotedAt: number;
      /** Exchanges whose prices were used for XMR/USD. */
      sources: string[];
      /** Date of the ECB reference rates used for non-USD currencies. */
      fxDate: string;
      /** Price of 1 XMR in each currency, as decimal strings. */
      rates: Record<string, string>;
    }
  | { ok: false; quotedAt: number };
