"use client";
/**
 * Where a wallet scan starts: a date (turned into an estimated block height, with a week of
 * margin) or an exact block height, for people who have one (for example from the watch-only
 * keys screen of another MonkStash wallet, or from Monero GUI's "restore height").
 */
import { estimateHeightAt, type NetworkType } from "@quietmint/wallet-core";
import { DateParts, formatDate } from "@/components/forms/DateParts";
import styles from "./wallet.module.css";

export type RestoreStart = { by: "date"; date: string } | { by: "height"; height: string };
export const EMPTY_START: RestoreStart = { by: "date", date: "" };

/** The start height, 0 for "the whole history", or an error to show. */
export function startHeight(v: RestoreStart, network: NetworkType): { height: number } | { error: string } {
  if (v.by === "date") return { height: v.date ? estimateHeightAt(new Date(`${v.date}T00:00:00Z`), network) : 0 };
  const t = v.height.trim().replace(/[\s,.']/g, "");
  if (!t) return { error: "Enter the block height, or switch to a date." };
  if (!/^\d{1,9}$/.test(t)) return { error: "A block height is a whole number, like 3150000." };
  const h = Number(t);
  // No margin here: an estimate of today's height, plus a day for an estimate that runs behind.
  const tip = estimateHeightAt(new Date(), network, 0) + 720;
  if (network !== "testnet" && h > tip) return { error: `That height is in the future. The chain is at about block ${(tip - 720).toLocaleString()}.` };
  return { height: h };
}

export function RestoreStartField({ value, onChange, network, idPrefix = "rs", dateLabel }: {
  value: RestoreStart; onChange: (v: RestoreStart) => void; network: NetworkType; idPrefix?: string; dateLabel?: string;
}) {
  return (
    <fieldset className={styles.startField}>
      <legend className="visually-hidden">Where should the wallet start looking?</legend>
      <div className={styles.startToggle} role="radiogroup" aria-label="Start from">
        <label className="check">
          <input type="radio" name={`${idPrefix}-by`} checked={value.by === "date"} onChange={() => onChange({ by: "date", date: "" })} />
          <span>A date</span>
        </label>
        <label className="check">
          <input type="radio" name={`${idPrefix}-by`} checked={value.by === "height"} onChange={() => onChange({ by: "height", height: "" })} />
          <span>A block height (restore height)</span>
        </label>
      </div>
      {value.by === "date" ? (
        <DateParts
          label={dateLabel ?? "About when did you first make this wallet? (recommended)"}
          value={value.date}
          onChange={(date) => onChange({ by: "date", date })}
          min="2014-04-18"
          precision="month"
          hint="This lets the wallet skip ahead and find your money faster. Not sure? Pick a month you know is earlier. If you leave it empty, it checks the whole history, which can take a long time."
          summary={(v) => <>The wallet will start looking for your payments from {formatDate(v, "month")}, with an extra week of margin.</>}
          clearLabel="Clear the date and check the whole history"
        />
      ) : (
        <div className="field">
          <label htmlFor={`${idPrefix}-height`}>Restore height</label>
          <input id={`${idPrefix}-height`} className="input mono" inputMode="numeric" autoComplete="off" spellCheck={false} placeholder="For example 3150000"
            value={value.height} onChange={(e) => onChange({ by: "height", height: e.target.value })} aria-describedby={`${idPrefix}-height-hint`} />
          <span id={`${idPrefix}-height-hint`} className="hint">The block where the scan starts. Payments before it are not found, so if unsure, use a lower number.</span>
        </div>
      )}
    </fieldset>
  );
}
