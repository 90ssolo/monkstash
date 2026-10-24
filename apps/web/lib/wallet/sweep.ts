"use client";
/**
 * Sweep: move everything from another wallet (its recovery words) into the open one. The other
 * wallet is opened in memory on this device, scanned from its start date, and swept to this
 * wallet's main address. Its words are never stored, and it is closed when the sweep ends, is
 * cancelled, or the wallet locks.
 */
import type { LiveWallet, SendSpeed } from "./engine";

export type SweepStatus =
  | { state: "idle" }
  | { state: "opening" }
  | { state: "scanning"; from: string; height: number; startHeight: number; endHeight: number; percent: number }
  | { state: "ready"; from: string; total: bigint; unlocked: bigint }
  | { state: "sent"; from: string; amount: bigint; hashes: string[] }
  | { state: "error"; message: string };

export interface SweepPlan { fee: bigint; amount: bigint; count: number; speed: SendSpeed }

export class SweepRunner {
  private gen = 0;
  private source: LiveWallet | null = null;
  private current: SweepStatus = { state: "idle" };
  private prepared: { metadata: string[]; plan: SweepPlan } | null = null;

  status(): SweepStatus {
    return this.current;
  }

  /**
   * Opens the other wallet with `open` (which checks the words) and scans it in the background.
   * `self` is this wallet's address: sweeping a wallet into itself is refused.
   */
  async start(open: () => Promise<LiveWallet>, self: string): Promise<void> {
    await this.cancel();
    const gen = ++this.gen;
    this.current = { state: "opening" };
    let w: LiveWallet;
    try {
      w = await open();
    } catch (e) {
      if (gen === this.gen) this.current = { state: "error", message: (e as Error).message || "The other wallet could not be opened." };
      throw e;
    }
    if (gen !== this.gen) { await w.close().catch(() => {}); return; }
    if (w.primaryAddress === self) {
      await w.close().catch(() => {});
      this.current = { state: "idle" };
      throw new Error("These are the recovery words of this wallet. Enter the words of the other wallet you want to empty.");
    }
    this.source = w;
    const from = w.primaryAddress;
    this.current = { state: "scanning", from, height: 0, startHeight: 0, endHeight: 0, percent: 0 };
    void (async () => {
      // Public nodes stall now and then; carry on while each attempt gets further (as the main sync does).
      let reached = -1;
      let stuck = 0;
      for (;;) {
        let height = -1;
        try {
          await w.sync((s) => {
            height = s.height;
            if (gen === this.gen) this.current = { state: "scanning", from, height: s.height, startHeight: s.startHeight, endHeight: s.endHeight, percent: s.percent };
          });
          if (gen !== this.gen) return;
          const b = await w.balances();
          if (gen === this.gen) this.current = { state: "ready", from, total: b.total, unlocked: b.unlocked };
          return;
        } catch (e) {
          if (gen !== this.gen) return;
          if (height > reached) { reached = height; stuck = 0; } else stuck++;
          if (stuck >= 3) {
            this.current = { state: "error", message: (e as Error).message || "Could not reach the Monero node." };
            return;
          }
          await new Promise((r) => setTimeout(r, [3_000, 10_000, 20_000][stuck] ?? 20_000));
        }
      }
    })();
  }

  /** Builds (does not send) the transactions moving everything spendable to `to`. */
  async prepare(to: string, speed: SendSpeed): Promise<SweepPlan> {
    const w = this.source;
    if (!w || this.current.state !== "ready") throw new Error("Scan the other wallet first.");
    if (!w.prepareSweepAll) throw new Error("This wallet cannot sweep.");
    const built = await w.prepareSweepAll(to, { speed });
    const plan: SweepPlan = { fee: built.fee, amount: built.amount, count: built.metadata.length, speed };
    this.prepared = { metadata: built.metadata, plan };
    return plan;
  }

  /** Sends what prepare() built. The caller checks the password first. */
  async send(): Promise<string[]> {
    const w = this.source;
    const p = this.prepared;
    if (!w || !p || this.current.state !== "ready") throw new Error("Prepare the sweep first.");
    const from = this.current.from;
    this.prepared = null;
    const hashes: string[] = [];
    try {
      for (const m of p.metadata) hashes.push(await w.relay(m));
    } catch (e) {
      // Some transactions may already be on their way: say so, and let a new scan pick up the rest.
      const msg = (e as Error).message || "The network did not accept the transaction.";
      this.current = hashes.length
        ? { state: "error", message: `${hashes.length} of ${p.metadata.length} transactions were sent (${hashes.join(", ")}). The rest failed: ${msg} Scan the other wallet again to move what is left.` }
        : { state: "error", message: `Nothing was sent: ${msg}` };
      this.source = null;
      await w.close().catch(() => {});
      throw new Error(this.current.message);
    }
    this.current = { state: "sent", from, amount: p.plan.amount, hashes };
    this.source = null;
    await w.close().catch(() => {});
    return hashes;
  }

  /** Stops the scan and forgets the other wallet. */
  async cancel(): Promise<void> {
    this.gen++;
    this.prepared = null;
    const w = this.source;
    this.source = null;
    this.current = { state: "idle" };
    if (w) {
      await w.haltSync?.().catch(() => {});
      await w.close().catch(() => {});
    }
  }
}
