"use client";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  checkAddressFormat, checkMoneroWords, estimateHeightAt, exodusPhraseProblem, isHexKey, MoveFileError, MyMoneroPhraseError, openMoveFile, readMoveHeader,
  type MoveHeader, type NetworkType, type SeedCheck, type TotpConfig, type WalletKind,
} from "@quietmint/wallet-core";
import { siteHref, walletAbsoluteUrl } from "@/lib/site";
import { exodusToMoneroSeed, fullMoveSecret, generateWallet, inspectSeed, normalizeSeed, polyseedWallet, validateAddress, viewKeyMatches } from "@/lib/wallet/engine";
import { NETWORK } from "@/lib/wallet/config";
import { isDemo } from "@/lib/wallet/demo";
import type { TestWallet } from "@/lib/wallet/testWallets";
import { PasswordStep } from "./PasswordStep";
import { TotpStep } from "./TotpStep";
import { Stage } from "./Stage";
import {
  ArtAuth, ArtConfirm, ArtLock, ArtRestore, ArtWatch, ArtWelcome, ArtWords, IconCreate, IconMove, IconRestore, IconWatch,
} from "./WalletArt";
import { EMPTY_START, RestoreStartField, startHeight, type RestoreStart } from "./RestoreStart";
import styles from "./wallet.module.css";

export interface OnboardingResult {
  kind: WalletKind;
  network: NetworkType;
  primaryAddress: string;
  restoreHeight: number;
  seed?: string;
  /** Seed passphrase (seed offset) for a 25-word seed. */
  seedOffset?: string;
  /** The 16-word Polyseed this wallet was restored from (`seed` holds the same wallet as 25 words). */
  polyseed?: string;
  polyseedEncrypted?: boolean;
  privateViewKey: string;
  password: string;
  totp?: TotpConfig;
  /** Which path produced this wallet. Demo mode only swaps out the create flow's sample words. */
  origin: "create" | "restore" | "watch";
  /** A move file from another device for this wallet: its scan progress and records come along. */
  moveFile?: Uint8Array;
}

type Mode = "create" | "restore" | "view-only" | "move";
type Base = Omit<OnboardingResult, "password" | "totp">;

/** True when this browser lets the site keep data (localStorage), which a saved wallet needs. */
function storageWorks(): boolean {
  try {
    const probe = "__monkstash_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

/**
 * The setup choices. `moveFirst` lists "I already use MonkStash" first, for the browser extension:
 * most people installing it already use the web wallet.
 */
export function Welcome({ onPick, moveFirst = false, adding = false, onCancel }: { onPick: (m: Mode) => void; moveFirst?: boolean; adding?: boolean; onCancel?: () => void }) {
  // Checked before anything is typed, so nobody writes down words for a wallet that cannot be saved.
  const [blocked, setBlocked] = useState(false);
  useEffect(() => { setBlocked(!storageWorks()); }, []);
  return (
    <Stage
      wide
      kicker="Your wallet"
      sizzle={<>Your money, <mark>your keys</mark>, your browser.</>}
      art={<ArtWelcome />}
      steps={FLOW_STEPS.create}
      current={0}
    >
      <h1 className={styles.title}>{adding ? "Add a wallet" : "Set up your wallet"}</h1>
      <p className="muted">
        {adding
          ? "It joins the wallets in this browser and opens with the same password. Everything happens in this browser."
          : "Everything happens in this browser. Nothing you enter here is sent to MonkStash."}
      </p>
      {blocked ? (
        <div className="notice notice-warn" role="alert" style={{ marginBottom: "var(--s-4)" }}>
          <span>
            <strong>This browser is blocking site storage, so a wallet cannot be saved here.</strong> Allow cookies and site data
            for this site (or leave private browsing), then reload the page.
          </span>
        </div>
      ) : null}
      <div className={styles.choices}>
        {moveFirst ? <MoveChoice disabled={blocked} onPick={onPick} /> : null}
        <button className={styles.choice} disabled={blocked} onClick={() => onPick("create")}>
          <span className={styles.choiceIc}><IconCreate /></span>
          <span className={styles.choiceBody}>
            <strong>Create a new wallet</strong>
            <span>Get a new set of 25 recovery words and a fresh Monero address.</span>
          </span>
          <span className={styles.choiceGo} aria-hidden="true">&rarr;</span>
        </button>
        <button className={styles.choice} disabled={blocked} onClick={() => onPick("restore")}>
          <span className={styles.choiceIc}><IconRestore /></span>
          <span className={styles.choiceBody}>
            <strong>Restore from recovery words</strong>
            <span>Enter the 25 recovery words from Monero GUI, Feather, Cake Wallet or another wallet, your 13 words from MyMonero, or your 12 words from Exodus.</span>
          </span>
          <span className={styles.choiceGo} aria-hidden="true">&rarr;</span>
        </button>
        <button className={styles.choice} disabled={blocked} onClick={() => onPick("view-only")}>
          <span className={styles.choiceIc}><IconWatch /></span>
          <span className={styles.choiceBody}>
            <strong>Add a watch-only wallet</strong>
            <span>Follow the money coming into an address you already own. It can watch, but never spend.</span>
          </span>
          <span className={styles.choiceGo} aria-hidden="true">&rarr;</span>
        </button>
        {moveFirst ? null : <MoveChoice disabled={blocked} onPick={onPick} />}
      </div>
      {adding && onCancel ? (
        <button type="button" className="btn btn-ghost" style={{ marginTop: "var(--s-4)" }} onClick={onCancel}>Back to my wallet</button>
      ) : null}
      <div className="notice notice-warn" style={{ marginTop: "var(--s-5)" }}>
        <span>
          <strong>Early preview.</strong> The wallet works with real XMR. Use small amounts until our public security review
          is complete.
        </span>
      </div>
    </Stage>
  );
}

function MoveChoice({ disabled, onPick }: { disabled: boolean; onPick: (m: Mode) => void }) {
  return (
    <button className={styles.choice} disabled={disabled} onClick={() => onPick("move")}>
      <span className={styles.choiceIc}><IconMove /></span>
      <span className={styles.choiceBody}>
        <strong>I already use MonkStash</strong>
        <span>Bring your wallet from the web wallet, the extension or another browser with a move file and your recovery words, and skip the long scan.</span>
      </span>
      <span className={styles.choiceGo} aria-hidden="true">&rarr;</span>
    </button>
  );
}

export function Onboarding({ mode, testWallets = [], onCancel, onDone, onSwitchMode, adding = false }: {
  mode: Mode; testWallets?: TestWallet[]; onCancel: () => void; onDone: (r: OnboardingResult) => Promise<void>;
  /** Adding a wallet next to others: the password and authenticator of those are used, so there is no step for them. */
  adding?: boolean;
  /** Leaves this path for another one (from "move" to a plain restore when there is no move file). */
  onSwitchMode?: (m: Mode) => void;
}) {
  const [base, setBase] = useState<Base | null>(null);
  // Move mode: the chosen file and what its unencrypted header says (network, wallet type, height).
  const [move, setMove] = useState<PickedMove | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  // Create mode: the generated keys live here so Back from the password step shows the same words again.
  const [createKeys, setCreateKeys] = useState<NewKeys | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What was typed on the restore or watch-only step, so Back from the password step keeps it.
  const [restoreDraft, setRestoreDraft] = useState<RestoreDraft>({ seed: "", start: EMPTY_START });
  const [watchDraft, setWatchDraft] = useState<WatchDraft>({ address: "", viewKey: "", start: EMPTY_START });
  // A ref, not state: a double press lands before React re-renders, and two opens would start two engines.
  const finishing = useRef(false);

  async function finish(totp: TotpConfig | undefined) {
    if (!base || (!password && !adding) || finishing.current) return;
    finishing.current = true;
    setBusy(true);
    setError(null);
    try {
      await onDone({ ...base, password: password ?? "", totp });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      finishing.current = false;
    }
  }

  // Adding: the wallet is saved as soon as its words or keys are in (no password step).
  useEffect(() => {
    if (adding && base) void finish(undefined);
  }, [adding, base]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back goes one step back, not to the start. In create mode, going back from the password step
  // returns to the same recovery words (kept above), so the paper copy stays valid.
  function back() {
    setError(null);
    if (busy) return;
    if (password) return setPassword(null);
    if (base) return setBase(null);
    if (move) return setMove(null);
    onCancel();
  }

  // Move mode checks the file against the words or keys before the password step, so a file from
  // another wallet is caught while the right one can still be chosen. The file's restore height
  // replaces the date question.
  async function acceptBase(b: Base): Promise<string | null> {
    if (mode !== "move" || !move) {
      setBase(b);
      return null;
    }
    try {
      const secret = b.kind === "full" ? fullMoveSecret(b.seed ?? "", b.seedOffset) : b.privateViewKey.trim().toLowerCase();
      const moved = await openMoveFile(move.file, secret, { primaryAddress: b.primaryAddress, network: b.network, kind: b.kind });
      setBase({ ...b, restoreHeight: moved.restoreHeight, moveFile: move.file });
      return null;
    } catch (e) {
      return e instanceof MoveFileError
        ? `${e.message} Check that the file was made from this wallet, or go back and choose another one.`
        : "That move file could not be read. Make a new one on the other device and try again.";
    }
  }

  const stepCount = adding ? (mode === "move" ? 2 : 1) : mode === "create" || mode === "move" ? 4 : 3;
  const step = mode === "move" && !move ? 1 : adding ? stepCount : !base ? stepCount - 2 : !password ? stepCount - 1 : stepCount;
  const keysPhase: Phase = mode === "restore" || (mode === "move" && move?.header.kind === "full") ? "restore" : "watch";

  if (!base && mode === "create") return <AddingContext.Provider value={adding}><CreateSteps keys={createKeys} onKeys={setCreateKeys} onReady={setBase} onCancel={onCancel} /></AddingContext.Provider>;

  return (
    <AddingContext.Provider value={adding}>
    <OnboardFrame
      mode={mode}
      step={step}
      stepCount={stepCount}
      phase={mode === "move" && !move ? "move" : !base || adding ? keysPhase : !password ? "password" : "totp"}
      onCancel={back}
    >
      {mode === "move" && !move ? (
        <MoveFileStep onReady={setMove} onNoFile={onSwitchMode ? () => onSwitchMode("restore") : undefined} />
      ) : !base ? (
        keysPhase === "restore"
          ? <RestoreSeed onReady={acceptBase} testWallets={testWallets} draft={restoreDraft} setDraft={setRestoreDraft} fromMove={move?.name} />
          : <ViewOnly onReady={acceptBase} draft={watchDraft} setDraft={setWatchDraft} fromMove={move?.name} />
      ) : adding ? (
        <div role="status">
          <p className="muted">{error ? null : "Adding the wallet and opening it. If the other wallet was still scanning, this can take a few seconds while it saves."}</p>
          {error ? <p className="error small" role="alert">{error} Use Back to change the words or keys.</p> : null}
        </div>
      ) : !password ? (
        <PasswordStep onDone={setPassword} />
      ) : (
        <>
          <TotpStep onDone={finish} busy={busy} address={base.primaryAddress} />
          {busy ? <p className="small muted" style={{ marginTop: "var(--s-3)" }}>Saving and opening wallet…</p> : null}
          {error ? <p className="error small" role="alert">{error}</p> : null}
        </>
      )}
    </OnboardFrame>
    </AddingContext.Provider>
  );
}

type Phase = "words" | "confirm" | "restore" | "watch" | "move" | "password" | "totp";

const FLOW_STEPS: Record<Mode, string[]> = {
  create: ["Choose", "Recovery words", "Confirm", "Password", "Authenticator"],
  restore: ["Choose", "Recovery words", "Password", "Authenticator"],
  "view-only": ["Choose", "Address and key", "Password", "Authenticator"],
  move: ["Choose", "Move file", "Words or keys", "Password", "Authenticator"],
};

/** True while a wallet is added next to others: its password and authenticator steps do not apply. */
const AddingContext = createContext(false);
const SHARED_STEPS = new Set(["Password", "Authenticator"]);

const FLOW_TITLE: Record<Mode, string> = { create: "Create a new wallet", restore: "Restore a wallet", "view-only": "Add a watch-only wallet", move: "Move a MonkStash wallet here" };

/**
 * Presentational frame shared by every onboarding step: context panel, progress rail, Back row.
 * On every step change, focus moves to the step's heading (an h2 with tabIndex -1) so keyboard and
 * screen reader users land on the new content, and hear its name. `focusKey` asks for the same when
 * a step's content changes inside one phase (keys generated, words revealed).
 */
function OnboardFrame({ mode, step, stepCount, phase, focusKey = "", onCancel, children }: {
  mode: Mode; step: number; stepCount: number; phase: Phase; focusKey?: string; onCancel: () => void; children: React.ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.querySelector<HTMLElement>("h2[tabindex]")?.focus();
  }, [phase, step, focusKey]);
  const adding = useContext(AddingContext);
  const steps = adding ? FLOW_STEPS[mode].filter((n) => !SHARED_STEPS.has(n)) : FLOW_STEPS[mode];
  const stepName = steps[step] ?? "";
  const copy: Record<Phase, { kicker: string; sizzle: React.ReactNode; art: React.ReactNode; tone: "paper" | "ink" }> = {
    words: { kicker: "Recovery words", sizzle: <>These words are the <mark>only key</mark> to your money. Pen, paper, somewhere safe.</>, art: <ArtWords />, tone: "paper" },
    confirm: { kicker: "Check your backup", sizzle: <>A quick check that the <mark>paper copy</mark> is right, before anything gets locked.</>, art: <ArtConfirm />, tone: "paper" },
    restore: { kicker: "Restore", sizzle: <>Bring your wallet back with the words you wrote down. They are <mark>checked on this device</mark>.</>, art: <ArtRestore />, tone: "paper" },
    move: { kicker: "Move", sizzle: <>Bring your wallet over <mark>without the long scan</mark>. The file goes from your device to your device.</>, art: <ArtRestore />, tone: "paper" },
    watch: { kicker: "Watch-only", sizzle: <>Follow an address you own, with <mark>no power to spend</mark> from it.</>, art: <ArtWatch />, tone: "paper" },
    password: { kicker: "Password", sizzle: <>Your password turns the keys into a <mark>locked box</mark> on this device. We never see it.</>, art: <ArtLock />, tone: "ink" },
    totp: { kicker: "Second lock", sizzle: <>An optional code from your phone, <mark>every time you unlock</mark>.</>, art: <ArtAuth />, tone: "ink" },
  };
  const c = copy[phase];
  return (
    <Stage tone={c.tone} kicker={c.kicker} sizzle={c.sizzle} art={c.art} steps={steps} current={step}>
      <h1 className="visually-hidden">{FLOW_TITLE[mode]}, step {step + 1} of {stepCount + 1}: {stepName}</h1>
      <div className={styles.progressRow}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><span aria-hidden="true">←</span> Back</button>
        {/* The rail counts "Choose" as step 1, so the text counter does too. Not a live region (it would be
            remounted and never heard): focus moves to the new step's heading, which names the step. */}
        <span className="small muted">Step {step + 1} of {stepCount + 1}</span>
      </div>
      <div ref={bodyRef}>{children}</div>
    </Stage>
  );
}

/* ---------------- Create: generate, show seed, confirm words ---------------- */

type NewKeys = Awaited<ReturnType<typeof generateWallet>>;

function CreateSteps({ keys, onKeys, onReady, onCancel }: {
  keys: NewKeys | null; onKeys: (k: NewKeys) => void; onReady: (b: Omit<OnboardingResult, "password" | "totp">) => void; onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (keys) return; // Back from the password step: keep the words already shown and written down.
    let alive = true;
    // The offline fallback keeps the default safety margin: an estimate above the real chain height
    // would make the wallet skip its first payments.
    generateWallet(NETWORK, estimateHeightAt(new Date(), NETWORK))
      .then((k) => { if (alive) onKeys(k); })
      .catch((e) => alive && setError(`Could not create a wallet: ${(e as Error).message}`));
    return () => { alive = false; };
  }, [keys, onKeys]);

  if (error) return <OnboardFrame mode="create" step={1} stepCount={4} phase="words" focusKey="error" onCancel={onCancel}><p className="error" role="alert">{error}</p></OnboardFrame>;
  if (!keys) return <OnboardFrame mode="create" step={1} stepCount={4} phase="words" focusKey="loading" onCancel={onCancel}><Loading text="Generating your keys on this device…" /></OnboardFrame>;

  if (confirming) {
    return (
      <OnboardFrame mode="create" step={2} stepCount={4} phase="confirm" onCancel={() => setConfirming(false)}>
        <ConfirmWords
          words={keys.seed.split(" ")}
          onBack={() => setConfirming(false)}
          onOk={() => onReady({ kind: "full", network: NETWORK, primaryAddress: keys.primaryAddress, restoreHeight: keys.restoreHeight, seed: keys.seed, privateViewKey: keys.privateViewKey, origin: "create" })}
        />
      </OnboardFrame>
    );
  }

  const words = keys.seed.split(" ");
  return (
    <OnboardFrame mode="create" step={1} stepCount={4} phase="words" focusKey={revealed ? "revealed" : "ready"} onCancel={onCancel}>
    <div>
      <h2 tabIndex={-1}>Your recovery words</h2>
      {isDemo ? (
        <div className="notice notice-warn" style={{ marginBottom: "var(--s-4)" }}>
          <span>
            <strong>Demo recovery words, for testing this interface only.</strong> They do not restore the assigned test
            wallet. When you finish, the demo assigns one of your configured stagenet test wallets.
          </span>
        </div>
      ) : null}
      <p className="muted">
        These 25 words are called your recovery words (some wallets call them a seed phrase). They are the only way to get
        your money back if you lose this device, and anyone who has them can take it. Write them on paper, in order, and
        keep the paper somewhere safe. Do not take a screenshot or save them in a notes app.
      </p>
      <div className={styles.seedWrap}>
        <ol className={`${styles.seed} ${revealed ? "" : styles.blurred}`} aria-hidden={!revealed} translate="no">
          {/* Words are only put in the DOM once revealed, so nothing can read them early. */}
          {words.map((w, i) => (
            <li key={i}><span>{i + 1}</span>{revealed ? w : "••••••"}</li>
          ))}
        </ol>
        {!revealed ? (
          <button type="button" className={`btn btn-secondary ${styles.reveal}`} onClick={() => setRevealed(true)}>
            Show recovery words
          </button>
        ) : null}
      </div>
      <label className="check" style={{ margin: "var(--s-5) 0" }}>
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} disabled={!revealed} />
        <span>I wrote all 25 words on paper, in order. I understand that if I lose them, no one can get my money back for me.</span>
      </label>
      <button className="btn btn-primary btn-block" disabled={!saved || !revealed} onClick={() => setConfirming(true)}>Continue</button>
    </div>
    </OnboardFrame>
  );
}

function pickIndices(n: number, count: number): number[] {
  const out = new Set<number>();
  const buf = new Uint32Array(1);
  while (out.size < count) {
    crypto.getRandomValues(buf);
    out.add(buf[0]! % n);
  }
  return [...out].sort((a, b) => a - b);
}

function ConfirmWords({ words, onOk, onBack }: { words: string[]; onOk: () => void; onBack: () => void }) {
  const idx = useMemo(() => pickIndices(words.length, 3), [words]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  // Positions (into idx) of the answers that did not match on the last submit.
  const [wrong, setWrong] = useState<number[]>([]);
  const errId = useId();
  const wrongNames = wrong.map((k) => `#${idx[k]! + 1}`);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const bad = idx.flatMap((wi, k) => (answers[k]!.trim().toLowerCase() === words[wi] ? [] : [k]));
        if (!bad.length) return onOk();
        setWrong(bad);
        document.getElementById(`w${bad[0]}`)?.focus();
      }}
    >
      <h2 tabIndex={-1}>Check your backup</h2>
      <p className="muted">Type in the words below from the paper you just wrote, to make sure the copy is correct.</p>
      {idx.map((wi, k) => (
        <div className="field" key={wi}>
          <label htmlFor={`w${k}`}>Word #{wi + 1}</label>
          <input id={`w${k}`} className="input mono" autoComplete="off" autoCapitalize="none" spellCheck={false}
            aria-invalid={wrong.includes(k)} aria-describedby={wrong.includes(k) ? errId : undefined}
            value={answers[k]} onChange={(e) => { const a = [...answers]; a[k] = e.target.value; setAnswers(a); setWrong([]); }} />
        </div>
      ))}
      {wrong.length ? (
        <p id={errId} className="error small" role="alert">
          {wrong.length === 1
            ? `Word ${wrongNames[0]} does not match.`
            : `Words ${wrongNames.slice(0, -1).join(", ")} and ${wrongNames[wrongNames.length - 1]} do not match.`} Check your paper copy.
        </p>
      ) : null}
      <div className={styles.actions}>
        <button className="btn btn-primary btn-block">Confirm</button>
        <button type="button" className="btn btn-ghost btn-block" onClick={onBack}>Show the seed again</button>
      </div>
    </form>
  );
}

/* ---------------- Restore from seed ---------------- */

interface RestoreDraft { seed: string; start: RestoreStart; passphrase?: string }
interface WatchDraft { address: string; viewKey: string; start: RestoreStart }

function RestoreSeed({ onReady, testWallets = [], draft, setDraft, fromMove }: {
  onReady: (b: Base) => Promise<string | null>; testWallets?: TestWallet[]; draft: RestoreDraft; setDraft: (d: RestoreDraft) => void;
  /** The move file's name, when there is one: it carries the restore height, so no date is asked. */
  fromMove?: string;
}) {
  const { seed, start } = draft;
  const setSeed = (v: string) => setDraft({ ...draft, seed: v });
  const setStart = (v: RestoreStart) => setDraft({ ...draft, start: v });
  const passphrase = draft.passphrase ?? "";
  const setPassphrase = (v: string) => setDraft({ ...draft, passphrase: v });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const count = seed.trim() ? normalizeSeed(seed).split(" ").length : 0;
  // Word-level help for 24 and 25 English words: unknown words, the check word, a missing 25th.
  const check = checkMoneroWords(seed);

  /** A 16-word Polyseed: read with the reference library; its date is in the words. */
  async function restorePolyseed() {
    setBusy(true);
    try {
      const p = await polyseedWallet(seed, passphrase, NETWORK);
      const { primaryAddress, privateViewKey } = await inspectSeed(p.seed, NETWORK, p.seedOffset);
      const height = fromMove ? 0 : estimateHeightAt(new Date(p.birthday * 1000), NETWORK);
      const problem = await onReady({
        kind: "full", network: NETWORK, primaryAddress, privateViewKey, seed: p.seed, ...(p.seedOffset ? { seedOffset: p.seedOffset } : {}),
        polyseed: p.polyseed, ...(p.encrypted ? { polyseedEncrypted: true } : {}), restoreHeight: height, origin: "restore",
      });
      if (problem) {
        setError(problem);
        setBusy(false);
      }
    } catch (err) {
      setError(err instanceof Error && err.name === "PolyseedError" ? err.message : "These words could not be read. Check the spelling and the order.");
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (check.kind === "unknown-words") return setError(wordProblem(check));
    if (check.kind === "bad-checksum") return setError("The 25th word does not match the other 24. Monero's last word is a check word, so one of the words is probably wrong or in the wrong place. Compare each word with your backup.");
    if (check.kind === "missing-checksum") return setError(`You entered 24 words. The 25th is a check word made from the other 24: it should be "${check.word}". Add it at the end (or use the button below), then continue.`);
    if (count === 16) return restorePolyseed();
    if (count === 14) return setError("14 words come from Feather before version 2.0. MonkStash cannot restore them yet. Feather still restores them; see our seed doctor for the way to move this wallet.");
    if (count === 24) return setError("24 words that are not Monero words are usually a hardware wallet's phrase (restore it with the device in Monero GUI or Feather) or a 24-word BIP39 wallet from Cake Wallet (restore it in Cake). MonkStash cannot restore those.");
    if (count !== 25 && count !== 13 && count !== 12) return setError(`Recovery words come in sets of 25 (13 from MyMonero, 12 from Exodus). You entered ${count}. Not sure what you have? Our seed doctor helps without asking for your words.`);
    if (count === 12) {
      const problem = exodusPhraseProblem(seed);
      if (problem) return setError(`${problem} If these are not Exodus words, check which wallet they came from.`);
    }
    const from = fromMove ? { height: 0 } : startHeight(start, NETWORK);
    if ("error" in from) return setError(from.error);
    setBusy(true);
    try {
      // An Exodus phrase becomes the standard 25-word seed of the same wallet, so it works everywhere from here on.
      const words = count === 12 ? await exodusToMoneroSeed(seed, NETWORK) : normalizeSeed(seed);
      // A passphrase only exists for 25-word seeds (MyMonero and Exodus phrases have none).
      const seedOffset = count === 25 && passphrase ? passphrase : undefined;
      const { primaryAddress, privateViewKey } = await inspectSeed(words, NETWORK, seedOffset);
      // Exodus added Monero on 26 April 2019, so without a date there is no need to scan earlier blocks.
      const height = from.height || (count === 12 && start.by === "date" ? heightFromDate(EXODUS_MONERO_START) : 0);
      const problem = await onReady({ kind: "full", network: NETWORK, primaryAddress, privateViewKey, seed: words, ...(seedOffset ? { seedOffset } : {}), restoreHeight: height, origin: "restore" });
      if (problem) {
        setError(problem);
        setBusy(false);
      }
    } catch (err) {
      // MyMonero phrase errors explain exactly what is wrong (unknown word, last word does not match).
      setError(err instanceof MyMoneroPhraseError
        ? `${err.message} Make sure the 13 words are in the right order.`
        : "These recovery words are not valid. Check the spelling and make sure the words are in the right order.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 tabIndex={-1}>{fromMove ? "Enter this wallet's recovery words" : "Restore from recovery words"}</h2>
      <div className="notice notice-info" style={{ marginBottom: "var(--s-5)" }}>
        <span>{fromMove
          ? <>The words unlock <span className="mono">{fromMove}</span>. They are checked in this browser and never uploaded.</>
          : "Your seed is checked and encrypted in this browser. It is never uploaded."}</span>
      </div>
      {isDemo && testWallets.length ? (
        <div className="card-flat" style={{ marginBottom: "var(--s-5)" }}>
          <p className="small" style={{ margin: "0 0 var(--s-2)", fontWeight: 600 }}>Demo fixtures</p>
          <p className="small muted" style={{ margin: "0 0 var(--s-3)" }}>
            These buttons fill a configured test wallet&apos;s <strong>real</strong> seed, which genuinely restores that
            stagenet wallet. This is a true restore, unlike the sample words in the create flow.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)" }}>
            {testWallets.map((w) => (
              <button key={w.label} type="button" className="btn btn-secondary btn-sm" onClick={() => { setSeed(w.seed); setError(null); }}>
                Fill {w.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="seed">Your recovery words (25, 16 from Cake Wallet or Feather, 13 from MyMonero, or 12 from Exodus)</label>
        <textarea id="seed" className="textarea mono" autoComplete="off" autoCapitalize="none" spellCheck={false} value={seed}
          onChange={(e) => { setSeed(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "seed-hint seed-err" : "seed-hint"} />
        <span id="seed-hint" className="hint">
          {count === 16 ? "16 words: a Polyseed (Cake Wallet, Feather). The date the wallet was made is in the words, so no date is needed."
            : count === 13 ? "13 words: a MyMonero phrase. After restoring, check the address matches your old MyMonero address."
            : count === 12 ? "12 words: an Exodus phrase. We turn it into the standard 25-word Monero seed for the same wallet (see it later in Settings). After restoring, check the address matches the Monero address Exodus showed you."
            : `${count} of 25 words`}
        </span>
        {check.kind === "unknown-words" ? <p className="small" role="status" style={{ margin: "var(--s-2) 0 0" }}>{wordProblem(check)}</p> : null}
        {check.kind === "ok" ? <p className="small muted" style={{ margin: "var(--s-2) 0 0" }}>All 25 words are Monero words and the check word matches.</p> : null}
        {check.kind === "missing-checksum" ? (
          <p className="small" role="status" style={{ margin: "var(--s-2) 0 0" }}>
            24 words: the 25th, a check word made from the others, is missing. It should be <strong className="mono">{check.word}</strong>.{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSeed(`${normalizeSeed(seed)} ${check.word}`); setError(null); }}>Add it</button>
          </p>
        ) : null}
      </div>
      {count === 25 || count === 16 || passphrase ? <SeedPassphrase value={passphrase} onChange={(v) => { setPassphrase(v); setError(null); }} /> : null}
      {fromMove || count === 16 ? null : <RestoreStartField value={start} onChange={setStart} network={NETWORK} idPrefix="restore" />}
      {error ? <p id="seed-err" className="error small" role="alert">{error}</p> : null}
      <p className="small muted">Not sure what kind of phrase you have? The <a href={siteHref("/tools/monero-seed-doctor")}>seed doctor</a> tells you, without asking for your words.</p>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
    </form>
  );
}

/**
 * The optional seed passphrase ("seed offset"). Folded away: most seeds have none, and a wrong one
 * quietly opens a different, empty wallet, so it says how to check.
 */
export function SeedPassphrase({ value, onChange, id = "seed-pass" }: { value: string; onChange: (v: string) => void; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <details className={styles.passDetails} open={!!value || undefined}>
      <summary>My seed has a passphrase</summary>
      <p className="small muted">
        Only if you set one when the wallet was made, as a seed passphrase in Cake Wallet or a seed offset in Monerujo or the
        Monero CLI. With a wrong passphrase the words open a different, empty wallet without any error, so after restoring,
        check that the address matches the one your old wallet showed.
      </p>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor={id}>Seed passphrase</label>
        <div className={styles.noteRow}>
          <input id={id} className="input" type={show ? "text" : "password"} autoComplete="off" autoCapitalize="none" spellCheck={false}
            value={value} onChange={(e) => onChange(e.target.value)} />
          <button type="button" className="btn btn-ghost btn-sm" aria-pressed={show} onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
        </div>
        <span className="hint">Typed exactly, including capitals and spaces.</span>
      </div>
    </details>
  );
}

/** Plain words for unknown seed words, with the closest Monero words. */
function wordProblem(check: Extract<SeedCheck, { kind: "unknown-words" }>): string {
  const parts = check.unknown.slice(0, 3).map((u) =>
    `word ${u.position}, "${u.word}", is not a Monero word${u.suggestions.length ? ` (did you mean ${u.suggestions.map((w) => `"${w}"`).join(" or ")}?)` : ""}`);
  const more = check.unknown.length > 3 ? ` ${check.unknown.length - 3} more words are not Monero words either.` : "";
  const text = parts.join("; ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.${more} Only the first 3 letters of each word count.`;
}

/* ---------------- View-only ---------------- */

/** The first character of a primary address on each network. */
const PRIMARY_PREFIX: Record<NetworkType, string> = { mainnet: "4", stagenet: "5", testnet: "9" };

function ViewOnly({ onReady, draft, setDraft, fromMove }: { onReady: (b: Base) => Promise<string | null>; draft: WatchDraft; setDraft: (d: WatchDraft) => void; fromMove?: string }) {
  const { address, viewKey, start } = draft;
  const setAddress = (v: string) => setDraft({ ...draft, address: v });
  const setViewKey = (v: string) => setDraft({ ...draft, viewKey: v });
  const setStart = (v: RestoreStart) => setDraft({ ...draft, start: v });
  const prefix = PRIMARY_PREFIX[NETWORK];
  const [error, setErrorText] = useState<string | null>(null);
  // Which field the error is about, so it is tied to that input (aria-invalid + aria-describedby).
  const [errorField, setErrorField] = useState<"addr" | "vk" | "both" | null>(null);
  const [busy, setBusy] = useState(false);
  const fmt = address ? checkAddressFormat(address, NETWORK) : null;
  const setError = (msg: string | null, field: "addr" | "vk" | "both" | null = null) => { setErrorText(msg); setErrorField(msg ? field : null); };
  const addrBad = errorField === "addr" || errorField === "both";
  const vkBad = errorField === "vk" || errorField === "both";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fmt?.ok) return setError(fmt?.reason ?? "Enter your primary address", "addr");
    if (fmt.kind !== "primary") {
      return setError(`Use your primary address (it starts with ${prefix}), not ${fmt.kind === "integrated" ? "an integrated address" : "a subaddress"}.`, "addr");
    }
    if (!isHexKey(viewKey)) return setError("The private view key is 64 characters of 0-9 and a-f.", "vk");
    const from = fromMove ? { height: 0 } : startHeight(start, NETWORK);
    if ("error" in from) return setError(from.error);
    setBusy(true);
    if (!(await validateAddress(address, NETWORK))) {
      setBusy(false);
      return setError("This address failed the checksum test. Copy it again from your wallet.", "addr");
    }
    if (!(await viewKeyMatches(address, viewKey, NETWORK))) {
      setBusy(false);
      return setError("This view key does not belong to this address. Copy both again from the same wallet (a wrong key would show 0 XMR forever).", "both");
    }
    const problem = await onReady({ kind: "view-only", network: NETWORK, primaryAddress: address.trim(), privateViewKey: viewKey.trim().toLowerCase(), restoreHeight: from.height, origin: "watch" });
    if (problem) {
      setBusy(false);
      setError(problem);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 tabIndex={-1}>{fromMove ? "Enter this wallet's address and view key" : "Add a view-only wallet"}</h2>
      {fromMove ? (
        <p className="muted">
          <span className="mono">{fromMove}</span> is from a watch-only wallet. Enter the same primary address and private view
          key you used on the other device. They unlock the file and are checked in this browser.
        </p>
      ) : (
        <p className="muted">
          A view-only wallet shows incoming payments but cannot send. Find both values in your current wallet: in Monero GUI
          under Settings, Seed &amp; keys; in Feather under Wallet, Keys.
        </p>
      )}
      <div className="field">
        <label htmlFor="addr">Primary address</label>
        <textarea id="addr" className="textarea mono" style={{ minHeight: 80 }} autoComplete="off" spellCheck={false} value={address}
          onChange={(e) => { setAddress(e.target.value); setError(null); }}
          aria-invalid={addrBad || (!!fmt && !fmt.ok)} aria-describedby={addrBad ? "addr-hint vo-err" : "addr-hint"} />
        <span id="addr-hint" className={fmt && !fmt.ok ? "error" : "hint"}>{fmt ? (fmt.ok ? `Looks like ${fmt.kind === "integrated" ? "an" : "a"} ${fmt.kind} address` : fmt.reason) : `Starts with ${prefix}, 95 characters`}</span>
      </div>
      <div className="field">
        <label htmlFor="vk">Private view key</label>
        <input id="vk" className="input mono" autoComplete="off" spellCheck={false} value={viewKey}
          onChange={(e) => { setViewKey(e.target.value); setError(null); }}
          aria-invalid={vkBad} aria-describedby={vkBad ? "vk-hint vo-err" : "vk-hint"} />
        <span id="vk-hint" className="hint">Never enter your private spend key or seed here.</span>
      </div>
      {fromMove ? null : <RestoreStartField value={start} onChange={setStart} network={NETWORK} idPrefix="watch" />}
      {error ? <p id="vo-err" className="error small" role="alert">{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
    </form>
  );
}

/* ---------------- Move from another device ---------------- */

type PickedMove = { file: Uint8Array; header: MoveHeader; name: string };

/** Largest move file accepted (a very long-lived wallet's file is tens of MB). */
const MOVE_FILE_MAX_BYTES = 256 * 1024 * 1024;

/** The web wallet, where most move files are made. */
const walletHref = walletAbsoluteUrl;

function MoveFileStep({ onReady, onNoFile }: { onReady: (m: PickedMove) => void; onNoFile?: () => void }) {
  const [picked, setPicked] = useState<PickedMove | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPicked(null);
    setError(null);
    if (!f) return;
    if (f.size > MOVE_FILE_MAX_BYTES) return setError("This file is too large to be a MonkStash move file.");
    setReading(true);
    try {
      const file = new Uint8Array(await f.arrayBuffer());
      const header = readMoveHeader(file);
      if (header.network !== NETWORK) setError(`This move file is for ${header.network}, but this wallet runs on ${NETWORK}.`);
      else setPicked({ file, header, name: f.name });
    } catch (err) {
      setError(err instanceof MoveFileError ? err.message : "That file could not be read.");
    } finally {
      setReading(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (picked) onReady(picked); }}>
      <h2 tabIndex={-1}>Bring your wallet from another device</h2>
      <p className="muted">
        Each browser and extension keeps its own storage, and we never hold a copy of your wallet, so it cannot show up here on
        its own. A move file brings it over with its scan progress, so you skip the long first scan.
      </p>
      <ol className={styles.moveSteps}>
        <li>
          Open your wallet where you use it now: <a href={walletHref} target="_blank" rel="noopener">MonkStash on the web</a>, the
          extension, or another browser. Wait until it says <b>Up to date</b>, then go to <b>Settings</b>, <b>Move to another device</b>, and save a move file.
          It asks for that wallet&apos;s password.
        </li>
        <li>Choose the file below. Then enter the wallet&apos;s recovery words (for a watch-only wallet, its address and view key). They unlock the file.</li>
      </ol>
      <div className="field">
        <label htmlFor="move-setup-file">Move file</label>
        <input id="move-setup-file" className="input" type="file" accept=".monkstash" onChange={pick}
          aria-invalid={!!error} aria-describedby={error ? "move-setup-hint move-setup-err" : "move-setup-hint"} />
        <span id="move-setup-hint" className="hint">A file ending in .monkstash. It is read in this browser and never uploaded.</span>
      </div>
      {reading ? <p className="small muted" role="status">Reading the file…</p> : null}
      {picked ? (
        <p className="small" role="status">
          {picked.header.kind === "full" ? "Full wallet" : "Watch-only wallet"}, scanned to block{" "}
          <span className="tnum">{picked.header.height.toLocaleString()}</span>, saved{" "}
          {new Date(picked.header.savedAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      ) : null}
      {error ? <p id="move-setup-err" className="error small" role="alert">{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={!picked}>Continue</button>
      {onNoFile ? (
        <div className={styles.noMoveFile}>
          <p className="small muted">No move file? You can restore with your recovery words alone. The wallet then scans the chain on its own, which can take a while for an older wallet.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onNoFile}>Restore with words only</button>
        </div>
      ) : null}
    </form>
  );
}

/* ---------------- Shared ---------------- */

/** Exodus added Monero on 26 April 2019 (its own guidance for an unknown restore date). */
const EXODUS_MONERO_START = "2019-04-26";

function heightFromDate(date: string): number {
  if (!date) return 0;
  return estimateHeightAt(new Date(`${date}T00:00:00Z`), NETWORK);
}

function Loading({ text }: { text: string }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
export { Loading };
