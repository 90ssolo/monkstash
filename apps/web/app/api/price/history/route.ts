/**
 * Daily XMR prices for one currency, for history exports with the value of each payment on its
 * day. The wallet downloads the whole table and looks dates up itself, so this request carries
 * only a currency code: never dates, amounts or anything about a wallet. Nothing is logged.
 *
 * Sources (no keys): Bitfinex daily candles (back to 2016), Kraken daily candles as a backup for
 * missing days, and the ECB reference rate history for non-USD currencies. Fetched at most every
 * few hours and kept in memory.
 */
import { NextRequest } from "next/server";
import { dailyPrices, historyCurrencies, parseBitfinexCandles, parseEcbHistory, parseKrakenOhlc, type PriceHistory } from "@quietmint/wallet-core";
import { allow, tooMany } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 20_000;
const FRESH_MS = 3 * 3600_000;
const SOURCE = "Daily closing price (UTC) from Bitfinex, Kraken for missing days; other currencies through the European Central Bank reference rates";

type Raw = { at: number; primary: Record<string, number>; backup: Record<string, number>; ecb: Record<string, Record<string, number>> };
let raw: Raw | null = null;
let loading: Promise<Raw> | null = null;

async function json(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function load(): Promise<Raw> {
  const [bfx, kraken, ecbXml] = await Promise.all([
    json("https://api-pub.bitfinex.com/v2/candles/trade:1D:tXMRUSD/hist?limit=10000&sort=1").catch(() => null),
    json("https://api.kraken.com/0/public/OHLC?pair=XMRUSD&interval=1440").catch(() => null),
    fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml", { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" })
      .then((r) => (r.ok ? r.text() : "")).catch(() => ""),
  ]);
  const next: Raw = { at: Date.now(), primary: parseBitfinexCandles(bfx), backup: parseKrakenOhlc(kraken), ecb: parseEcbHistory(ecbXml) };
  // A partial answer only replaces nothing, or an older answer missing the same part.
  const prev = raw;
  if (prev) {
    if (!Object.keys(next.primary).length) next.primary = prev.primary;
    if (!Object.keys(next.backup).length) next.backup = prev.backup;
    if (!Object.keys(next.ecb).length) next.ecb = prev.ecb;
  }
  if (!Object.keys(next.primary).length && !Object.keys(next.backup).length) throw new Error("no price history");
  return next;
}

async function current(): Promise<Raw> {
  if (raw && Date.now() - raw.at < FRESH_MS) return raw;
  loading ??= load().then((r) => (raw = r)).finally(() => { loading = null; });
  try {
    return await loading;
  } catch (err) {
    if (raw) return raw; // keep serving the last good table during an outage
    throw err;
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  if (!allow("price-history", req, 20)) return tooMany();
  const currency = (req.nextUrl.searchParams.get("currency") ?? "USD").toUpperCase();
  let body: PriceHistory = { ok: false };
  try {
    const r = await current();
    if (/^[A-Z]{3}$/.test(currency) && historyCurrencies(r.ecb).includes(currency)) {
      const days = dailyPrices(currency, r.primary, r.backup, r.ecb);
      if (Object.keys(days).length) body = { ok: true, currency, days, source: SOURCE };
    }
  } catch (err) {
    console.warn("[price-history] unavailable:", err instanceof Error ? err.message : String(err));
  }
  return Response.json(body, { headers: { "Cache-Control": body.ok ? "public, max-age=3600" : "no-store" } });
}
