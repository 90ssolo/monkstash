"use client";
import { useEffect, useState } from "react";
import { DateParts } from "@/components/forms/DateParts";
import { estimateDateOfHeight, estimateHeightAt } from "@quietmint/wallet-core";
import styles from "./tools.module.css";

type Mode = "date" | "height";

const MIN_DATE = "2014-04-18";
const MARGIN_DAYS = 7;

function parseIsoDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function RestoreHeightCalculator() {
  const [mode, setMode] = useState<Mode>("date");
  const [dateValue, setDateValue] = useState("");
  const [heightValue, setHeightValue] = useState("");
  const [today, setToday] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const n = new Date();
    const p = (x: number) => String(x).padStart(2, "0");
    setToday(`${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`);
  }, []);

  const date = parseIsoDate(dateValue);
  const dateOk = date !== null && dateValue >= MIN_DATE && (!today || dateValue <= today);
  const recommended = dateOk && date ? estimateHeightAt(date, "mainnet", MARGIN_DAYS) : null;
  const exact = dateOk && date ? estimateHeightAt(date, "mainnet", 0) : null;

  const heightNum = heightValue.trim() === "" ? null : Number(heightValue);
  const heightOk = heightNum !== null && Number.isInteger(heightNum) && heightNum >= 0 && heightNum <= 100_000_000;
  const approxDate = heightOk && heightNum !== null ? estimateDateOfHeight(heightNum) : null;

  async function copy() {
    if (recommended === null) return;
    try {
      await navigator.clipboard.writeText(String(recommended));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.tool}>
      <div className={`${styles.toolHead} ${styles.rhTabs}`}>
        <span className={styles.toolLabel}>Restore height calculator</span>
        <div className={styles.segment} role="group" aria-label="Direction">
          <button type="button" aria-pressed={mode === "date"} className={mode === "date" ? styles.segOn : styles.seg} onClick={() => setMode("date")}>Date to height</button>
          <button type="button" aria-pressed={mode === "height"} className={mode === "height" ? styles.segOn : styles.seg} onClick={() => setMode("height")}>Height to date</button>
        </div>
      </div>

      {mode === "date" ? (
        <>
          <DateParts
            label="Date of your first payment"
            value={dateValue}
            onChange={(v) => { setDateValue(v); setCopied(false); }}
            min={MIN_DATE}
            max={today || undefined}
            precision="day"
            hint="Pick the day you made the wallet or got your first Monero. If unsure, pick an earlier day."
          />
          <div id="rh-result" aria-live="polite" className={styles.result}>
            {recommended !== null && exact !== null ? (
              <div className={`${styles.resultCard} ${styles.resultOk}`}>
                <span className={styles.resultBadgeOk}>Recommended restore height</span>
                <p className={styles.rhBig}>{formatNumber(recommended)}</p>
                <div className={styles.rhRow}>
                  <p className={styles.rhApprox}>Approximate block on that date: <b>{formatNumber(exact)}</b></p>
                  <button type="button" className={styles.rhCopy} onClick={copy}>{copied ? "Copied" : "Copy height"}</button>
                </div>
                <p className={styles.resultNote}>We start {MARGIN_DAYS} days early so the scan cannot miss a payment.</p>
              </div>
            ) : dateValue && !dateOk ? (
              <div className={`${styles.resultCard} ${styles.resultBad}`}>
                <span className={styles.resultBadgeBad}>Date out of range</span>
                <p className={styles.resultNote}>Monero mainnet started on 18 April 2014. Pick a date between then and today.</p>
              </div>
            ) : (
              <p className={styles.resultIdle}>Pick a date. Your restore height shows up here.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <label htmlFor="rh-height" className={styles.rhFieldLabel}>Block height</label>
          <input id="rh-height" type="number" inputMode="numeric" min={0} step={1} className={`input mono ${styles.rhField}`} placeholder="For example 1900000" value={heightValue} onChange={(e) => setHeightValue(e.target.value)} aria-describedby="rh-hint-h rh-result-h" aria-invalid={heightValue.trim() !== "" && !heightOk ? true : undefined} />
          <p id="rh-hint-h" className={styles.rhHint}>A whole number of blocks, for example from a block explorer or a wallet.</p>
          <div id="rh-result-h" aria-live="polite" className={styles.result}>
            {approxDate ? (
              <div className={`${styles.resultCard} ${styles.resultOk}`}>
                <span className={styles.resultBadgeOk}>Approximate date</span>
                <p className={styles.rhDate}>about {formatDate(approxDate)}</p>
                <p className={styles.resultNote}>Block {formatNumber(heightNum ?? 0)} on Monero mainnet. This is an estimate, not an exact timestamp.</p>
              </div>
            ) : heightValue.trim() !== "" ? (
              <div className={`${styles.resultCard} ${styles.resultBad}`}>
                <span className={styles.resultBadgeBad}>Not a valid height</span>
                <p className={styles.resultNote}>Enter a whole number, zero or higher.</p>
              </div>
            ) : (
              <p className={styles.resultIdle}>Enter a block height. The approximate date shows up here.</p>
            )}
          </div>
        </>
      )}

      <p className={styles.toolDisclaimer}>
        Mainnet only. Everything is worked out in your browser from block timestamps built into the page, so nothing is sent
        anywhere. Results are estimates, good to within about a day.
      </p>
    </div>
  );
}
