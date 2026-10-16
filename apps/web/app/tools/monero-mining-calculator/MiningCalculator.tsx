"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { estimateMining, TAIL_EMISSION_XMR, type NetworkStats, type NetworkStatsUnavailable } from "@/lib/networkStats";
import { BENCH_URL, CPUS } from "./cpus";
import styles from "./page.module.css";

type Mode = "pool" | "solo";
type Unit = "h" | "kh";

const PICONERO = 1e12;

/** Rounds to a few significant figures: estimates should not look more precise than they are. */
function sig(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "n/a";
  if (n === 0) return "0";
  return n.toLocaleString("en-US", { maximumSignificantDigits: digits });
}

function money(n: number): string {
  if (!Number.isFinite(n)) return "n/a";
  const abs = Math.abs(n);
  return n.toLocaleString("en-US", abs >= 100 ? { maximumFractionDigits: 0 } : abs >= 0.01 ? { maximumFractionDigits: 2, minimumFractionDigits: 2 } : { maximumSignificantDigits: 2 });
}

function duration(days: number): string {
  if (!Number.isFinite(days)) return "never at this hashrate";
  if (days < 1) return `about ${sig(days * 24, 2)} hours`;
  if (days < 365) return `about ${sig(days, 2)} days`;
  return `about ${sig(days / 365.25, 2)} years`;
}

function hashrateText(hs: number): string {
  if (hs >= 1e9) return `${sig(hs / 1e9)} GH/s`;
  if (hs >= 1e6) return `${sig(hs / 1e6)} MH/s`;
  if (hs >= 1e3) return `${sig(hs / 1e3)} kH/s`;
  return `${sig(hs)} H/s`;
}

/**
 * Reads a typed number, accepting thousands separators either way ("1,500.5" or "1.500,5") and a
 * lone decimal comma ("0,25"). "1,500" is read as fifteen hundred. Anything else is NaN, so the
 * field shows an error instead of a silently wrong number.
 */
function num(s: string): number {
  let t = s.trim();
  if (!t) return 0;
  const comma = t.lastIndexOf(",");
  const dot = t.lastIndexOf(".");
  if (comma !== -1 && dot !== -1) {
    if (dot > comma) {
      if (!/^[1-9]\d{0,2}(,\d{3})+\.\d*$/.test(t)) return NaN;
      t = t.replace(/,/g, "");
    } else {
      if (!/^[1-9]\d{0,2}(\.\d{3})+,\d*$/.test(t)) return NaN;
      t = t.replace(/\./g, "").replace(",", ".");
    }
  } else if (comma !== -1) {
    t = /^[1-9]\d{0,2}(,\d{3})+$/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
  }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}


/** Expected Monero mining earnings from live difficulty (see /api/network-stats). */
export function MiningCalculator() {
  const id = useId();
  const [stats, setStats] = useState<NetworkStats | NetworkStatsUnavailable | null>(null);
  const [mode, setMode] = useState<Mode>("pool");
  const [cpu, setCpu] = useState("");
  const [rate, setRate] = useState("10000");
  const [unit, setUnit] = useState<Unit>("h");
  const [watts, setWatts] = useState("");
  const [kwh, setKwh] = useState("");
  const [fee, setFee] = useState("0");
  const [price, setPrice] = useState("");
  const [manualDiff, setManualDiff] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/network-stats")
      .then((r) => r.json() as Promise<NetworkStats | NetworkStatsUnavailable>)
      .then((s) => { if (alive) setStats(s); })
      .catch(() => { if (alive) setStats({ ok: false, fetchedAt: new Date().toISOString() }); });
    return () => { alive = false; };
  }, []);

  const live = stats?.ok ? stats : null;
  const hashrate = num(rate) * (unit === "kh" ? 1000 : 1);
  const difficulty = live ? live.difficulty : num(manualDiff) * 1e9;
  const rewardXmr = live ? live.lastBlockReward / PICONERO : TAIL_EMISSION_XMR;
  const feePct = num(fee);
  const w = watts.trim() ? num(watts) : 0;
  const perKwh = kwh.trim() ? num(kwh) : 0;
  const xmrPrice = price.trim() ? num(price) : 0;

  const errors = {
    rate: !(hashrate > 0) ? "Enter your hashrate as a plain number, for example 10000 H/s." : null,
    fee: mode === "pool" && !(feePct >= 0 && feePct < 100) ? "Enter a fee from 0 to 99." : null,
    watts: !(w >= 0) ? "Enter watts as a number, like 150 or 1500." : null,
    kwh: !(perKwh >= 0) ? "Enter a price as a number, like 0.25." : null,
    price: !(xmrPrice >= 0) ? "Enter a price as a number, like 300." : null,
    diff: !live && stats !== null && manualDiff.trim() && !(difficulty > 0) ? "Enter the difficulty in billions, for example 690." : null,
  };
  const valid = !Object.values(errors).some(Boolean) && difficulty > 0;

  const est = useMemo(() => {
    if (!valid) return null;
    return estimateMining({ hashrate, difficulty, rewardXmr, feeFraction: mode === "pool" ? feePct / 100 : 0 });
  }, [valid, hashrate, difficulty, rewardXmr, feePct, mode]);

  const powerPerDay = (w * 24) / 1000 * perKwh; // in the user's currency
  const kwhPerDay = (w * 24) / 1000;

  // Radio group keyboard pattern: arrow keys move the choice and focus together.
  function onModeKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next: Mode = e.key === "Home" ? "pool" : e.key === "End" ? "solo" : mode === "pool" ? "solo" : "pool";
    setMode(next);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next === "pool" ? 0 : 1];
    btn?.focus();
  }

  function pickCpu(value: string) {
    setCpu(value);
    const c = CPUS.find((x) => x.name === value);
    if (c) { setRate(String(c.hashrate)); setUnit("h"); }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.badge}>Live network difficulty</span>
        <h2 className={styles.cardTitle}>How much Monero can I mine?</h2>
      </div>

      <fieldset className={styles.group}>
        <legend>How you mine</legend>
        <div className={styles.seg} role="radiogroup" aria-label="How you mine" onKeyDown={onModeKey}>
          <button type="button" role="radio" aria-checked={mode === "pool"} tabIndex={mode === "pool" ? 0 : -1} onClick={() => setMode("pool")}>Pool or P2Pool</button>
          <button type="button" role="radio" aria-checked={mode === "solo"} tabIndex={mode === "solo" ? 0 : -1} onClick={() => setMode("solo")}>Solo</button>
        </div>
        <p className={styles.help}>{mode === "pool" ? "Small, regular payouts in proportion to your work. P2Pool has no fee; most pools charge 0 to 2%." : "You keep a whole block reward, but only when your own computer finds a block."}</p>
      </fieldset>

      <div className={styles.group}>
        <label htmlFor={`${id}-cpu`}>Your CPU <span className={styles.opt}>(optional shortcut)</span></label>
        <select id={`${id}-cpu`} className={`select ${styles.field}`} value={cpu} onChange={(e) => pickCpu(e.target.value)}>
          <option value="">Type my own hashrate</option>
          {CPUS.map((c) => <option key={c.name} value={c.name}>{c.name} (about {c.hashrate.toLocaleString("en-US")} H/s)</option>)}
        </select>
        <p className={styles.help}>Rounded figures from the public <a href={BENCH_URL} target="_blank" rel="noopener noreferrer">XMRig RandomX benchmark list</a>. Your result depends on memory, cooling and settings; run XMRig&apos;s own benchmark for a real number.</p>
      </div>

      <div className={styles.pair}>
        <div className={styles.group}>
          <label htmlFor={`${id}-rate`}>Hashrate</label>
          <input id={`${id}-rate`} className={`input ${styles.field}`} inputMode="decimal" value={rate} onChange={(e) => { setRate(e.target.value); setCpu(""); }} aria-invalid={errors.rate ? true : undefined} aria-describedby={`${id}-rate-msg`} />
          {errors.rate ? <p id={`${id}-rate-msg`} className={styles.err}>{errors.rate}</p> : null}
        </div>
        <div className={styles.group}>
          <label htmlFor={`${id}-unit`}>Unit</label>
          <select id={`${id}-unit`} className={`select ${styles.field}`} value={unit} onChange={(e) => { setUnit(e.target.value as Unit); setCpu(""); }}>
            <option value="h">H/s</option>
            <option value="kh">kH/s</option>
          </select>
        </div>
      </div>

      <div className={styles.pair}>
        <div className={styles.group}>
          <label htmlFor={`${id}-w`}>Power draw in watts <span className={styles.opt}>(optional)</span></label>
          <input id={`${id}-w`} className={`input ${styles.field}`} inputMode="decimal" placeholder="For example 150" value={watts} onChange={(e) => setWatts(e.target.value)} aria-invalid={errors.watts ? true : undefined} aria-describedby={`${id}-w-msg`} />
          {errors.watts ? <p id={`${id}-w-msg`} className={styles.err}>{errors.watts}</p> : null}
        </div>
        <div className={styles.group}>
          <label htmlFor={`${id}-kwh`}>Electricity price per kWh <span className={styles.opt}>(optional)</span></label>
          <input id={`${id}-kwh`} className={`input ${styles.field}`} inputMode="decimal" placeholder="For example 0.25" value={kwh} onChange={(e) => setKwh(e.target.value)} aria-invalid={errors.kwh ? true : undefined} aria-describedby={`${id}-kwh-msg`} />
          {errors.kwh ? <p id={`${id}-kwh-msg`} className={styles.err}>{errors.kwh}</p> : null}
        </div>
      </div>

      <div className={styles.pair}>
        {mode === "pool" ? (
          <div className={styles.group}>
            <label htmlFor={`${id}-fee`}>Pool fee in %</label>
            <input id={`${id}-fee`} className={`input ${styles.field}`} inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} aria-invalid={errors.fee ? true : undefined} aria-describedby={`${id}-fee-msg`} />
            <p id={`${id}-fee-msg`} className={errors.fee ? styles.err : styles.help}>{errors.fee ?? "0 for P2Pool."}</p>
          </div>
        ) : <div />}
        <div className={styles.group}>
          <label htmlFor={`${id}-price`}>XMR price <span className={styles.opt}>(optional)</span></label>
          <input id={`${id}-price`} className={`input ${styles.field}`} inputMode="decimal" placeholder="In the same currency" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={errors.price ? true : undefined} aria-describedby={`${id}-price-msg`} />
          <p id={`${id}-price-msg`} className={errors.price ? styles.err : styles.help}>{errors.price ?? "We do not fetch prices. Use the currency of your electricity bill."}</p>
        </div>
      </div>

      {stats !== null && !live ? (
        <div className={styles.group}>
          <label htmlFor={`${id}-diff`}>Network difficulty, in billions</label>
          <input id={`${id}-diff`} className={`input ${styles.field}`} inputMode="decimal" placeholder="For example 690" value={manualDiff} onChange={(e) => setManualDiff(e.target.value)} aria-invalid={errors.diff ? true : undefined} aria-describedby={`${id}-diff-msg`} />
          <p id={`${id}-diff-msg`} className={errors.diff ? styles.err : styles.warn}>{errors.diff ?? "Live network data is unavailable right now, so enter the difficulty by hand. Any Monero block explorer shows it. The block reward is set to the 0.6 XMR tail emission."}</p>
        </div>
      ) : null}

      <div className={styles.result} aria-live="polite">
        {stats === null ? (
          <p className={styles.muted}>Reading the network difficulty…</p>
        ) : !est ? (
          <p className={styles.muted}>{live ? "Enter your hashrate to see an estimate." : "Enter the network difficulty to see an estimate."}</p>
        ) : mode === "pool" ? (
          <>
            <span className={styles.label}>Expected earnings (estimate)</span>
            <span className={styles.big}>{sig(est.xmrPerDay)} <small>XMR a day</small></span>
            <span className={styles.detail}>
              About {sig(est.xmrPerDay * 30)} XMR in 30 days. At this rate, 1 XMR takes {duration(est.daysPerXmr)}.
              {xmrPrice > 0 ? ` Worth about ${money(est.xmrPerDay * xmrPrice)} a day before power.` : ""}
            </span>
            {w > 0 && perKwh > 0 ? (
              <span className={styles.detail}>
                Power: {sig(kwhPerDay)} kWh a day, costing about {money(powerPerDay)}. That is about {money(powerPerDay * est.daysPerXmr)} of electricity per XMR mined.
                {xmrPrice > 0 ? (est.xmrPerDay * xmrPrice >= powerPerDay ? ` After power: about ${money(est.xmrPerDay * xmrPrice - powerPerDay)} a day.` : ` After power: a loss of about ${money(powerPerDay - est.xmrPerDay * xmrPrice)} a day.`) : ""}
              </span>
            ) : null}
            <span className={styles.detail}>You do {sig(est.share * 100, 2)}% of the network&apos;s work ({hashrateText(hashrate)} of {hashrateText(est.networkHashrate)}).</span>
          </>
        ) : (
          <>
            <span className={styles.label}>Expected time to find a block (estimate)</span>
            <span className={styles.big}>{duration(est.soloDaysPerBlock)}</span>
            <span className={styles.detail}>
              That is an average, not a schedule. Your chance of finding at least one block in the next 30 days is about {sig((1 - Math.exp(-30 / est.soloDaysPerBlock)) * 100, 2)}%.
              Each block pays about {sig(rewardXmr)} XMR.
            </span>
            {w > 0 && perKwh > 0 ? (
              <span className={styles.detail}>Power: about {money(powerPerDay)} a day, so about {money(powerPerDay * est.soloDaysPerBlock)} over the expected wait.</span>
            ) : null}
            <span className={styles.detail}>Network hashrate: {hashrateText(est.networkHashrate)}. Yours: {hashrateText(hashrate)}.</span>
          </>
        )}
        {est && est.share > 1 ? (
          <p className={styles.warn}>That is more than the whole network; check the hashrate unit.</p>
        ) : null}
      </div>

      {live ? (
        <p className={styles.source}>
          Difficulty {sig(live.difficulty / 1e9, 4)} billion and a block reward of {sig(rewardXmr, 4)} XMR (block {live.height.toLocaleString("en-US")}), read from a Monero node and cached for five minutes.
          Difficulty changes every block, and luck decides real results.
        </p>
      ) : null}
    </div>
  );
}
