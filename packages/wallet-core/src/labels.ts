/**
 * Notes on transactions ("rent for March") and labels on receive addresses ("given to Ana").
 * Private bookkeeping, kept on the device sealed with the wallet's secret like contacts, and
 * carried in move files. Nothing here is ever written to the blockchain.
 */

export interface AddressLabel {
  label: string;
  /** The address itself, so it can be listed without asking the wallet engine. */
  address: string;
}

export interface WalletLabels {
  /** Note per transaction hash. */
  tx: Record<string, string>;
  /** Label per receive address, keyed by addressKey(account, index). */
  addr: Record<string, AddressLabel>;
}

export const EMPTY_LABELS: WalletLabels = { tx: {}, addr: {} };

export const LABEL_MAX = 120;

export const addressKey = (account: number, index: number): string => `${account}/${index}`;

/** One line of plain text: control characters removed, spaces collapsed, at most LABEL_MAX characters. */
export function cleanNote(s: string): string {
  // eslint-disable-next-line no-control-regex
  return [...s.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim()].slice(0, LABEL_MAX).join("");
}

/** A copy with the note set; an empty note removes it. */
export function withTxNote(l: WalletLabels, hash: string, note: string): WalletLabels {
  const tx = { ...l.tx };
  const clean = cleanNote(note);
  if (clean) tx[hash] = clean;
  else delete tx[hash];
  return { ...l, tx };
}

/** A copy with the address labelled; an empty label removes it. */
export function withAddressLabel(l: WalletLabels, account: number, index: number, address: string, label: string): WalletLabels {
  const addr = { ...l.addr };
  const clean = cleanNote(label);
  if (clean) addr[addressKey(account, index)] = { label: clean, address };
  else delete addr[addressKey(account, index)];
  return { ...l, addr };
}

/** Accepts only the expected shape (a move file or an old save may hold anything). */
export function readLabels(v: unknown): WalletLabels {
  const out: WalletLabels = { tx: {}, addr: {} };
  const o = v as { tx?: unknown; addr?: unknown } | null;
  if (o && typeof o.tx === "object" && o.tx) {
    for (const [k, n] of Object.entries(o.tx)) if (/^[0-9a-z]{64}$/i.test(k) && typeof n === "string" && cleanNote(n)) out.tx[k] = cleanNote(n);
  }
  if (o && typeof o.addr === "object" && o.addr) {
    for (const [k, a] of Object.entries(o.addr as Record<string, unknown>)) {
      const x = a as Partial<AddressLabel> | null;
      if (/^\d+\/\d+$/.test(k) && typeof x?.label === "string" && typeof x.address === "string" && cleanNote(x.label)) out.addr[k] = { label: cleanNote(x.label), address: x.address };
    }
  }
  return out;
}

/** Labels from another device fill in what this one lacks; nothing here is overwritten. */
export function mergeLabels(here: WalletLabels, moved: WalletLabels): WalletLabels {
  return { tx: { ...moved.tx, ...here.tx }, addr: { ...moved.addr, ...here.addr } };
}

export const labelCount = (l: WalletLabels): number => Object.keys(l.tx).length + Object.keys(l.addr).length;
