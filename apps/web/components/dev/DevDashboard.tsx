"use client";
/**
 * Dev-only monitoring dashboard. Opens each test wallet view-only (address + private view key),
 * syncs it against the stagenet node, and shows balance and recent transactions in one place.
 * View-only: it can watch funds but never spend. Not available in production.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatXmr, shortAddress } from "@quietmint/wallet-core";
import { openWallet, type TxSummary } from "@/lib/wallet/engine";
import { fetchTestWallets, type TestWallet } from "@/lib/wallet/testWallets";
import { clearDemoSession, getDemoSession, setDemoSession, type DemoSession, type TestMode } from "@/lib/wallet/demo";
import { removeWallet } from "@/lib/wallet/storage";
import { EXPLORER_TX } from "@/lib/wallet/config";
import { BrandMark } from "@/components/BrandMark";
import { CopyButton } from "@/components/wallet/CopyButton";
import styles from "./dev.module.css";
import { walletUrl } from "@/lib/site";

interface Row {
  w: TestWallet;
  status: "queued" | "syncing" | "ready" | "error";
  detail?: string;
  total?: bigint;
  unlocked?: bigint;
  txs?: TxSummary[];
}

export function DevDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [demoSession, setDemoSessionState] = useState<DemoSession | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => setDemoSessionState(getDemoSession()), []);

  function setMode(mode: TestMode) {
    const next: DemoSession = { assignedLabel: demoSession?.assignedLabel ?? "", mode };
    setDemoSession(next);
    setDemoSessionState(next);
    setResetMsg(`Mode set to ${mode}. It applies next time you open or unlock the wallet.`);
  }

  function resetDemo() {
    removeWallet();
    clearDemoSession();
    setDemoSessionState(null);
    setResetMsg("Demo state cleared. The wallet will start fresh at onboarding.");
  }

  const refresh = useCallback(async (wallets: TestWallet[]) => {
    setRunning(true);
    // Sequential: opening several WASM wallets at once is memory heavy, and stagenet syncs fast.
    for (let i = 0; i < wallets.length; i++) {
      if (cancelled.current) break;
      const w = wallets[i]!;
      setRows((r) => r.map((x) => (x.w.label === w.label ? { ...x, status: "syncing", detail: "connecting" } : x)));
      try {
        const wallet = await openWallet({
          kind: "view-only", network: "stagenet", restoreHeight: w.restoreHeight,
          primaryAddress: w.primaryAddress, privateViewKey: w.privateViewKey,
        });
        await wallet.sync((s) => {
          if (!s.done) setRows((r) => r.map((x) => (x.w.label === w.label ? { ...x, detail: `scanning ${Math.round(s.percent * 100)}%` } : x)));
        });
        const bal = await wallet.balances();
        const txs = (await wallet.txs()).slice(0, 5);
        await wallet.close();
        setRows((r) => r.map((x) => (x.w.label === w.label ? { ...x, status: "ready", total: bal.total, unlocked: bal.unlocked, txs } : x)));
      } catch (e) {
        setRows((r) => r.map((x) => (x.w.label === w.label ? { ...x, status: "error", detail: (e as Error).message } : x)));
      }
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    cancelled.current = false;
    void fetchTestWallets().then((f) => {
      const wallets = f?.wallets ?? [];
      setRows(wallets.map((w) => ({ w, status: "queued" })));
      if (wallets.length) void refresh(wallets);
    });
    return () => { cancelled.current = true; };
  }, [refresh]);

  const totalAll = rows.reduce((sum, r) => sum + (r.total ?? 0n), 0n);

  return (
    <div className={styles.board}>
      <header className={styles.appBar ?? ""} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-5)" }}>
        <Link href={walletUrl} className="brand"><BrandMark /><span>MonkStash</span></Link>
        <span className={styles.badge}>DEV stagenet</span>
      </header>

      <div className={styles.boardHead}>
        <div>
          <h1 style={{ fontSize: "var(--step-2)", margin: 0 }}>Test wallet monitor</h1>
          <p className="small muted" style={{ margin: "var(--s-1) 0 0" }}>
            View-only. Combined balance: <strong>{formatXmr(totalAll, 6)} XMR</strong> across {rows.length} wallet(s).
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--s-2)" }}>
          <a className="btn btn-secondary btn-sm" href="https://community.rino.io/faucet/stagenet/" target="_blank" rel="noopener">Stagenet faucet ↗</a>
          <button className="btn btn-primary btn-sm" disabled={running} onClick={() => refresh(rows.map((r) => r.w))}>
            {running ? "Syncing…" : "Refresh all"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "var(--s-4)", padding: "var(--s-4) var(--s-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s-4)", flexWrap: "wrap" }}>
          <div className="small">
            <strong>Demo session:</strong>{" "}
            {demoSession?.assignedLabel ? (
              <>assigned <strong>{demoSession.assignedLabel}</strong>, preferred mode <strong>{demoSession.mode}</strong></>
            ) : (
              <span className="muted">none yet (create a wallet in the app to assign one)</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setMode("stagenet")}>Mode: stagenet</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setMode("simulation")}>Mode: simulation</button>
            <button className="btn btn-danger btn-sm" onClick={resetDemo}>Reset demo state</button>
          </div>
        </div>
        {resetMsg ? <p className="small muted" style={{ margin: "var(--s-3) 0 0" }} role="status">{resetMsg}</p> : null}
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0 }}>No test wallets found.</p>
          <p className="small muted">
            Run <code>node scripts/gen-test-wallets.mjs</code> in <code>apps/web</code>, or add your own stagenet seeds to
            <code> test-wallets.local.json</code>, then reload.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {rows.map((r) => (
            <div key={r.w.label} className={styles.wcard}>
              <div className={styles.wtop}>
                <div>
                  <strong>{r.w.label}</strong>
                  <p className={styles.status} style={{ margin: "2px 0 0" }}>
                    <span className={`${styles.dot} ${r.status === "ready" ? styles.dotOk : r.status === "error" ? styles.dotErr : styles.dotSync}`} />
                    {r.status === "ready" ? "synced" : r.status === "error" ? `error: ${r.detail}` : r.status === "syncing" ? r.detail ?? "syncing" : "queued"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={styles.wbal}>{r.total !== undefined ? formatXmr(r.total, 6) : "…"} <span>XMR</span></div>
                  {r.unlocked !== undefined && r.unlocked !== r.total ? (
                    <div className="small muted">{formatXmr(r.unlocked, 6)} spendable</div>
                  ) : null}
                </div>
              </div>
              <p className={`mono ${styles.waddr}`}>{r.w.primaryAddress}</p>
              <div style={{ display: "flex", gap: "var(--s-2)" }}>
                <CopyButton value={r.w.primaryAddress} label="Copy address" className="btn btn-secondary btn-sm" />
              </div>
              {r.txs && r.txs.length ? (
                <ul className={styles.txmini}>
                  {r.txs.map((t) => (
                    <li key={t.hash}>
                      <a href={EXPLORER_TX.stagenet(t.hash)} target="_blank" rel="noopener">
                        {t.direction === "in" ? "received" : "sent"} {shortAddress(t.hash, 6)} ↗
                      </a>
                      <span>{t.direction === "in" ? "+" : "−"}{formatXmr(t.amount, 6)}{t.pending ? " (pending)" : ""}</span>
                    </li>
                  ))}
                </ul>
              ) : r.status === "ready" ? (
                <p className="small muted" style={{ marginTop: "var(--s-3)" }}>No transactions yet. Send stagenet XMR here to test.</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
