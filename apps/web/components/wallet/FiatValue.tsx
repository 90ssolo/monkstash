"use client";
/**
 * The balance's value in a currency of the user's choice, under the XMR amount. The price comes
 * from our own /api/price (median of public exchanges); the request carries no wallet data. The
 * chosen currency is a per-browser preference, and "XMR only" turns the line off.
 */
import { useEffect, useState } from "react";
import { atomicToFiat } from "@quietmint/wallet-core";
import { fetchPriceFeed, MAIN_CURRENCIES } from "@/lib/prices";
import styles from "./wallet.module.css";

const PREF_KEY = "monkstash.fiat.v1";
const OFF = "off";
const REFRESH_MS = 60_000;

const EURO_REGIONS = new Set(["AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"]);
const REGION_CURRENCY: Record<string, string> = { GB: "GBP", CH: "CHF", LI: "CHF", CA: "CAD", AU: "AUD", JP: "JPY" };

/** A first guess from the browser's language and region; the user can change it. */
function defaultCurrency(): string {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region ?? "";
    if (EURO_REGIONS.has(region)) return "EUR";
    return REGION_CURRENCY[region] ?? "USD";
  } catch {
    return "USD";
  }
}

/** Formats an amount like "12.34" as local currency text, e.g. "$12.34" or "12,34 €". */
export function fiatText(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

function useCurrencyPref(): [string, (c: string) => void] {
  const [currency, setCurrency] = useState<string>("USD");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(PREF_KEY); } catch { /* storage blocked */ }
    setCurrency(saved && /^([A-Z]{3}|off)$/.test(saved) ? saved : defaultCurrency());
  }, []);
  const choose = (c: string) => {
    setCurrency(c);
    try { localStorage.setItem(PREF_KEY, c); } catch { /* storage blocked */ }
  };
  return [currency, choose];
}

type Feed = { rates: Record<string, string>; sources: string[]; quotedAt: number };

/** The price feed, refreshed every minute while the page is visible. */
function usePriceFeed(enabled: boolean): { feed: Feed | null; failed: boolean } {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () => {
      if (document.hidden) return;
      void fetchPriceFeed()
        .then((f) => { if (alive) { setFeed(f); setFailed(false); } })
        .catch(() => { if (alive) setFailed(true); });
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => { alive = false; clearInterval(t); document.removeEventListener("visibilitychange", load); };
  }, [enabled]);
  return { feed, failed };
}

export function FiatValue({ atomic, hidden }: {
  /** The balance in atomic units, or null while it is not known yet. */
  atomic: bigint | null;
  hidden: boolean;
}) {
  const [currency, setCurrency] = useCurrencyPref();
  const on = currency !== OFF;
  const { feed, failed } = usePriceFeed(on);
  const rate = on ? feed?.rates[currency] : undefined;

  let shown: string | null = null;
  let spoken = "";
  if (on) {
    if (hidden) { shown = "≈ ••••"; spoken = "Value hidden"; }
    else if (atomic !== null && rate) {
      try {
        const text = fiatText(atomicToFiat(atomic, rate), currency);
        shown = `≈ ${text}`;
        spoken = `About ${text}`;
      } catch { shown = null; }
    } else if (failed && !feed) { shown = "Price unavailable"; spoken = shown; }
    else { shown = "≈ …"; spoken = "Value loading"; }
  }

  const others = feed ? Object.keys(feed.rates).filter((c) => !(MAIN_CURRENCIES as readonly string[]).includes(c)).sort() : [];
  const title = feed && on ? `Median of ${feed.sources.join(", ")}, ${new Date(feed.quotedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : undefined;

  return (
    <div className={styles.fiat}>
      {shown ? (
        <span className={styles.fiatValue} title={title}>
          <span aria-hidden="true">{shown}</span>
          <span className="visually-hidden">{spoken}</span>
        </span>
      ) : null}
      <label className={styles.fiatPick}>
        <span className="visually-hidden">Show the value in</span>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {MAIN_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          {others.length ? (
            <optgroup label="More currencies">
              {others.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          ) : null}
          {/* A saved currency the feed has not listed yet still shows as selected. */}
          {on && !(MAIN_CURRENCIES as readonly string[]).includes(currency) && !others.includes(currency) ? <option value={currency}>{currency}</option> : null}
          <option value={OFF}>XMR only</option>
        </select>
      </label>
    </div>
  );
}
