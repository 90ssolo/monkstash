"use client";
/**
 * The balance's value in a currency of the user's choice, under the XMR amount. The price comes
 * from our own /api/price (median of public exchanges); the request carries no wallet data. The
 * chosen currency is a per-browser preference, and "XMR only" turns the line off.
 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { atomicToFiat } from "@quietmint/wallet-core";
import { fetchPriceFeed, MAIN_CURRENCIES } from "@/lib/prices";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
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
      <CurrencyPicker value={currency} main={[...MAIN_CURRENCIES]} more={others} onPick={setCurrency} />
    </div>
  );
}

/** "€" for EUR; the code itself where a currency has no short symbol. */
function symbolOf(code: string): string {
  try {
    const part = new Intl.NumberFormat(undefined, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
      .formatToParts(0).find((p) => p.type === "currency")?.value;
    return part && part.length <= 3 ? part : code;
  } catch {
    return code;
  }
}

function nameOf(names: Intl.DisplayNames | null, code: string): string {
  try { return names?.of(code) ?? code; } catch { return code; }
}

/**
 * The currency menu: a button showing the chosen currency, opening a searchable list. The search
 * field is a combobox (arrow keys move, Enter picks, Escape closes), so it works without a mouse.
 */
function CurrencyPicker({ value, main, more, onPick }: {
  value: string;
  main: string[];
  more: string[];
  onPick: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<React.CSSProperties>({});
  const id = useId();
  const names = useMemo(() => { try { return new Intl.DisplayNames(undefined, { type: "currency" }); } catch { return null; } }, []);

  // A saved currency the feed has not listed (yet) still shows in the list.
  const extra = value !== OFF && !main.includes(value) && !more.includes(value) ? [value] : [];
  const q = query.trim().toLowerCase();
  const match = (c: string) => !q || c.toLowerCase().includes(q) || nameOf(names, c).toLowerCase().includes(q);
  const groups = [
    { label: "Popular", codes: main.filter(match) },
    { label: "More currencies", codes: [...more, ...extra].filter(match) },
  ].filter((g) => g.codes.length);
  const options = [...groups.flatMap((g) => g.codes), OFF];
  const optionId = (c: string) => `${id}-${c}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !menu.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    search.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // The menu lives in <body> (the balance card clips its content), placed under the button, or
  // above it when there is more room there. It follows the button on scroll and resize.
  useLayoutEffect(() => {
    if (!open) return;
    const placeMenu = () => {
      const r = button.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(290, window.innerWidth - 32);
      const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16));
      // On phones the tab bar is fixed at the bottom; the menu stops above it.
      const bar = document.querySelector(`.${styles.bottomBar}`)?.getBoundingClientRect();
      const floor = bar && bar.height > 0 ? bar.top : window.innerHeight;
      const below = floor - r.bottom - 16;
      const above = r.top - 16;
      setPlace(below >= 240 || below >= above
        ? { left, width, top: r.bottom + 6, maxHeight: below - 6 }
        : { left, width, bottom: window.innerHeight - r.top + 6, maxHeight: above - 6 });
    };
    placeMenu();
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => { window.removeEventListener("resize", placeMenu); window.removeEventListener("scroll", placeMenu, true); };
  }, [open]);

  // Keeps the highlighted row in view while moving with the arrow keys.
  const activeCode = options[active];
  useEffect(() => {
    if (open && activeCode) document.getElementById(optionId(activeCode))?.scrollIntoView({ block: "nearest" });
  }, [open, activeCode]); // eslint-disable-line react-hooks/exhaustive-deps

  function show() {
    setQuery("");
    setActive(Math.max(0, [...main, ...more, ...extra, OFF].indexOf(value)));
    setOpen(true);
  }
  function close(refocus = true) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }
  function pick(code: string) {
    onPick(code);
    close();
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeCode) pick(activeCode); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") close(false);
  }

  const row = (code: string) => {
    const i = options.indexOf(code);
    const off = code === OFF;
    return (
      <li key={code} id={optionId(code)} role="option" aria-selected={code === value}
        className={`${styles.curItem} ${i === active ? styles.curActive : ""}`}
        onPointerMove={() => setActive(i)} onClick={() => pick(code)}>
        {off
          ? <span className={`${styles.curSym} ${styles.curSymXmr}`} aria-hidden="true"><MoneroSymbol size={18} /></span>
          : <span className={styles.curSym} aria-hidden="true">{symbolOf(code)}</span>}
        <span className={styles.curText}>
          <span className={styles.curCode}>{off ? "XMR only" : code}</span>
          <span className={styles.curName}>{off ? "Hide the value" : nameOf(names, code)}</span>
        </span>
        <svg className={styles.curCheck} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </li>
    );
  };

  return (
    <div className={styles.cur} ref={box}>
      <button ref={button} type="button" className={styles.curBtn} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => (open ? close() : show())} title="Choose the currency for the value">
        {value !== OFF ? <><span className={styles.curBtnSym} aria-hidden="true">{symbolOf(value)}</span>{value}</> : "Show value"}
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="visually-hidden">, change the currency</span>
      </button>
      {open ? createPortal(
        <div ref={menu} className={styles.curMenu} style={place}>
          <div className={styles.curSearch}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input ref={search} type="text" role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-autocomplete="list"
              aria-activedescendant={activeCode ? optionId(activeCode) : undefined} aria-label="Search currencies"
              placeholder="Search currencies" value={query} autoComplete="off" spellCheck={false}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKey} />
          </div>
          <ul id={`${id}-list`} role="listbox" aria-label="Show the value in" className={styles.curList}>
            {groups.map((g) => (
              <li key={g.label} role="presentation">
                <p className={styles.curGroup} aria-hidden="true">{g.label}</p>
                <ul role="group" aria-label={g.label}>{g.codes.map(row)}</ul>
              </li>
            ))}
            {!groups.length ? <li role="presentation" className={styles.curEmpty}>No currency matches &ldquo;{query}&rdquo;</li> : null}
            <li role="presentation" className={styles.curSep} />
            {row(OFF)}
          </ul>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
