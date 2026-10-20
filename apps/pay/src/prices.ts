/**
 * XMR rates for fiat-priced invoices, fetched by this server (never by the customer's browser).
 * Same rules as monkstash.com: exchanges first (Kraken, Bitfinex, KuCoin), aggregators only as
 * backups, at least two agreeing sources, other currencies through the ECB reference rates.
 * Cached for a minute, so the sources see at most one request per minute from this shop.
 */
import {
  combineWithBackup, parseBitfinex, parseCoingecko, parseEcb, parseKraken, parseKucoin, parseLiveCoinWatch, xmrRates,
  type Quote, type SourcePrice,
} from "@quietmint/wallet-core";

const TIMEOUT_MS = 8_000;
type Source = { name: string; url: string; parse: (j: unknown) => number | null; init?: RequestInit };

/** The currency is not one we have a reference rate for (the ECB list loaded, and it is not in it). */
export class UnsupportedCurrency extends Error {}

export class PriceUnavailable extends Error {
  constructor() { super("Exchange rates are unavailable right now. Try again shortly, or price the invoice in XMR."); }
}

/** ECB reference rates older than this (counted from the end of their publication day) are flagged. */
export const ECB_STALE_MS = 3 * 24 * 3600_000;

/** Why the ECB table needs attention at `now`, or null when it is fine. */
export function ecbWarning(ecb: { date: string } | null, now: number): string | null {
  if (!ecb) return "warning: the ECB reference rates could not be loaded, so only USD prices work. Invoices in other currencies fail until www.ecb.europa.eu is reachable from this server.";
  const end = Date.parse(`${ecb.date}T00:00:00Z`) + 24 * 3600_000;
  if (!Number.isFinite(end)) return null;
  if (now - end > ECB_STALE_MS) return `warning: the newest ECB reference rates this server has are from ${ecb.date}, more than 3 days old. Non-USD prices use them; check that www.ecb.europa.eu is reachable from this server.`;
  return null;
}

export function createPriceService(opts: { liveCoinWatchKey?: string; fetchImpl?: typeof fetch; log?: (message: string) => void } = {}) {
  const f = opts.fetchImpl ?? fetch;
  const log = opts.log ?? (() => {});
  let lastWarning: { text: string; at: number } | null = null;
  const warnAbout = (ecb: { date: string } | null, now: number) => {
    const text = ecbWarning(ecb, now);
    // Say it once, and again every hour while it lasts, so the log is not flooded.
    if (text && (!lastWarning || lastWarning.text !== text || now - lastWarning.at >= 3_600_000)) {
      log(text);
      lastWarning = { text, at: now };
    }
    if (!text) lastWarning = null;
  };
  const exchanges: Source[] = [
    { name: "Kraken", url: "https://api.kraken.com/0/public/Ticker?pair=XMRUSD", parse: parseKraken },
    { name: "Bitfinex", url: "https://api-pub.bitfinex.com/v2/ticker/tXMRUSD", parse: parseBitfinex },
    { name: "KuCoin", url: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=XMR-USDT", parse: parseKucoin },
  ];
  const backups: Source[] = [
    { name: "CoinGecko", url: "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd", parse: parseCoingecko },
  ];
  if (opts.liveCoinWatchKey) {
    backups.push({
      name: "LiveCoinWatch", url: "https://api.livecoinwatch.com/coins/single", parse: parseLiveCoinWatch,
      init: { method: "POST", headers: { "content-type": "application/json", "x-api-key": opts.liveCoinWatchKey }, body: JSON.stringify({ currency: "USD", code: "XMR", meta: false }) },
    });
  }

  const one = async (s: Source): Promise<SourcePrice | null> => {
    try {
      const res = await f(s.url, { ...s.init, signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/json", ...(s.init?.headers as Record<string, string> | undefined) } });
      if (!res.ok) return null;
      const usd = s.parse(await res.json());
      return usd ? { source: s.name, usd } : null;
    } catch {
      return null;
    }
  };
  const found = (ps: (SourcePrice | null)[]) => ps.filter((p): p is SourcePrice => p !== null);

  let cache: { at: number; rates: Record<string, string>; sources: string[] } | null = null;
  let ecbCache: { at: number; date: string; perEur: Record<string, number> } | null = null;

  async function rates(now = Date.now()) {
    if (cache && now - cache.at < 60_000) return cache;
    const [prices, ecb] = await Promise.all([
      Promise.all(exchanges.map(one)),
      ecbCache && now - ecbCache.at < 3_600_000 ? Promise.resolve(ecbCache) : f("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", { signal: AbortSignal.timeout(TIMEOUT_MS) })
        .then((r) => (r.ok ? r.text() : "")).then((x) => { const p = parseEcb(x); return p ? (ecbCache = { at: now, date: p.date, perEur: p.perEur }) : ecbCache; }).catch(() => ecbCache),
    ]);
    warnAbout(ecb, now);
    let combined;
    try {
      combined = await combineWithBackup(found(prices), async () => found(await Promise.all(backups.map(one))));
    } catch {
      throw new PriceUnavailable();
    }
    cache = { at: now, sources: combined.sources, rates: xmrRates(combined.usd, ecb ?? { perEur: { USD: 1 } }) };
    return cache;
  }

  return {
    /** A quote for one currency, ready for createInvoice. */
    async quote(currency: string, now = Date.now()): Promise<Quote> {
      const r = await rates(now);
      const rate = r.rates[currency];
      // With the ECB list loaded, a missing currency is the caller's mistake, not an outage.
      if (!rate) throw Object.keys(r.rates).length > 1 ? new UnsupportedCurrency(`${currency} is not a supported currency. Use a currency from the ECB reference list, such as EUR, USD or GBP, or price in XMR.`) : new PriceUnavailable();
      return { currency, rate, quotedAt: r.at, source: `median of ${r.sources.join(", ")}` };
    },
  };
}

export type PriceService = ReturnType<typeof createPriceService>;
