"use client";
/**
 * Fresh subaddresses for payment requests and cashier sales. A subaddress must never be
 * handed out twice: a second request on a reused address would pick up the first one's
 * payment and show "Paid" without being paid.
 *
 * Three guards: first make sure every index already used in this account exists in the engine
 * (it may have restarted without its saved state and would count from 1 again), then skip any
 * index that is still taken. Underneath, `recordHandedOut` (wired in by the wallet screen) makes
 * every new subaddress start above the highest index ever handed out in that account, including
 * Receive's "New address", which no request list knows about.
 */
import { MAIN_ACCOUNT, type LiveWallet } from "./engine";

export async function freshAddress(wallet: LiveWallet, label: string, used: Iterable<number>, expected?: bigint, account = MAIN_ACCOUNT): Promise<{ address: string; index: number }> {
  const taken = new Set(used);
  // An index that already received money was handed out before (perhaps on another device, or
  // before this wallet was removed and restored): never give it to a new payer.
  for (const e of await wallet.incoming()) {
    if ((e.accountIndex ?? MAIN_ACCOUNT) === account && e.subaddressIndex > 0) taken.add(e.subaddressIndex);
  }
  const highest = Math.max(0, ...taken);
  if (highest > 0) await wallet.ensureSubaddresses(account, highest);
  for (let attempt = 0; attempt <= taken.size + 5; attempt++) {
    const sub = await wallet.newRequestAddress(label, expected, account);
    if (!taken.has(sub.index)) return sub;
    taken.add(sub.index);
  }
  throw new Error("Could not get a fresh address. Lock and reopen the wallet, then try again.");
}

/**
 * Highest subaddress index handed out per account, kept sealed per wallet (see WalletApp). The
 * RESTORED key marks a wallet whose earlier history in other browsers is unknown.
 */
export type HandedOut = Record<string, number>;
export interface HandedOutStore {
  /** null when this wallet has no record yet (restored, or never handed out an address here). */
  load(): Promise<HandedOut | null>;
  save(record: HandedOut): Promise<void>;
}

const RESTORED = "restored";
/**
 * Indexes skipped in each account of a restored wallet, above the highest one known to be used.
 * Addresses handed out before (payment links, till sales) that were never paid leave no trace on
 * the chain, so the wallet cannot see them. Well inside the 200-address lookahead wallets scan.
 */
export const RESTORE_MARGIN = 50;

/**
 * Wraps `wallet.newRequestAddress` so each new subaddress is above the highest index ever handed
 * out in its account, and is recorded before it is returned. A failed read or save throws: an
 * address that was not recorded must not be given to anyone.
 */
export function recordHandedOut(wallet: LiveWallet, store: HandedOutStore): void {
  const create = wallet.newRequestAddress.bind(wallet);
  let queue: Promise<unknown> = Promise.resolve();
  wallet.newRequestAddress = (label, expected, account = MAIN_ACCOUNT) => {
    const run = async () => {
      const record: HandedOut = (await store.load()) ?? { [RESTORED]: 1 };
      let floor = record[String(account)] ?? 0;
      if (record[String(account)] === undefined && record[RESTORED]) {
        // First address in this account since the wallet came to this browser: start above
        // everything that may have been used, and record that floor before anything else.
        const paid = (await wallet.incoming()).filter((e) => (e.accountIndex ?? MAIN_ACCOUNT) === account).map((e) => e.subaddressIndex);
        const known = (await wallet.highestSubaddress?.(account)) ?? 0;
        floor = Math.max(0, known, ...paid) + RESTORE_MARGIN;
        record[String(account)] = floor;
        await store.save(record);
      }
      if (floor > 0) await wallet.ensureSubaddresses(account, floor);
      for (let attempt = 0; attempt < 5; attempt++) {
        const sub = await create(label, expected, account);
        if (sub.index <= floor) continue;
        await store.save({ ...record, [String(account)]: sub.index });
        return sub;
      }
      throw new Error("Could not get a fresh address. Lock and reopen the wallet, then try again.");
    };
    // One at a time, so two quick requests never read the same record.
    const next = queue.then(run, run);
    queue = next.catch(() => {});
    return next;
  };
}
