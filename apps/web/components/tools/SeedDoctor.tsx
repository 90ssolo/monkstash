"use client";
/**
 * Seed doctor: tells someone what kind of Monero recovery phrase they have and where it restores,
 * from two safe answers (how many words, which app made it) and an optional date. It never asks
 * for the words themselves: a site that does is the classic phishing pattern.
 */
import Link from "next/link";
import { useState } from "react";
import { estimateHeightAt } from "@quietmint/wallet-core";
import { DateParts } from "@/components/forms/DateParts";
import { diagnose, MAKERS, WORD_COUNTS, ZERO_BALANCE_CAUSES, type MadeBy, type WordCount } from "@/lib/seedDoctor";
import { walletUrl } from "@/lib/site";
import styles from "./tools.module.css";

const MARGIN_DAYS = 7;
const MIN_DATE = "2014-04-18";

export function SeedDoctor() {
  const [count, setCount] = useState<WordCount | null>(null);
  const [madeBy, setMadeBy] = useState<MadeBy | null>(null);
  const [date, setDate] = useState("");

  const d = count !== null && madeBy !== null ? diagnose(count, madeBy) : null;
  const when = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  const height = when ? estimateHeightAt(when, "mainnet", MARGIN_DAYS) : null;

  return (
    <div className={styles.tool}>
      <div className={styles.toolHead}>
        <span className={styles.toolLabel}>Seed doctor</span>
        <span className={styles.count}>Never asks for your words</span>
      </div>

      <fieldset className={styles.sdStep}>
        <legend className={styles.rhFieldLabel}>1. How many words does your backup have?</legend>
        <div className={styles.sdChoices}>
          {WORD_COUNTS.map((c) => (
            <button key={c} type="button" aria-label={c === "other" ? "Another number of words" : `${c} words`} aria-pressed={count === c} className={count === c ? styles.segOn : styles.seg} onClick={() => setCount(c)}>
              {c === "other" ? "Other" : c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.sdStep}>
        <legend className={styles.rhFieldLabel}>2. Which app gave you the words?</legend>
        <div className={styles.sdChoices}>
          {MAKERS.map((m) => (
            <button key={m.id} type="button" aria-pressed={madeBy === m.id} className={madeBy === m.id ? styles.segOn : styles.seg} onClick={() => setMadeBy(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div id="sd-result" aria-live="polite" className={styles.result}>
        {d ? (
          <div className={`${styles.resultCard} ${d.here === "no" ? styles.resultBad : styles.resultOk}`}>
            <span className={d.here === "no" ? styles.resultBadgeBad : styles.resultBadgeOk}>
              {d.here === "yes" ? "MonkStash can restore it" : d.here === "check" ? "MonkStash may restore it: check the address" : "MonkStash cannot restore it yet"}
            </span>
            <p className={styles.resultReason}>{d.name}</p>
            <p className={styles.resultNote}>{d.what}</p>
            <p className={styles.resultNote}><b>Here:</b> {d.hereNote} <b>Elsewhere:</b> {d.elsewhere}</p>
            <ol className={styles.sdSteps}>
              {d.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <p className={styles.resultNote}>
              {d.guide ? <><Link href={d.guide.href}>{d.guide.label}</Link>. </> : null}
              {d.here !== "no" ? <Link href={walletUrl}>Open the MonkStash wallet</Link> : null}
            </p>
          </div>
        ) : (
          <p className={styles.resultIdle}>Answer both questions. Your answer shows up here.</p>
        )}
      </div>

      {d?.needsHeight ? (
        <div className={styles.sdStep}>
          <DateParts
            label="3. Optional: about when did you get your first payment?"
            value={date}
            onChange={setDate}
            min={MIN_DATE}
            precision="month"
            hint="Pick a month you are sure is early enough. Too early only makes the scan slower; too late hides money."
          />
          {height !== null ? (
            <p className={styles.rhApprox} aria-live="polite">Restore from block <b>{height.toLocaleString("en-US")}</b> or earlier (that includes {MARGIN_DAYS} days of margin).</p>
          ) : null}
        </div>
      ) : null}

      {d && d.here !== "no" ? (
        <details className={styles.sdZero}>
          <summary>Restored, but the balance shows 0?</summary>
          <ol>
            {ZERO_BALANCE_CAUSES.map((c) => <li key={c.title}><b>{c.title}.</b> {c.body}</li>)}
          </ol>
        </details>
      ) : null}

      <p className={styles.toolDisclaimer}>
        We never ask for your recovery words here, and nobody honest ever will on a website. Type them only into a wallet app you trust.
      </p>
    </div>
  );
}
