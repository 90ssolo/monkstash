"use client";
/**
 * Date field built from Month / Day / Year selects, styled as one control in the Ledger
 * design. Native selects keep it accessible and give phones their own wheel or list
 * picker. With precision "month" there is no day: the 1st is used, which is the safe,
 * earlier choice when the date only decides where a wallet scan starts.
 *
 * Value in and out: "YYYY-MM-DD", or "" while incomplete.
 */
import { useEffect, useId, useMemo, useState } from "react";
import styles from "./date-parts.module.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-based
function parse(v: string): { y: number; m: number; d: number } | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return r ? { y: Number(r[1]), m: Number(r[2]), d: Number(r[3]) } : null;
}

export interface DatePartsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Earliest allowed date, "YYYY-MM-DD". */
  min: string;
  /** Latest allowed date, "YYYY-MM-DD". Defaults to today. */
  max?: string;
  precision?: "month" | "day";
  hint?: React.ReactNode;
  /** Shown under the field when a full date is chosen. */
  summary?: (value: string) => React.ReactNode;
  /** Optional "I'm not sure" style action that clears the value. */
  clearLabel?: string;
}

export function DateParts({ label, value, onChange, min, max, precision = "day", hint, summary, clearLabel }: DatePartsProps) {
  const id = useId();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  const lo = parse(min)!;
  const hi = parse(max ?? today ?? `${new Date().getUTCFullYear()}-12-31`)!;

  const initial = parse(value);
  const [y, setY] = useState<number | "">(initial?.y ?? "");
  const [m, setM] = useState<number | "">(initial?.m ?? "");
  const [d, setD] = useState<number | "">(precision === "day" ? initial?.d ?? "" : 1);

  // Keep in sync when the parent clears or replaces the value.
  useEffect(() => {
    const p = parse(value);
    if (!value) { setY(""); setM(""); if (precision === "day") setD(""); return; }
    if (p) { setY(p.y); setM(p.m); setD(precision === "day" ? p.d : 1); }
  }, [value, precision]);

  const years = useMemo(() => Array.from({ length: hi.y - lo.y + 1 }, (_, i) => hi.y - i), [hi.y, lo.y]);
  const monthOk = (mm: number) => !(y === lo.y && mm < lo.m) && !(y === hi.y && mm > hi.m);
  const maxDay = y !== "" && m !== "" ? daysIn(y, m) : 31;
  const dayOk = (dd: number) => dd <= maxDay && !(y === lo.y && m === lo.m && dd < lo.d) && !(y === hi.y && m === hi.m && dd > hi.d);

  function emit(ny: number | "", nm: number | "", nd: number | "") {
    if (ny === "" || nm === "" || nd === "") return onChange("");
    // Clamp into range: month precision in the first month may fall before `min`.
    let iso = `${ny}-${pad(nm)}-${pad(Math.min(nd, daysIn(ny, nm)))}`;
    if (iso < min) iso = min;
    const top = `${hi.y}-${pad(hi.m)}-${pad(hi.d)}`;
    if (iso > top) iso = top;
    onChange(iso);
  }

  const setPart = (part: "y" | "m" | "d", raw: string) => {
    const v = raw === "" ? "" : Number(raw);
    const ny = part === "y" ? v : y;
    let nm = part === "m" ? v : m;
    let nd = part === "d" ? v : d;
    // Drop a month or day that the new year/month no longer allows.
    if (ny !== "" && nm !== "" && ((ny === lo.y && nm < lo.m) || (ny === hi.y && nm > hi.m))) nm = "";
    if (precision === "day" && ny !== "" && nm !== "" && nd !== "" && nd > daysIn(ny, nm)) nd = "";
    setY(ny); setM(nm); setD(precision === "day" ? nd : 1);
    emit(ny, nm, precision === "day" ? nd : 1);
  };

  const hintId = hint ? `${id}-hint` : undefined;
  const sumId = summary && value ? `${id}-sum` : undefined;

  return (
    <fieldset className={styles.field} aria-describedby={[hintId, sumId].filter(Boolean).join(" ") || undefined}>
      <legend className={styles.legend}>{label}</legend>
      <div className={`${styles.control} ${precision === "day" ? styles.three : styles.two}`}>
        <select aria-label="Month" className={styles.part} value={m} onChange={(e) => setPart("m", e.target.value)}>
          <option value="">Month</option>
          {MONTHS.map((name, i) => <option key={name} value={i + 1} disabled={!monthOk(i + 1)}>{name}</option>)}
        </select>
        {precision === "day" ? (
          <select aria-label="Day" className={styles.part} value={d} onChange={(e) => setPart("d", e.target.value)}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => <option key={n} value={n} disabled={!dayOk(n)}>{n}</option>)}
          </select>
        ) : null}
        <select aria-label="Year" className={styles.part} value={y} onChange={(e) => setPart("y", e.target.value)}>
          <option value="">Year</option>
          {years.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {hint ? <p id={hintId} className={styles.hint}>{hint}</p> : null}
      {summary && value ? <p id={sumId} className={styles.summary} aria-live="polite">{summary(value)}</p> : null}
      {clearLabel && value ? (
        <button type="button" className={styles.clear} onClick={() => { setY(""); setM(""); setD(precision === "day" ? "" : 1); onChange(""); }}>
          {clearLabel}
        </button>
      ) : null}
    </fieldset>
  );
}

/** "1 March 2019" / "March 2019" for summaries. */
export function formatDate(iso: string, precision: "month" | "day" = "day"): string {
  const p = parse(iso);
  if (!p) return "";
  return precision === "month" ? `${MONTHS[p.m - 1]} ${p.y}` : `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}
