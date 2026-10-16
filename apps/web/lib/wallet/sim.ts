"use client";
/**
 * Simulation mode: a mock wallet with canned balances and transactions, no node required.
 * Used when the user selects simulation, or as a fallback when the stagenet node is
 * unreachable. Clearly labelled in the UI. Nothing here touches the real network.
 */
import { ATOMIC_UNITS } from "@quietmint/wallet-core";
import type { Balances, IncomingEntry, LiveWallet, SyncState, TxSummary } from "./engine";

const xmr = (n: number) => BigInt(Math.round(n * 1e6)) * (ATOMIC_UNITS / 1_000_000n);

function seedTxs(address: string): TxSummary[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    { hash: "sim" + "a".repeat(61), direction: "in", amount: xmr(5), confirmations: 42, timestamp: now - 86400 * 3, pending: false },
    { hash: "sim" + "b".repeat(61), direction: "in", amount: xmr(3.5), confirmations: 18, timestamp: now - 86400, pending: false },
    { hash: "sim" + "c".repeat(61), direction: "out", amount: xmr(1.25), fee: xmr(0.0001), confirmations: 6, timestamp: now - 3600, pending: false },
    { hash: "sim" + "d".repeat(61), direction: "in", amount: xmr(4.75), confirmations: 2, timestamp: now - 600, pending: false },
  ];
}

/** A placeholder subaddress. Base58 has no 0, so digits are mapped to letters it does have. */
function simAddress(index: number): string {
  return `8sim${String(index).replace(/0/g, "o")}${"S".repeat(90)}`.slice(0, 95);
}

export function createSimWallet(address: string): LiveWallet {
  let txs = seedTxs(address);
  let balanceListener: ((b: Balances) => void) | null = null;
  const total = () => txs.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0n) - txs.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount + (t.fee ?? 0n), 0n);
  let subIdx = 0;
  // Simulation only: incoming payments per subaddress. A new payment request is "paid" a few
  // seconds after it is created, in two steps, so the request statuses can be seen working.
  const incoming: IncomingEntry[] = [];
  let lastSend: { address: string; amount: bigint } | null = null;
  const sent = new Map<string, { address: string; amount: bigint; txKey: string; signature: string }>();

  return {
    primaryAddress: address,
    async sync(onProgress: (s: SyncState) => void) {
      for (const p of [0.3, 0.7, 1]) {
        await new Promise((r) => setTimeout(r, 180));
        onProgress({ height: 2_226_000, startHeight: 2_225_000, endHeight: 2_226_000, percent: p, done: p >= 1 });
      }
    },
    async startBackgroundSync() {},
    onBalances(cb) {
      balanceListener = cb;
    },
    async balances() {
      const t = total();
      return { total: t, unlocked: t };
    },
    async txs() {
      return [...txs];
    },
    async newSubaddress() {
      subIdx++;
      return simAddress(subIdx);
    },
    // Simulation pays each new request 5 s later: the expected amount when given, else 0.1 XMR.
    async newRequestAddress(_label?: string, expected?: bigint, account = 0) {
      subIdx++;
      const index = subIdx;
      const hash = "sim" + index.toString().padStart(61, "r");
      setTimeout(() => {
        incoming.push({ accountIndex: account, subaddressIndex: index, amount: expected ?? xmr(0.1), confirmations: 0, pending: true, hash });
        setTimeout(() => {
          const e = incoming.find((x) => x.hash === hash);
          if (e) { e.pending = false; e.confirmations = 3; e.timestamp = Math.floor(Date.now() / 1000); }
        }, 6000);
      }, 5000);
      return { address: simAddress(index), index };
    },
    async ensureSubaddresses(_account: number, index: number) {
      if (subIdx < index) subIdx = index;
    },
    async prepareMove() {
      throw new Error("The simulation has no other accounts.");
    },
    async incoming() {
      return incoming.map((e) => ({ ...e }));
    },
    async prepareSend(address: string, amount: bigint) {
      lastSend = { address: address.trim(), amount };
      return { fee: xmr(0.0001), amount, metadata: "sim-metadata", address: address.trim() };
    },
    async prepareSweep(address: string) {
      const fee = xmr(0.0001);
      const amount = total() - fee;
      if (amount <= 0n) throw new Error("Nothing is spendable yet.");
      lastSend = { address: address.trim(), amount };
      return { fee, amount, metadata: "sim-metadata", address: address.trim() };
    },
    async relay() {
      const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");
      const hash = hex(32);
      const send = lastSend ?? { address: "", amount: xmr(0.5) };
      sent.set(hash, { ...send, txKey: hex(32), signature: `OutProofV2Sim${hash.slice(0, 40).replace(/[0lIO]/g, "x")}` });
      txs = [{ hash, direction: "out", amount: send.amount, fee: xmr(0.0001), confirmations: 0, timestamp: Math.floor(Date.now() / 1000), pending: true, ...(send.address ? { destinations: [{ address: send.address, amount: send.amount }] } : {}) }, ...txs];
      balanceListener?.(await this.balances());
      return hash;
    },
    // Simulated proofs: only payments made in this session check out.
    async proveSent(hash: string) {
      const s = sent.get(hash);
      if (!s) throw new Error("This wallet has no record of that payment.");
      return { txKey: s.txKey, signature: s.signature };
    },
    async checkProof(p: { txHash: string; address: string; txKey?: string; signature?: string }) {
      const s = sent.get(p.txHash);
      const good = !!s && s.address === p.address && (p.txKey ? p.txKey === s.txKey : p.signature === s.signature);
      return { good, received: good ? s!.amount : 0n, confirmations: good ? 3 : 0, inPool: false };
    },
    async close() {},
  };
}
