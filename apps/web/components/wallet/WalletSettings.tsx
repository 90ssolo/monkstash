"use client";
/**
 * Wallet settings that touch secrets: showing the recovery words, and choosing the node.
 * Both ask for the wallet password again (and the authenticator code when 2FA is on), even
 * though the wallet is unlocked, so someone at an unattended screen cannot use them.
 */
import { useEffect, useState } from "react";
import { MoveFileError, normalizeNodeUri, NodeUriError, readMoveHeader, type MoveHeader, type NetworkType, type NodeConfig, type TotpConfig, type WalletKind } from "@quietmint/wallet-core";
import styles from "./wallet.module.css";
import { EMPTY_START, RestoreStartField, startHeight, type RestoreStart } from "./RestoreStart";
import { walletAbsoluteUrl, siteHref } from "@/lib/site";

export interface SettingsActions {
  kind: WalletKind;
  network: NetworkType;
  totpEnabled: boolean;
  /** Origin of the user's own node, or null for the MonkStash relay. */
  node: string | null;
  /** Throws an Error with a user-facing message. */
  revealSeed(password: string, code: string): Promise<string>;
  /** Tests the node first (when given), saves it in the encrypted vault and reopens the wallet. */
  saveNode(node: NodeConfig | null, password: string, code: string): Promise<void>;
  /** Re-checks the password (and 2FA code), e.g. before leaving cashier mode. */
  checkAccess(password: string, code: string): Promise<void>;
  /**
   * Checks the password (and 2FA code) and approves these signed transactions for broadcast within
   * two minutes. The wallet refuses to send anything that was not approved this way.
   */
  approveSend(password: string, code: string, metadata: string[]): Promise<void>;
  /** Re-encrypts the wallet with a new password. */
  changePassword(password: string, code: string, newPassword: string): Promise<void>;
  /** A fresh authenticator secret to show as a QR code. Nothing is saved until enableTotp. */
  newTotp(): { config: TotpConfig; uri: string };
  /** Saves the authenticator once the user proves it works with a current code. */
  enableTotp(config: TotpConfig, newCode: string, password: string): Promise<void>;
  disableTotp(password: string, code: string): Promise<void>;
  /** What a watch-only copy needs (address, private view key, restore height). */
  watchOnlyKeys(password: string, code: string): Promise<{ address: string; viewKey: string; restoreHeight: number }>;
  /** Block height the wallet scans from. */
  restoreHeight: number;
  /** Re-opens the wallet scanning from an earlier height (keeps contacts, requests and sales). */
  rescanFrom(height: number, password: string, code: string): Promise<void>;
  /** A move file of this wallet (scan progress and records) for another device. */
  exportMove(password: string, code: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; filename: string; height: number }>;
  /**
   * Loads a move file made on another device for this same wallet. Records are merged; the scan
   * progress is used when it is further along than this device's, and the wallet then reopens.
   */
  importMove(file: Uint8Array, password: string, code: string): Promise<{ height: number; scanReplaced: boolean; added: string[] }>;
  /**
   * Set where files cannot be saved or picked here (the extension's popup and side panel close
   * when a file dialog opens): move files then offer to open the full view instead.
   */
  openFullView?: () => void;
}

const REVEAL_SECONDS = 60;

export function Credentials({ totp, pw, setPw, code, setCode, idPrefix }: { totp: boolean; pw: string; setPw: (v: string) => void; code: string; setCode: (v: string) => void; idPrefix: string }) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-pw`}>Wallet password</label>
        <input id={`${idPrefix}-pw`} className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      </div>
      {totp ? (
        <div className="field">
          <label htmlFor={`${idPrefix}-code`}>Authenticator code</label>
          <input id={`${idPrefix}-code`} className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
        </div>
      ) : null}
    </>
  );
}

export function RevealWords({ actions }: { actions: SettingsActions }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [words, setWords] = useState<string[] | null>(null);
  const [left, setLeft] = useState(REVEAL_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Hide automatically, and never keep the words after this panel goes away.
  useEffect(() => {
    if (!words) return;
    setLeft(REVEAL_SECONDS);
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { setWords(null); return REVEAL_SECONDS; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [words]);
  useEffect(() => () => setWords(null), []);

  if (actions.kind === "view-only") {
    return <p className="small muted">This is a watch-only wallet, so it has no recovery words. Its keys can only watch, never spend.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const seed = await actions.revealSeed(pw, code);
      setWords(seed.split(" "));
      setPw("");
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (words) {
    return (
      <div className={styles.revealPanel}>
        <div className="notice notice-warn" role="alert">
          <span><strong>Anyone who sees these words can take your money.</strong> Check that nobody is watching and that your screen is not being shared or recorded.</span>
        </div>
        <ol className={styles.wordGrid} aria-label={`Your ${words.length} recovery words`} translate="no">
          {words.map((w, i) => <li key={i}><span className={styles.wordNum}>{i + 1}</span><span className="mono">{w}</span></li>)}
        </ol>
        <p className="small muted">Write them on paper, in order. Hiding in {left} seconds.</p>
        <button type="button" className="btn btn-secondary btn-block" onClick={() => setWords(null)}>Hide words now</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <p className="small muted">
        Your recovery words are the only backup of this wallet. To show them, confirm it is you. They hide again after{" "}
        {REVEAL_SECONDS} seconds.
      </p>
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="reveal" />
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? "Checking…" : "Show recovery words"}</button>
    </form>
  );
}

export function NodeSettings({ actions }: { actions: SettingsActions }) {
  // The extension asks for access to the node in a browser prompt, which would close its popup.
  if (actions.openFullView) {
    return (
      <div className={styles.settingsForm}>
        <p className="small">
          <strong>Now using:</strong>{" "}
          {actions.node ? <>your own node, <span className="mono">{actions.node.replace(/^https?:\/\//, "")}</span></> : <>the MonkStash relay</>}
        </p>
        <FilesInFullView open={actions.openFullView} what="change the node" note="Your browser asks for access to the node, and that prompt would close this small window." />
      </div>
    );
  }
  return <NodeSettingsForm actions={actions} />;
}

function NodeSettingsForm({ actions }: { actions: SettingsActions }) {
  const [uri, setUri] = useState("");
  const [user, setUser] = useState("");
  const [nodePw, setNodePw] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const origin = typeof window === "undefined" ? walletAbsoluteUrl.replace(/\/(wallet)?$/, "") : window.location.origin;

  async function save(e: React.FormEvent, reset: boolean) {
    e.preventDefault();
    setError(null);
    let cfg: NodeConfig | null = null;
    if (!reset) {
      try {
        cfg = { uri: normalizeNodeUri(uri), ...(user ? { username: user } : {}), ...(nodePw ? { password: nodePw } : {}) };
      } catch (err) {
        return setError(err instanceof NodeUriError ? err.message : "That address is not valid.");
      }
    }
    setBusy(true);
    setStatus(reset ? "Switching back…" : "Testing the connection from this browser…");
    try {
      await actions.saveNode(cfg, pw, code);
      // On success the wallet reopens, which replaces this screen.
    } catch (err) {
      setError((err as Error).message);
      setStatus(null);
      setBusy(false);
    }
  }

  return (
    <div className={styles.settingsForm}>
      <p className="small">
        <strong>Now using:</strong>{" "}
        {actions.node ? <>your own node, <span className="mono">{actions.node.replace(/^https?:\/\//, "")}</span></> : <>the MonkStash relay</>}
      </p>
      <p className="small muted">
        {actions.node
          ? "Your browser talks to your node directly. MonkStash's servers are not involved in finding your payments."
          : "By default your wallet reaches the network through our relay, which can see your IP address and the requests, never your keys. With your own node, no one else is in the loop."}
      </p>

      <form onSubmit={(e) => save(e, false)} className={styles.settingsForm}>
        <div className="field">
          <label htmlFor="node-uri">{actions.node ? "Use a different node" : "Your node's address"}</label>
          <input id="node-uri" className="input mono" inputMode="url" autoComplete="off" spellCheck={false} placeholder="https://node.example.com:18089" value={uri} onChange={(e) => setUri(e.target.value)} required />
        </div>
        <details className={styles.inlineDetails}>
          <summary>Node login (only if you set --rpc-login)</summary>
          <div className="field">
            <label htmlFor="node-user">Username</label>
            <input id="node-user" className="input" autoComplete="off" value={user} onChange={(e) => setUser(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="node-pass">Password</label>
            <input id="node-pass" className="input" type="password" autoComplete="off" value={nodePw} onChange={(e) => setNodePw(e.target.value)} />
          </div>
        </details>
        <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="node" />
        {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
        {status && !error ? <p className="small muted" aria-live="polite">{status}</p> : null}
        <button className="btn btn-primary btn-block" disabled={busy || !uri || !pw}>{busy ? "Working…" : "Test and use this node"}</button>
      </form>

      {actions.node ? (
        <form onSubmit={(e) => save(e, true)}>
          <button className="btn btn-secondary btn-block" disabled={busy || !pw} title={!pw ? "Enter your wallet password above first" : undefined}>Switch back to the MonkStash relay</button>
        </form>
      ) : null}

      <details className={styles.inlineDetails}>
        <summary>How to set up your node for this</summary>
        <p className="small" style={{ margin: "0 0 var(--s-2)" }}>
          Easiest: <a href={siteHref("/server")} target="_blank" rel="noopener">MonkStash Server</a> sets up a node on a Linux server in one command, ready for this wallet. By hand:
        </p>
        <ol className="small">
          <li>Run <span className="mono">monerod</span> on {actions.network} with restricted RPC, for example <span className="mono">--restricted-rpc --rpc-bind-port 18089</span>.</li>
          <li>Allow this site to connect from a browser: <span className="mono">--rpc-access-control-origins {origin}</span></li>
          <li>Serve it over HTTPS with a certificate your browser trusts (for example behind a reverse proxy). A node on this same computer can use plain <span className="mono">http://127.0.0.1</span>; some browsers ask your permission first.</li>
          <li>Optional: require a login with <span className="mono">--rpc-login user:password</span> and enter it above.</li>
        </ol>
        <p className="small muted">The address and login are saved inside your encrypted wallet on this device only. Full walkthrough: <a href={siteHref("/run-a-monero-node")}>how to run a Monero node</a>.</p>
      </details>
    </div>
  );
}

/** For a restore date that was too late: payments before it are never found until the scan starts earlier. */
export function RescanFrom({ actions }: { actions: SettingsActions }) {
  const [start, setStart] = useState<RestoreStart>(EMPTY_START);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const from = startHeight(start, actions.network);
    if ("error" in from) return setError(from.error);
    if (start.by === "date" && !start.date) return setError("Choose a month, or switch to a block height.");
    if (from.height >= actions.restoreHeight) {
      return setError(`Choose a date or height earlier than where the wallet starts now (block ${actions.restoreHeight.toLocaleString()}).`);
    }
    setBusy(true);
    try {
      await actions.rescanFrom(from.height, pw, code);
      // On success the wallet reopens and scans again, which replaces this screen.
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <p className="small muted">
        Missing a payment you know arrived? If it came before block {actions.restoreHeight.toLocaleString()}, where this wallet starts
        looking, it cannot be found. Pick an earlier start and the wallet scans again from there. Your contacts, payment requests and
        sales stay as they are.
      </p>
      <RestoreStartField value={start} onChange={setStart} network={actions.network} idPrefix="rescan" dateLabel="Start looking from (pick a month you know is earlier)" />
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="rescan" />
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? "Starting the scan…" : "Scan again from here"}</button>
    </form>
  );
}

/** Saves a move file, so another device restored with the same wallet can skip the long first scan. */
export function SaveMoveFile({ actions }: { actions: SettingsActions }) {
  if (actions.openFullView) return <FilesInFullView open={actions.openFullView} what="save a move file" />;
  return <SaveMoveFileForm actions={actions} />;
}

/** Popup and side panel: file dialogs close them, so files are handled in a full tab. */
function FilesInFullView({ open, what, note = "A file dialog would close this small window." }: { open: () => void; what: string; note?: string }) {
  return (
    <div className={styles.settingsForm}>
      <p className="small muted">To {what}, open MonkStash in a tab. {note}</p>
      <button type="button" className="btn btn-secondary btn-block" onClick={open}>Open in a tab</button>
    </div>
  );
}

function SaveMoveFileForm({ actions }: { actions: SettingsActions }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lockedWith = actions.kind === "full" ? "your recovery words" : "this wallet's view key";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      const { bytes, filename, height } = await actions.exportMove(pw, code);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDone(`Saved ${filename} (${(bytes.length / 1_000_000).toFixed(1)} MB, scanned to block ${height.toLocaleString()}).`);
      setPw("");
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <p className="small muted">
        Using this wallet on another computer or browser? Restore it there, then load this file, and it skips the long first scan.
        The file carries how far this wallet has scanned, plus your contacts, payment requests and sales.
      </p>
      <p className="small muted">
        It is locked with {lockedWith} and opens only in this same wallet. Keep it private anyway, like any backup.
      </p>
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="move-out" />
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      {done ? <p className="small" role="status">{done}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? "Preparing…" : "Save move file"}</button>
    </form>
  );
}

/** Loads a move file made on another device for this same wallet. */
export function LoadMoveFile({ actions }: { actions: SettingsActions }) {
  if (actions.openFullView) return <FilesInFullView open={actions.openFullView} what="load a move file" />;
  return <LoadMoveFileForm actions={actions} />;
}

function LoadMoveFileForm({ actions }: { actions: SettingsActions }) {
  const [file, setFile] = useState<Uint8Array | null>(null);
  const [info, setInfo] = useState<MoveHeader | null>(null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(null);
    setFile(null);
    setInfo(null);
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      setInfo(readMoveHeader(bytes));
      setFile(bytes);
    } catch (err) {
      setError(err instanceof MoveFileError ? err.message : "That file could not be read.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const r = await actions.importMove(file, pw, code);
      // When the scan progress was used, the wallet reopens and this screen is replaced.
      const extra = r.added.length ? ` Added ${r.added.join(", ")}.` : "";
      setDone(r.scanReplaced
        ? `Loaded. The wallet carries on from block ${r.height.toLocaleString()}.${extra}`
        : `This device has already scanned at least as far as the file (block ${r.height.toLocaleString()}), so it keeps its own progress. Address counters were combined.${extra}`);
      setPw("");
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <p className="small muted">
        Made a move file on another device? Load it here to skip the scan. Contacts, requests and sales already on this device are
        kept, and address counters are combined, so no address is ever handed out twice.
      </p>
      <div className="field">
        <label htmlFor="move-in-file">Move file</label>
        <input id="move-in-file" className="input" type="file" accept=".monkstash" onChange={pick} />
      </div>
      {info ? (
        <p className="small" aria-live="polite">
          Saved {new Date(info.savedAt).toLocaleDateString()}, scanned to block {info.height.toLocaleString()}
          {info.network !== actions.network ? `, for ${info.network}` : ""}.
        </p>
      ) : null}
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="move-in" />
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      {done ? <p className="small" role="status">{done}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy || !pw || !file}>{busy ? "Loading…" : "Load and carry on"}</button>
    </form>
  );
}

export function WalletSettings({ actions }: { actions: SettingsActions }) {
  return (
    <div className={`card ${styles.info}`}>
      <h2 className={styles.cardH}>Security and connection</h2>
      <details className={styles.danger}>
        <summary>Show recovery words</summary>
        <RevealWords actions={actions} />
      </details>
      <details className={styles.danger}>
        <summary>Node connection{actions.node ? ": your own node" : ""}</summary>
        <NodeSettings actions={actions} />
      </details>
    </div>
  );
}
