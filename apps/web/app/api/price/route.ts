/**
 * XMR exchange rates for fiat-priced invoices and balances. XMR/USD is the median of public
 * exchange tickers (no keys). Aggregators (CoinGecko, and LiveCoinWatch when a key is set) are
 * backups, asked only when the exchanges cannot agree. Other currencies come from the ECB's
 * daily reference rates.
 *
 * The server fetches and caches; the wallet only ever asks us, so customers' and merchants'
 * browsers never contact an exchange. The request carries no wallet or payment data, just
 * "what is the price", and nothing is logged.
 */
import { combineWithBackup, parseBitfinex, parseCoingecko, parseEcb, parseKraken, parseKucoin, parseLiveCoinWatch, xmrRates, type PriceFeed, type SourcePrice } from "@quietmint/wallet-core";
import { keepLastGood } from "@/lib/server/keepLastGood";

export const dynamic = "force-static";
export const revalidate = 60; // one minute

const TIMEOUT_MS = 8_000;

type Source = { name: string; url: string; parse: (j: unknown) => number | null; init?: RequestInit };

const EXCHANGES: Source[] = [
  { name: "Kraken", url: "https://api.kraken.com/0/public/Ticker?pair=XMRUSD", parse: parseKraken },
  { name: "Bitfinex", url: "https://api-pub.bitfinex.com/v2/ticker/tXMRUSD", parse: parseBitfinex },
  { name: "KuCoin", url: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=XMR-USDT", parse: parseKucoin },
];

function backupSources(): Source[] {
  const list: Source[] = [
    { name: "CoinGecko", url: "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd", parse: parseCoingecko },
  ];
  // Optional: only used when the server has a key.
  const lcwKey = process.env.LIVECOINWATCH_API_KEY?.trim();
  if (lcwKey) {
    list.push({
      name: "LiveCoinWatch",
      url: "https://api.livecoinwatch.com/coins/single",
      parse: parseLiveCoinWatch,
      init: { method: "POST", headers: { "content-type": "application/json", "x-api-key": lcwKey }, body: JSON.stringify({ currency: "USD", code: "XMR", meta: false }) },
    });
  }
  return list;
}
const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

async function source(s: Source): Promise<SourcePrice | null> {
  try {
    const res = await fetch(s.url, { ...s.init, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store", headers: { accept: "application/json", ...(s.init?.headers as Record<string, string> | undefined) } });
    if (!res.ok) return null;
    const usd = s.parse(await res.json());
    return usd ? { source: s.name, usd } : null;
  } catch {
    return null;
  }
}

export async function GET(): Promise<Response> {
  const quotedAt = Date.now();
  let body: PriceFeed = { ok: false, quotedAt };
  try {
    const [prices, ecbXml] = await Promise.all([
      Promise.all(EXCHANGES.map(source)),
      // The ECB publishes once a working day; an hour of caching is plenty.
      fetch(ECB_URL, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 3600 } }).then((r) => (r.ok ? r.text() : "")),
    ]);
    const ecb = parseEcb(ecbXml);
    const found = (ps: (SourcePrice | null)[]) => ps.filter((p): p is SourcePrice => p !== null);
    const { usd, sources } = await combineWithBackup(found(prices), async () => found(await Promise.all(backupSources().map(source))));
    body = ecb
      ? { ok: true, quotedAt, sources, fxDate: ecb.date, rates: xmrRates(usd, ecb) }
      : { ok: true, quotedAt, sources, fxDate: "", rates: xmrRates(usd, { perEur: { USD: 1 } }) };
  } catch (err) {
    console.warn("[price] unavailable:", err instanceof Error ? err.message : String(err));
  }
  // Never cache a failure, so a short outage does not stick.
  if (!body.ok) body = keepLastGood(body, "price");
  const cache = body.ok ? "public, max-age=30, stale-while-revalidate=60" : "no-store";
  return Response.json(body, { headers: { "Cache-Control": cache } });
}
