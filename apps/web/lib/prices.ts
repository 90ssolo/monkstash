/**
 * Client side of /api/price: turns the feed into a Quote the invoice engine can lock.
 * Only our own server is contacted, never an exchange.
 */
import { type PriceFeed, type Quote } from "@quietmint/wallet-core";

/** Currencies offered first in pickers; the feed may hold more (all ECB currencies). */
export const MAIN_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY"] as const;

export class PriceUnavailableError extends Error {
  constructor() {
    super("Prices are unavailable right now. Try again in a minute, or price in XMR.");
    this.name = "PriceUnavailableError";
  }
}

export async function fetchPriceFeed(): Promise<Extract<PriceFeed, { ok: true }>> {
  let feed: PriceFeed;
  try {
    const res = await fetch("/api/price", { cache: "no-store" });
    feed = (await res.json()) as PriceFeed;
  } catch {
    throw new PriceUnavailableError();
  }
  if (!feed.ok) throw new PriceUnavailableError();
  return feed;
}

/** A fresh quote for one currency, ready for createInvoice. */
export async function fetchQuote(currency: string): Promise<Quote> {
  const feed = await fetchPriceFeed();
  const rate = feed.rates[currency];
  if (!rate) throw new PriceUnavailableError();
  return { currency, rate, quotedAt: feed.quotedAt, source: `median of ${feed.sources.join(", ")}` };
}
