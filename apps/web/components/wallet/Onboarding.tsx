"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  checkAddressFormat, checkMoneroWords, estimateHeightAt, exodusPhraseProblem, isHexKey, MyMoneroPhraseError, type NetworkType, type SeedCheck, type TotpConfig, type WalletKind,
} from "@quietmint/wallet-core";
import { siteHref } from "@/lib/site";
import { exodusToMoneroSeed, generateWallet, inspectSeed, normalizeSeed, validateAddress, viewKeyMatches } from "@/lib/wallet/engine";
import { NETWORK } from "@/lib/wallet/config";
import { isDemo } from "@/lib/wallet/demo";
import type { TestWallet } from "@/lib/wallet/testWallets";
import { PasswordStep } from "./PasswordStep";
import { TotpStep } from "./TotpStep";
import { Stage } from "./Stage";
import {
  ArtAuth, ArtConfirm, ArtLock, ArtRestore, ArtWatch, ArtWelcome, ArtWords, IconCreate, IconRestore, IconWatch,
} from "./WalletArt";
import { EMPTY_START, RestoreStartField, startHeight, type RestoreStart } from "./RestoreStart";
import styles from "./wallet.module.css";

export interface OnboardingResult {
  kind: WalletKind;
  network: NetworkType;
  primaryAddress: string;
  restoreHeight: number;
  seed?: string;
  privateViewKey: string;
  password: string;
  totp?: TotpConfig;
  /** Which path produced this wallet. Demo mode only swaps out the create flow's sample words. */
  origin: "create" | "restore" | "watch";
}

type Mode = "create" | "restore" | "view-only";

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

export function Welcome({ onPick }: { onPick: (m: Mode) => void }) {
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
      <h1 className={styles.title}>Set up your wallet</h1>
      <p className="muted">Everything happens in this browser. Nothing you enter here is sent to MonkStash.</p>
      {blocked ? (
        <div className="notice notice-warn" role="alert" style={{ marginBottom: "var(--s-4)" }}>
          <span>
            <strong>This browser is blocking site storage, so a wallet cannot be saved here.</strong> Allow cookies and site data
            for this site (or leave private browsing), then reload the page.
          </span>
        </div>
      ) : null}
      <div className={styles.choices}>
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
      </div>
      <div className="notice notice-warn" style={{ marginTop: "var(--s-5)" }}>
        <span>
          <strong>Early preview.</strong> The wallet works with real XMR. Use small amounts until our public security review
          is complete.
        </span>
      </div>
    </Stage>
  );
}

export function Onboarding({ mode, testWallets = [], onCancel, onDone }: { mode: Mode; testWallets?: TestWallet[]; onCancel: () => void; onDone: (r: OnboardingResult) => Promise<void> }) {
  const [base, setBase] = useState<Omit<OnboardingResult, "password" | "totp"> | null>(null);
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
    if (!base || !password || finishing.current) return;
    finishing.current = true;
    setBusy(true);
    setError(null);
    try {
      await onDone({ ...base, password, totp });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      finishing.current = false;
    }
  }

  // Back goes one step back, not to the start. In create mode, going back from the password step
  // returns to the same recovery words (kept above), so the paper copy stays valid.
  function back() {
    setError(null);
    if (busy) return;
    if (password) return setPassword(null);
    if (base) return setBase(null);
    onCancel();
  }

  const stepCount = mode === "create" ? 4 : 3;
  const step = !base ? 1 : !password ? stepCount - 1 : stepCount;

  if (!base && mode === "create") return <CreateSteps keys={createKeys} onKeys={setCreateKeys} onReady={setBase} onCancel={onCancel} />;

  return (
    <OnboardFrame
      mode={mode}
      step={step}
      stepCount={stepCount}
      phase={!base ? (mode === "restore" ? "restore" : "watch") : !password ? "password" : "totp"}
      onCancel={back}
    >
      {!base ? (
        mode === "restore" ? <RestoreSeed onReady={setBase} testWallets={testWallets} draft={restoreDraft} setDraft={setRestoreDraft} /> : <ViewOnly onReady={setBase} draft={watchDraft} setDraft={setWatchDraft} />
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
  );
}

type Phase = "words" | "confirm" | "restore" | "watch" | "password" | "totp";

const FLOW_STEPS: Record<Mode, string[]> = {
  create: ["Choose", "Recovery words", "Confirm", "Password", "Authenticator"],
  restore: ["Choose", "Recovery words", "Password", "Authenticator"],
  "view-only": ["Choose", "Address and key", "Password", "Authenticator"],
};

const FLOW_TITLE: Record<Mode, string> = { create: "Create a new wallet", restore: "Restore a wallet", "view-only": "Add a watch-only wallet" };

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
  const stepName = FLOW_STEPS[mode][step] ?? "";
  const copy: Record<Phase, { kicker: string; sizzle: React.ReactNode; art: React.ReactNode; tone: "paper" | "ink" }> = {
    words: { kicker: "Recovery words", sizzle: <>These words are the <mark>only key</mark> to your money. Pen, paper, somewhere safe.</>, art: <ArtWords />, tone: "paper" },
    confirm: { kicker: "Check your backup", sizzle: <>A quick check that the <mark>paper copy</mark> is right, before anything gets locked.</>, art: <ArtConfirm />, tone: "paper" },
    restore: { kicker: "Restore", sizzle: <>Bring your wallet back with the words you wrote down. They are <mark>checked on this device</mark>.</>, art: <ArtRestore />, tone: "paper" },
    watch: { kicker: "Watch-only", sizzle: <>Follow an address you own, with <mark>no power to spend</mark> from it.</>, art: <ArtWatch />, tone: "paper" },
    password: { kicker: "Password", sizzle: <>Your password turns the keys into a <mark>locked box</mark> on this device. We never see it.</>, art: <ArtLock />, tone: "ink" },
    totp: { kicker: "Second lock", sizzle: <>An optional code from your phone, <mark>every time you unlock</mark>.</>, art: <ArtAuth />, tone: "ink" },
  };
  const c = copy[phase];
  return (
    <Stage tone={c.tone} kicker={c.kicker} sizzle={c.sizzle} art={c.art} steps={FLOW_STEPS[mode]} current={step}>
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
        <ol className={`${styles.seed} ${revealed ? "" : styles.blurred}`} aria-hidden={!revealed}>
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

interface RestoreDraft { seed: string; start: RestoreStart }
interface WatchDraft { address: string; viewKey: string; start: RestoreStart }

function RestoreSeed({ onReady, testWallets = [], draft, setDraft }: {
  onReady: (b: Omit<OnboardingResult, "password" | "totp">) => void; testWallets?: TestWallet[]; draft: RestoreDraft; setDraft: (d: RestoreDraft) => void;
}) {
  const { seed, start } = draft;
  const setSeed = (v: string) => setDraft({ ...draft, seed: v });
  const setStart = (v: RestoreStart) => setDraft({ ...draft, start: v });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const count = seed.trim() ? normalizeSeed(seed).split(" ").length : 0;
  // Word-level help for 24 and 25 English words: unknown words, the check word, a missing 25th.
  const check = checkMoneroWords(seed);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (check.kind === "unknown-words") return setError(wordProblem(check));
    if (check.kind === "bad-checksum") return setError("The 25th word does not match the other 24. Monero's last word is a check word, so one of the words is probably wrong or in the wrong place. Compare each word with your backup.");
    if (check.kind === "missing-checksum") return setError(`You entered 24 words. The 25th is a check word made from the other 24: it should be "${check.word}". Add it at the end (or use the button below), then continue.`);
    if (count === 16) return setError("16 words are a Polyseed phrase (Feather and Cake Wallet use it). MonkStash cannot restore Polyseed yet. Meanwhile you can follow this wallet here as watch-only, with its address and private view key, and keep spending from your current wallet.");
    if (count === 14) return setError("14 words come from Feather before version 2.0. MonkStash cannot restore them yet. Feather still restores them; see our seed doctor for the way to move this wallet.");
    if (count === 24) return setError("24 words that are not Monero words are usually a hardware wallet's phrase (restore it with the device in Monero GUI or Feather) or a 24-word BIP39 wallet from Cake Wallet (restore it in Cake). MonkStash cannot restore those.");
    if (count !== 25 && count !== 13 && count !== 12) return setError(`Recovery words come in sets of 25 (13 from MyMonero, 12 from Exodus). You entered ${count}. Not sure what you have? Our seed doctor helps without asking for your words.`);
    if (count === 12) {
      const problem = exodusPhraseProblem(seed);
      if (problem) return setError(`${problem} If these are not Exodus words, check which wallet they came from.`);
    }
    const from = startHeight(start, NETWORK);
    if ("error" in from) return setError(from.error);
    setBusy(true);
    try {
      // An Exodus phrase becomes the standard 25-word seed of the same wallet, so it works everywhere from here on.
      const words = count === 12 ? await exodusToMoneroSeed(seed, NETWORK) : normalizeSeed(seed);
      const { primaryAddress, privateViewKey } = await inspectSeed(words, NETWORK);
      // Exodus added Monero on 26 April 2019, so without a date there is no need to scan earlier blocks.
      const height = from.height || (count === 12 && start.by === "date" ? heightFromDate(EXODUS_MONERO_START) : 0);
      onReady({ kind: "full", network: NETWORK, primaryAddress, privateViewKey, seed: words, restoreHeight: height, origin: "restore" });
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
      <h2 tabIndex={-1}>Restore from recovery words</h2>
      <div className="notice notice-info" style={{ marginBottom: "var(--s-5)" }}>
        <span>Your seed is checked and encrypted in this browser. It is never uploaded.</span>
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
        <label htmlFor="seed">Your recovery words (25, 13 from MyMonero, or 12 from Exodus)</label>
        <textarea id="seed" className="textarea mono" autoComplete="off" autoCapitalize="none" spellCheck={false} value={seed}
          onChange={(e) => { setSeed(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "seed-hint seed-err" : "seed-hint"} />
        <span id="seed-hint" className="hint">
          {count === 13 ? "13 words: a MyMonero phrase. After restoring, check the address matches your old MyMonero address."
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
      <RestoreStartField value={start} onChange={setStart} network={NETWORK} idPrefix="restore" />
      {error ? <p id="seed-err" className="error small" role="alert">{error}</p> : null}
      <p className="small muted">Not sure what kind of phrase you have? The <a href={siteHref("/tools/monero-seed-doctor")}>seed doctor</a> tells you, without asking for your words.</p>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
    </form>
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

function ViewOnly({ onReady, draft, setDraft }: { onReady: (b: Omit<OnboardingResult, "password" | "totp">) => void; draft: WatchDraft; setDraft: (d: WatchDraft) => void }) {
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
    const from = startHeight(start, NETWORK);
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
    onReady({ kind: "view-only", network: NETWORK, primaryAddress: address.trim(), privateViewKey: viewKey.trim().toLowerCase(), restoreHeight: from.height, origin: "watch" });
  }

  return (
    <form onSubmit={submit}>
      <h2 tabIndex={-1}>Add a view-only wallet</h2>
      <p className="muted">
        A view-only wallet shows incoming payments but cannot send. Find both values in your current wallet: in Monero GUI
        under Settings, Seed &amp; keys; in Feather under Wallet, Keys.
      </p>
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
      <RestoreStartField value={start} onChange={setStart} network={NETWORK} idPrefix="watch" />
      {error ? <p id="vo-err" className="error small" role="alert">{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
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
