"use client";
/**
 * The wallet checkup: a handful of honest checks, each with one clear fix. Everything is
 * worked out on this device; nothing is sent anywhere. The two self-reported items (backup
 * tested, bookmark) keep only a date or a yes in this browser, never any words.
 */
import { useEffect, useState } from "react";
import type { WalletPublic } from "@quietmint/wallet-core";
import { Credentials, type SettingsActions } from "./WalletSettings";
import styles from "./wallet.module.css";

export type CheckupTarget = "settings" | "contacts";

export interface CheckItem {
  id: string;
  ok: boolean;
  /** Not scored: a choice with trade-offs, not a problem. */
  info?: boolean;
  title: string;
  okText: string;
  fixText: string;
  action?: { label: string; target?: CheckupTarget; inline?: "backup" | "bookmark" };
}

const BACKUP_FRESH_DAYS = 180;
const backupKey = (id: string) => `monkstash.backupTested.${id}`;
const BOOKMARK_KEY = "monkstash.bookmarked";

function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeLocal(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage blocked: the check simply stays open */ }
}

/** Re-reads the self-reported checks (they live in this browser). */
export function useLocalChecks(pub: WalletPublic) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ backupAt: number | null; bookmarked: boolean }>({ backupAt: null, bookmarked: false });
  useEffect(() => {
    const at = Number(readLocal(backupKey(pub.id)) ?? "");
    setState({ backupAt: Number.isFinite(at) && at > 0 ? at : null, bookmarked: readLocal(BOOKMARK_KEY) === "1" });
  }, [pub.id, tick]);
  return { ...state, refresh: () => setTick((t) => t + 1) };
}

export function checkupItems(input: {
  pub: WalletPublic; totpEnabled: boolean; ownNode: boolean; synced: boolean; contacts: number;
  backupAt: number | null; bookmarked: boolean;
}): CheckItem[] {
  const fresh = input.backupAt !== null && Date.now() - input.backupAt < BACKUP_FRESH_DAYS * 86_400_000;
  const items: CheckItem[] = [];
  if (input.pub.kind === "full") {
    items.push({
      id: "backup", ok: fresh, title: "Your paper backup works",
      okText: `Tested on ${input.backupAt ? new Date(input.backupAt).toLocaleDateString() : ""}. Test it again every few months.`,
      fixText: "Prove your written recovery words are right before you need them: type three of them, nothing is shown on screen.",
      action: { label: "Test my backup", inline: "backup" },
    });
  }
  items.push({
    id: "code", ok: input.totpEnabled, title: "A second lock at unlock",
    okText: "A 6-digit code from your phone is needed to open this wallet.",
    fixText: "Add a 6-digit code from an authenticator app, so a stolen password alone cannot open the wallet on this device.",
    action: { label: "Set up the code", target: "settings" },
  });
  items.push({
    id: "bookmark", ok: input.bookmarked, title: "You open MonkStash from a bookmark",
    okText: "Good. Fake wallet sites live in search ads and links; a bookmark skips them.",
    fixText: "Bookmark this page now and always open the wallet from it, never from a search result or a link someone sent.",
    action: { label: "I have bookmarked it", inline: "bookmark" },
  });
  items.push({
    id: "contacts", ok: input.contacts > 0, title: "People you pay are saved as contacts",
    okText: "Saved contacts switch on the tamper alarm: a look-alike address gets flagged before you send.",
    fixText: "Save the people you pay. If an address ever comes back slightly different (a common clipboard attack), the wallet warns you.",
    action: { label: "Add a contact", target: "contacts" },
  });
  items.push({
    id: "synced", ok: input.synced, title: "Up to date with the network",
    okText: "Your balance and payments are current.",
    fixText: "The wallet is still catching up. Keep this tab open until it says Up to date.",
  });
  items.push({
    id: "node", ok: true, info: true, title: input.ownNode ? "Connected to your own node" : "Connected through the MonkStash relay",
    okText: input.ownNode
      ? "Nobody else sees which blocks your wallet asks for."
      : "The relay never sees your keys, but it does see your IP address and sync requests. For full privacy, connect your own node in Settings.",
    fixText: "",
  });
  return items;
}

export function checkupScore(items: CheckItem[]): { done: number; total: number; next: CheckItem | null } {
  const scored = items.filter((i) => !i.info);
  return { done: scored.filter((i) => i.ok).length, total: scored.length, next: scored.find((i) => !i.ok) ?? null };
}

/** Type three of your recovery words; they are compared on this device and never shown. */
function BackupTest({ actions, walletId, onDone }: { actions: SettingsActions; walletId: string; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [seed, setSeed] = useState<string[] | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => () => setSeed(null), []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const words = (await actions.revealSeed(pw, code)).split(" ");
      // Three distinct random word positions (keep drawing until there are three).
      const idx = new Set<number>();
      const rnd = new Uint32Array(1);
      while (idx.size < Math.min(3, words.length)) {
        crypto.getRandomValues(rnd);
        idx.add(rnd[0]! % words.length);
      }
      setPicks([...idx].sort((a, b) => a - b));
      setSeed(words);
      setPw(""); setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!seed) return;
    const ok = picks.every((p, i) => answers[i]!.trim().toLowerCase() === seed[p]!.toLowerCase());
    if (!ok) {
      setError("At least one word does not match your paper. Check the spelling and the word numbers. If your paper is wrong, show your recovery words in Settings and write them again.");
      return;
    }
    writeLocal(backupKey(walletId), String(Date.now()));
    setSeed(null);
    onDone();
  }

  if (!seed) {
    return (
      <form onSubmit={unlock} className={styles.settingsForm}>
        <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="bt" />
        {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
        <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? "Checking…" : "Start the test"}</button>
      </form>
    );
  }
  return (
    <form onSubmit={check} className={styles.settingsForm}>
      <p className="small muted">Get your paper. Type these words from it:</p>
      {picks.map((p, i) => (
        <div className="field" key={p}>
          <label htmlFor={`bt-w${i}`}>Word #{p + 1}</label>
          <input id={`bt-w${i}`} className="input mono" autoComplete="off" autoCapitalize="none" spellCheck={false} value={answers[i]}
            onChange={(e) => { const next = [...answers]; next[i] = e.target.value; setAnswers(next); setError(null); }} required />
        </div>
      ))}
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      <button className="btn btn-primary btn-block">Check my words</button>
    </form>
  );
}

export function Checkup({ items, actions, walletId, onGo, onLocalChange }: {
  items: CheckItem[]; actions?: SettingsActions; walletId: string; onGo: (t: CheckupTarget) => void; onLocalChange: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const { done, total } = checkupScore(items);
  return (
    <div className={styles.checkup}>
      <div className={styles.checkupHead}>
        <p className={styles.checkupScore}><strong>{done}</strong> of {total} done</p>
        <div className={styles.checkupBar} aria-hidden="true"><span style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        <p className="small muted">Worked out on this device. Nothing here is sent anywhere.</p>
      </div>
      <ul className={styles.checkList}>
        {items.map((it) => (
          <li key={it.id} className={`${styles.checkItem} ${it.ok ? styles.checkOk : ""} ${it.info ? styles.checkInfo : ""}`}>
            <span className={styles.checkMark} aria-hidden="true">{it.info ? "i" : it.ok ? "✓" : ""}</span>
            <div className={styles.checkBody}>
              <h3>{it.title} <span className="visually-hidden">{it.info ? "(information)" : it.ok ? "(done)" : "(to do)"}</span></h3>
              <p className="small muted">{it.ok ? it.okText : it.fixText}</p>
              {!it.ok && it.action ? (
                it.action.inline === "backup" && actions ? (
                  open === it.id
                    ? <BackupTest actions={actions} walletId={walletId} onDone={() => { setOpen(null); onLocalChange(); }} />
                    : <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(it.id)}>{it.action.label}</button>
                ) : it.action.inline === "bookmark" ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { writeLocal(BOOKMARK_KEY, "1"); onLocalChange(); }}>{it.action.label}</button>
                ) : it.action.target ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onGo(it.action!.target!)}>{it.action.label}</button>
                ) : null
              ) : null}
              {it.ok && it.id === "backup" && actions ? (
                open === it.id
                  ? <BackupTest actions={actions} walletId={walletId} onDone={() => { setOpen(null); onLocalChange(); }} />
                  : <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(it.id)}>Test again</button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
