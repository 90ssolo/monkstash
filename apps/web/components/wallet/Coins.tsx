"use client";
/**
 * Coin control: every payment received and not yet spent is a separate coin. Freezing a coin keeps
 * it out of all payments (and out of the balance) until it is unfrozen, for example money you want
 * to keep apart from what you spend day to day. The engine keeps the frozen flag in its own state.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { addressKey, formatXmr, type WalletLabels } from "@quietmint/wallet-core";
import { MAIN_ACCOUNT, type Coin, type LiveWallet } from "@/lib/wallet/engine";
import styles from "./wallet.module.css";

/** How a receive address is named on screen: its label, else its number. */
export function addressName(labels: WalletLabels, index: number): string {
  const label = labels.addr[addressKey(MAIN_ACCOUNT, index)]?.label;
  if (label) return `"${label}"`;
  return index === 0 ? "your main address" : `address #${index}`;
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Group { index: number; coins: Coin[]; total: bigint }

export function Coins({ wallet, labels, hidden, synced, balance, onChanged }: {
  wallet: LiveWallet;
  labels: WalletLabels;
  hidden: boolean;
  synced: boolean;
  /** The wallet's balance: it also counts change from a payment that has no block yet, which has no coin yet. */
  balance: bigint;
  onChanged: () => void;
}) {
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCoins(await wallet.coins!());
    } catch (e) {
      setError((e as Error).message);
    }
  }, [wallet]);
  // Reload after each sync: new payments arrive as new coins, spent ones disappear.
  useEffect(() => { if (synced) void load(); }, [synced, load]);
  useEffect(() => {
    if (!synced) return;
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [synced, load]);

  const groups = useMemo<Group[]>(() => {
    const by = new Map<number, Coin[]>();
    for (const c of coins ?? []) by.set(c.subaddressIndex, [...(by.get(c.subaddressIndex) ?? []), c]);
    return [...by.entries()]
      .sort(([a], [b]) => a - b)
      .map(([index, list]) => ({
        index,
        coins: list.sort((a, b) => (b.height ?? Infinity) - (a.height ?? Infinity)),
        total: list.reduce((s, c) => s + c.amount, 0n),
      }));
  }, [coins]);

  async function toggle(c: Coin) {
    setBusy(c.keyImage);
    setError(null);
    try {
      await wallet.freezeCoin!(c.keyImage, !c.frozen);
      await load();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  const amount = (a: bigint) => (hidden ? "••••" : `${formatXmr(a)} XMR`);
  const sum = (f: (c: Coin) => boolean) => (coins ?? []).filter(f).reduce((s, c) => s + c.amount, 0n);
  const frozen = sum((c) => c.frozen);

  if (!synced || coins === null) {
    return <p className="muted">{error ?? (synced ? "Loading your coins…" : "Your coins appear once the wallet has caught up with the network.")}</p>;
  }

  return (
    <div className={styles.coins}>
      <p className="muted" style={{ marginTop: 0 }}>
        Each payment you receive stays a separate coin until you spend it. <strong>Freeze</strong> a coin to keep it out of every
        payment until you unfreeze it. A frozen coin is still yours: it is just left out of your balance and of Send.
      </p>
      {coins.length ? (
        <dl className={styles.coinTotals}>
          <div><dt>Spendable now</dt><dd>{amount(sum((c) => !c.frozen && !c.locked))}</dd></div>
          {sum((c) => !c.frozen && c.locked) > 0n ? <div><dt>Unlocking</dt><dd>{amount(sum((c) => !c.frozen && c.locked))}</dd></div> : null}
          <div><dt>Frozen</dt><dd>{amount(frozen)}</dd></div>
        </dl>
      ) : (
        <p>{balance > 0n
          ? "Your money is in a payment that is still waiting for its first block. Its coins appear here once a block includes it, usually within a few minutes."
          : "No coins yet. They appear here when a payment arrives."}</p>
      )}
      {error ? <p className="error small" role="alert">{error}</p> : null}
      {groups.map((g) => (
        <section key={g.index} className={styles.coinGroup} aria-labelledby={`coins-${g.index}`}>
          <h3 id={`coins-${g.index}`}>
            <span>{hidden ? (g.index === 0 ? "Main address" : `Address #${g.index}`) : capital(addressName(labels, g.index))}</span>
            <span className="tnum">{amount(g.total)}</span>
          </h3>
          <ul>
            {g.coins.map((c) => (
              <li key={c.keyImage || c.hash} className={c.frozen ? styles.coinFrozen : undefined}>
                <span className={styles.coinMain}>
                  <strong className="tnum">{amount(c.amount)}</strong>
                  <span className="small muted">
                    {c.timestamp ? `Received ${new Date(c.timestamp * 1000).toLocaleDateString()}` : "Waiting for a block"}
                    {c.frozen ? ", frozen" : c.locked ? ", unlocking (needs 10 confirmations)" : ""}
                  </span>
                </span>
                {c.keyImage ? (
                  <button type="button" className={`btn btn-sm ${c.frozen ? "btn-primary" : "btn-secondary"}`} disabled={busy !== null}
                    aria-label={`${c.frozen ? "Unfreeze" : "Freeze"} the ${hidden ? "" : `${formatXmr(c.amount)} XMR `}coin`} onClick={() => void toggle(c)}>
                    {busy === c.keyImage ? "Saving…" : c.frozen ? "Unfreeze" : "Freeze"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length > 1 ? (
        <p className="small muted">
          A payment that spends coins from more than one of your addresses links them together: people who paid those addresses could
          guess they belong to the same wallet. Send warns you before that happens, and freezing coins lets you choose.
        </p>
      ) : null}
    </div>
  );
}
