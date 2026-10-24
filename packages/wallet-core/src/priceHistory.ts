/**
 * Daily XMR prices for history exports: the value of each payment on the day it happened.
 * Parsing and combining only; the server fetches (apps/web /api/price/history). The wallet
 * downloads the whole table for one currency and looks dates up locally, so the server never
 * learns which days a wallet had payments on.
 *
 * XMR/USD is each UTC day's closing price on Bitfinex (history back to 2016), with Kraken's daily
 * closes (about the last two years) filling any day Bitfinex lacks. Other currencies convert
 * through the ECB's daily reference rates; weekends and holidays use the last published rate.
 */
import { rateString } from "./prices";

/** UTC day as yyyy-mm-dd. */
export const utcDay = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

const positive = (n: unknown): number | null => {
  const v = typeof n === "string" ? Number(n) : n;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
};

/** Bitfinex /v2/candles/trade:1D:tXMRUSD/hist: [MTS, OPEN, CLOSE, HIGH, LOW, VOLUME] per day. */
export function parseBitfinexCandles(j: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(j)) return out;
  for (const c of j) {
    if (!Array.isArray(c) || typeof c[0] !== "number") continue;
    const close = positive(c[2]);
    if (close) out[utcDay(c[0])] = close;
  }
  return out;
}

/** Kraken /0/public/OHLC?interval=1440: [time (s), open, high, low, close, vwap, volume, count]. */
export function parseKrakenOhlc(j: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  const r = j as { error?: unknown[]; result?: Record<string, unknown> } | null;
  if (!r || r.error?.length || !r.result) return out;
  for (const [k, v] of Object.entries(r.result)) {
    if (k === "last" || !Array.isArray(v)) continue;
    for (const c of v) {
      if (!Array.isArray(c) || typeof c[0] !== "number") continue;
      const close = positive(c[4]);
      if (close) out[utcDay(c[0] * 1000)] = close;
    }
  }
  return out;
}

/** The ECB history XML (eurofxref-hist.xml): units of each currency per 1 EUR, per working day. */
export function parseEcbHistory(xml: string, since = "2016-01-01"): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const block of xml.split(/<Cube\s+time=/).slice(1)) {
    const date = /^['"](\d{4}-\d{2}-\d{2})['"]/.exec(block)?.[1];
    if (!date || date < since) continue;
    const day: Record<string, number> = { EUR: 1 };
    for (const m of block.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
      const v = positive(m[2]);
      if (v) day[m[1]!] = v;
    }
    if (day.USD) out[date] = day;
  }
  return out;
}

/** What /api/price/history returns. */
export type PriceHistory =
  | {
      ok: true;
      currency: string;
      /** Price of 1 XMR on each UTC day, as a decimal string. */
      days: Record<string, string>;
      /** Where the prices come from, for the export's notes. */
      source: string;
    }
  | { ok: false };

/** Every day from `from` to `to` inclusive (yyyy-mm-dd). */
function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`), end = Date.parse(`${to}T00:00:00Z`); t <= end; t += 86_400_000) out.push(utcDay(t));
  return out;
}

/**
 * XMR price per day in one currency. USD days come from `primary`, else `backup`. For other
 * currencies a day without an ECB rate (weekend, holiday) uses the latest earlier one; days
 * before the first ECB rate are left out.
 */
export function dailyPrices(
  currency: string,
  primary: Record<string, number>,
  backup: Record<string, number>,
  ecb: Record<string, Record<string, number>>,
): Record<string, string> {
  const usd: Record<string, number> = { ...backup, ...primary };
  const days = Object.keys(usd).sort();
  const out: Record<string, string> = {};
  if (!days.length) return out;
  if (currency === "USD") {
    for (const d of days) out[d] = rateString(usd[d]!);
    return out;
  }
  let fx: Record<string, number> | null = null;
  for (const d of eachDay(days[0]!, days[days.length - 1]!)) {
    if (ecb[d]) fx = ecb[d]!;
    const price = usd[d];
    const per = fx?.[currency];
    if (!price || !fx || !per) continue;
    out[d] = rateString((price / fx.USD!) * per);
  }
  return out;
}

/** Currencies the history covers: USD plus every ECB currency in the latest table. */
export function historyCurrencies(ecb: Record<string, Record<string, number>>): string[] {
  const latest = Object.keys(ecb).sort().pop();
  return latest ? [...new Set(["USD", ...Object.keys(ecb[latest]!)])].sort() : ["USD"];
}
