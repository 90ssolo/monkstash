"use client";
/**
 * The web wallet's page: renders whichever screen the wallet controller (lib/wallet/session.ts)
 * is on. The controller owns the decrypted secrets; this file adds what only a web page needs:
 * the one-tab rule and auto-lock on idle or a hidden tab.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { StoredWallet, WalletPublic } from "@quietmint/wallet-core";
import { warmEngine } from "@/lib/wallet/engine";
import { CODE_EXPIRED, CODE_TOO_MANY, CODE_WAIT_MS, STATE_SAVE_EVERY_MS, WalletController, type SaveProblem, type View } from "@/lib/wallet/session";
import { DEV_TOOLS_ENABLED, NETWORK } from "@/lib/wallet/config";
import { AUTO_LOCK_HIDDEN_MS, AUTO_LOCK_IDLE_MS } from "@/lib/wallet/autolock";
import { fetchTestWallets } from "@/lib/wallet/testWallets";
import { isDemo } from "@/lib/wallet/demo";
import { BrandMark } from "@/components/BrandMark";
import { Dashboard } from "./Dashboard";
import { Loading, Onboarding, Welcome } from "./Onboarding";
import { Stage } from "./Stage";
import { ArtEngine, ArtLock } from "./WalletArt";
import styles from "./wallet.module.css";
import { siteHref } from "@/lib/site";
import { useSingleTab } from "@/lib/wallet/tabLock";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Re-renders on every change of the controller's view or notices. */
function useController(c: WalletController): { view: View; saveProblem: SaveProblem } {
  const view = useSyncExternalStore((fn) => c.subscribe(fn), () => c.view, () => c.view);
  const saveProblem = useSyncExternalStore((fn) => c.subscribe(fn), () => c.saveProblem, () => c.saveProblem);
  return { view, saveProblem };
}

export function WalletApp() {
  const controller = useMemo(() => new WalletController(), []);
  const { view, saveProblem } = useController(controller);
  const tab = useSingleTab();
  const [testWalletCount, setTestWalletCount] = useState(0);
  const [tillShown, setTillShown] = useState(false);

  useEffect(() => {
    controller.start();
    if (DEV_TOOLS_ENABLED) void fetchTestWallets().then((f) => { if (f) { controller.testWallets = f.wallets; setTestWalletCount(f.wallets.length); } });
    return () => controller.dispose();
  }, [controller]);

  // Auto-lock: while the wallet is open, lock it (close the engine, drop secrets from memory)
  // after AUTO_LOCK_IDLE_MS without interaction, or once the tab has been hidden for
  // AUTO_LOCK_HIDDEN_MS. Uses timestamps, not a single long timer, because browsers throttle
  // timers in background tabs; the check also runs the moment the tab becomes visible again.
  const isOpen = view.name === "open";
  useEffect(() => {
    if (!isOpen) return;
    // Elapsed time comes from performance.now(), which a clock change cannot move.
    const clock = () => performance.now();
    let lastActive = clock();
    let hiddenSince: number | null = document.hidden ? clock() : null;
    let locking = false;
    const lockNow = () => {
      if (locking) return;
      locking = true;
      void controller.lock();
    };
    const check = () => {
      // A watch-only wallet in cashier mode stays open all shift: it cannot spend, and a till that
      // locks between customers is unusable. Full wallets keep the normal auto-lock.
      if (controller.cashierOn && controller.view.name === "open" && controller.view.pub.kind === "view-only") return;
      const now = clock();
      // While the first scan runs in a visible tab, waiting is not idleness: locking would stop
      // the scan. Leaving the tab still locks (progress is saved on the way out).
      if (controller.syncBusy && !document.hidden) lastActive = now;
      if (now - lastActive >= AUTO_LOCK_IDLE_MS) lockNow();
      else if (hiddenSince !== null && now - hiddenSince >= AUTO_LOCK_HIDDEN_MS) lockNow();
    };
    const onActivity = () => { lastActive = clock(); };
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSince = clock();
      } else {
        check();
        hiddenSince = null;
        lastActive = clock();
      }
    };
    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(check, 15_000);
    return () => {
      for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [isOpen, controller]);

  // Another tab took over the wallet: close it here at once (its keys leave this tab's memory).
  useEffect(() => {
    if (tab.state === "moved") void controller.lock();
  }, [tab.state, controller]);

  // While open, save sync progress periodically (persistState skips if nothing new was synced).
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setInterval(() => void controller.persistState(), STATE_SAVE_EVERY_MS);
    return () => window.clearInterval(t);
  }, [isOpen, controller]);

  const setCashierOn = (on: boolean) => { controller.cashierOn = on; setTillShown(on); };

  return (
    <div className={styles.shell}>
      <header className={styles.appBar} inert={tillShown || undefined}>
        <Link href={siteHref("/")} className="brand"><BrandMark /><span>MonkStash</span></Link>
        {isDemo ? (
          <span className={styles.demoBadge} title="Local demo on Monero stagenet">DEMO STAGENET</span>
        ) : (
          <span className={styles.appStatus}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            Keys stay on this device
          </span>
        )}
      </header>
      <main id="main" className={view.name === "open" && tab.state === "owner" ? styles.mainWide : styles.main}>
        {tab.state !== "owner" ? (
          tab.state === "checking" ? <Loading text="Loading…" /> : (
            <Stage tone="ink" kicker={tab.state === "moved" ? "Moved" : "Already open"} sizzle={<>One wallet, <mark>one tab</mark>.</>} art={<ArtLock />}>
              <h1 className="visually-hidden">MonkStash wallet</h1>
              <h2>{tab.state === "moved" ? "MonkStash moved to another tab" : "MonkStash is open in another tab"}</h2>
              <p className="muted">
                {tab.state === "moved"
                  ? "The wallet was opened in another tab, so it was locked here. Keeping it in one place stops two tabs from handing out the same address."
                  : "To keep your addresses and records consistent, the wallet runs in one tab at a time. Switch to that tab, or use it here instead (the other tab will lock)."}
              </p>
              <button type="button" className="btn btn-primary" onClick={tab.takeOver}>Use MonkStash here instead</button>
            </Stage>
          )
        ) : null}
        {tab.state !== "owner" ? null : (
          <>
            {view.name === "boot" ? <Loading text="Loading…" /> : null}
            {view.name === "welcome" ? (
              <>
                {isDemo ? <DemoIntro walletCount={testWalletCount} /> : null}
                <Welcome onPick={(mode) => controller.pick(mode)} />
              </>
            ) : null}
            {view.name === "onboard" ? (
              <Onboarding mode={view.mode} testWallets={controller.testWallets} onCancel={() => controller.pick(null)} onDone={controller.onboarded} onSwitchMode={(m) => controller.pick(m)} />
            ) : null}
            {view.name === "locked" ? <Unlock record={view.record} unlock={controller.unlock} submitCode={controller.submitCode} onForget={controller.remove} /> : null}
            {view.name === "otherNetwork" ? <OtherNetwork record={view.record} onRemove={controller.remove} /> : null}
            {view.name === "opening" ? <Opening /> : null}
            {view.name === "open" && saveProblem ? <SaveProblemNotice problem={saveProblem} /> : null}
            {view.name === "open" ? (
              <OpenDashboard view={view} controller={controller} onCashierChange={setCashierOn} />
            ) : null}
            {view.name === "fatal" ? <Fatal message={view.message} /> : null}
          </>
        )}
      </main>
    </div>
  );
}

function OpenDashboard({ view, controller, onCashierChange }: { view: Extract<View, { name: "open" }>; controller: WalletController; onCashierChange: (on: boolean) => void }) {
  const stores = controller.openStores();
  return (
    <Dashboard
      pub={view.pub}
      wallet={view.wallet}
      onLock={controller.lock}
      onRemove={controller.remove}
      onSynced={controller.onSynced}
      settings={controller.settings(view.pub)}
      requests={stores.requests}
      cashier={stores.cashier}
      contacts={stores.contacts}
      onCashierChange={onCashierChange}
      demo={isDemo ? { mode: view.mode, fellBack: view.fellBack, assignedLabel: view.pub.name, onSwitchMode: controller.switchMode } : undefined}
    />
  );
}

export function Opening() {
  return (
    <Stage tone="ink" kicker="Opening" sizzle={<>Waking the wallet <mark>on your device</mark>.</>} art={<ArtEngine />}>
      <Loading text="Starting the wallet engine. The first start downloads about 4 MB." />
    </Stage>
  );
}

export function SaveProblemNotice({ problem }: { problem: Exclude<SaveProblem, null> }) {
  return (
    <div className="notice notice-warn" role="status">
      <span>
        {problem === "full"
          ? "This browser's storage is full, so the wallet cannot save how far it has scanned. It still works, but after you close it the scan starts again. Free some space and it saves again on its own."
          : "This browser is not letting the wallet save how far it has scanned (a private window, or site data is blocked). It still works, but each unlock scans again from the start."}
      </span>
    </div>
  );
}

export function Fatal({ message }: { message: string }) {
  return (
    <div className={`card ${styles.narrow}`} role="alert">
      <h1 className="visually-hidden">MonkStash wallet</h1>
      <h2>Something went wrong</h2>
      <p className="muted">{message}</p>
      <button className="btn btn-secondary" onClick={() => location.reload()}>Reload</button>
    </div>
  );
}

function DemoIntro({ walletCount }: { walletCount: number }) {
  return (
    <div className={`notice notice-warn ${styles.demoIntro}`}>
      <span>
        <strong>Demo mode.</strong> This is a local interface demo on Monero stagenet (free test coins).
        Creating a wallet shows <strong>sample words for testing the screens only</strong>, then assigns one of{" "}
        {walletCount || "your"} configured stagenet test wallets. <Link href="/dev/wallets">Open the admin dashboard</Link> to
        see all test wallets and switch modes.
      </span>
    </div>
  );
}

export function Unlock({ record, unlock, submitCode, onForget, warm = warmEngine }: { record: Pick<StoredWallet, "pub">; unlock: (pw: string) => Promise<"open" | "code">; submitCode: (code: string) => Promise<void>; onForget: () => void; warm?: () => void | Promise<void> }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);

  // Start the wallet engine while the password is typed, so the wallet opens sooner after Unlock.
  useEffect(() => { void warm(); }, [warm]);

  // The decrypted keys wait only so long for the code: say so when they stop waiting.
  useEffect(() => {
    if (!needsCode) return;
    const t = setTimeout(() => { setNeedsCode(false); setCode(""); setError(CODE_EXPIRED); }, CODE_WAIT_MS);
    return () => clearTimeout(t);
  }, [needsCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (needsCode) {
        await submitCode(code);
        setCode("");
        return;
      }
      const next = await unlock(pw);
      setPw("");
      if (next === "code") setNeedsCode(true);
      setBusy(false);
    } catch (err) {
      setBusy(false);
      const msg = (err as Error).message;
      // The keys only wait a short while for the code: then the password is needed again.
      if (msg === CODE_EXPIRED || msg === CODE_TOO_MANY) { setNeedsCode(false); setCode(""); }
      setError(msg);
    }
  }

  return (
    <Stage
      tone="ink"
      kicker="Welcome back"
      sizzle={needsCode ? <>One more lock: the <mark>code from your phone</mark>.</> : <>Your wallet is <mark>locked</mark> on this device.</>}
      art={<ArtLock />}
      steps={record.pub.totpEnabled ? ["Password", "Authenticator code"] : undefined}
      current={needsCode ? 1 : 0}
    >
      <form onSubmit={submit}>
        <h1 className={styles.title}>{needsCode ? "Enter your code" : "Unlock wallet"}</h1>
        <p className="mono small muted" style={{ wordBreak: "break-all" }}>{record.pub.primaryAddress}</p>
        {!needsCode ? (
          <div className="field">
            <label htmlFor="upw">Password</label>
            <input id="upw" className="input" type="password" autoComplete="current-password" autoFocus value={pw}
              onChange={(e) => { setPw(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "unlock-err" : undefined} />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="ucode">6-digit authenticator code</label>
            <input id="ucode" className="input mono" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={7} value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "unlock-err" : undefined} />
          </div>
        )}
        {error ? <p id="unlock-err" className="error small" role="alert">{error}</p> : null}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? (needsCode ? "Checking…" : "Decrypting…") : "Unlock"}</button>
      </form>
      {needsCode ? (
        <details className={styles.danger} style={{ marginTop: "var(--s-5)" }}>
          <summary>Lost your authenticator?</summary>
          <p className="small muted">
            The code cannot be skipped or reset. Bring the wallet back from{" "}
            {record.pub.kind === "view-only" ? "its address and private view key" : "your 25 recovery words"} instead: remove it from
            this browser (under <em>Forgot password?</em> below), restore it, and set up a new code if you want one. Your money stays safe on
            the Monero network.
          </p>
        </details>
      ) : null}
      <details className={styles.danger} style={{ marginTop: "var(--s-5)" }}>
        <summary>Forgot password?</summary>
        <ForgotPassword kind={record.pub.kind} onForget={onForget} />
      </details>
    </Stage>
  );
}

/**
 * Removal from the unlock screen, for a forgotten password. No password check is possible here, so
 * the guard is an explicit typed confirmation that spells out what is lost. The encrypted copy is
 * kept unless the person asks: if the password comes back to them, it is their only way in.
 */
export function OtherNetwork({ record, onRemove }: { record: Pick<StoredWallet, "pub">; onRemove: () => void }) {
  const [text, setText] = useState("");
  const was = record.pub.network;
  const testWallet = was !== "mainnet";
  return (
    <div className={`card ${styles.narrow}`}>
      <h1 className="visually-hidden">MonkStash wallet</h1>
      <h2>{testWallet ? "This is a test wallet" : "This wallet is for the real Monero network"}</h2>
      {testWallet ? (
        <>
          <p className="muted">
            It was made on {was}, Monero&apos;s test network, while MonkStash was being tested. Test wallets only ever hold free
            practice coins, so there is nothing of value in it.
          </p>
          <p className="muted">
            MonkStash now runs on the real Monero network, where a test wallet cannot sync. Remove it from this browser, then create
            a new wallet or restore your real one.
          </p>
        </>
      ) : (
        <p className="muted">
          This copy of MonkStash runs on {NETWORK} for testing, so it cannot open a real wallet. Open your wallet at
          wallet.monkstash.com instead. If you remove it here, you need its recovery words to bring it back.
        </p>
      )}
      <form onSubmit={(e) => { e.preventDefault(); if (text === "REMOVE") onRemove(); }}>
        <div className="field">
          <label htmlFor="othernet-confirm">Type REMOVE to remove this {testWallet ? "test " : ""}wallet from this browser</label>
          <input id="othernet-confirm" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
        </div>
        <button type="submit" className="btn btn-danger btn-sm" disabled={text !== "REMOVE"}>Remove {testWallet ? "test " : ""}wallet</button>
      </form>
    </div>
  );
}

function ForgotPassword({ kind, onForget }: { kind: WalletPublic["kind"]; onForget: () => void }) {
  const [text, setText] = useState("");
  return (
    <form style={{ paddingBottom: "var(--s-4)" }} onSubmit={(e) => { e.preventDefault(); if (text === "REMOVE") onForget(); }}>
      <p className="small muted">
        Your password cannot be reset. You can remove this wallet from the browser and bring it back with{" "}
        {kind === "view-only" ? "its address and private view key" : "your 25 recovery words"}.
      </p>
      <p className="small muted">
        <strong>Without {kind === "view-only" ? "the address and view key" : "your recovery words"}, removing it loses this wallet for good.</strong>{" "}
        If you might still remember the password, keep the wallet: this encrypted copy is the only way to open it with that password later.
      </p>
      <p className="small muted" id="forget-list" style={{ marginBottom: "var(--s-2)" }}>Removing deletes everything this wallet stored in this browser:</p>
      <ul className="small muted" aria-labelledby="forget-list" style={{ marginTop: 0 }}>
        <li>the encrypted wallet copy</li>
        <li>its contacts</li>
        <li>its payment requests</li>
        <li>its till sales</li>
        <li>its sync progress</li>
      </ul>
      <p className="small muted">
        Payment requests and till sales cannot be exported while the wallet is locked. If you need those records, keep the wallet
        until you find the password, then use <em>Export CSV</em> in Activity and Get paid.
      </p>
      <div className="field">
        <label htmlFor="forget-confirm">Type REMOVE to confirm</label>
        <input id="forget-confirm" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
      </div>
      <button type="submit" className="btn btn-danger btn-sm" disabled={text !== "REMOVE"}>Remove wallet from this browser</button>
    </form>
  );
}
