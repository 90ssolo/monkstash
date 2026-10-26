/**
 * Payment proofs as plain text people can paste into a chat or email:
 *
 *   Monero payment proof
 *   Transaction: <64 hex>
 *   Address: <recipient address>
 *   Transaction key: <64 hex, or longer with extra keys>   (optional)
 *   Signed proof: OutProofV2...                              (optional)
 *   Message: <text the proof was signed with>                (optional)
 *
 * MonkStash makes signed proofs only (wallet2's get_tx_proof, which can also carry a message
 * such as an order number). It never hands out the transaction key: together with the
 * sender's main address, a tx key lets anyone decode the sender's change output, revealing who
 * sent the payment and how much came back (monero-project/monero#11586). Proofs from other
 * wallets that carry a tx key can still be checked. Neither kind can be used to spend.
 * Checking needs a node, so it happens in the wallet engine; this module only formats and
 * parses, so a bad paste gets a clear message before any network request.
 */
import { addressPublicViewKey } from "./address";
import { addressNetwork } from "./request";

export interface PaymentProof {
  txHash: string;
  address: string;
  txKey?: string;
  signature?: string;
  message?: string;
}

export class ProofError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProofError";
  }
}

export const PROOF_MESSAGE_MAX = 200;
const HASH = /^[0-9a-f]{64}$/;
/** A transaction key: 64 hex, plus 64 hex per additional key when the transaction has subaddress outputs. */
const TX_KEY = /^(?:[0-9a-f]{64})+$/;
/** wallet2 proofs: OutProofV2 (sender) or InProofV2 (recipient), then base58 data. */
const SIGNATURE = /^(?:Out|In)ProofV[12][1-9A-HJ-NP-Za-km-z]+$/;

export function formatPaymentProof(p: PaymentProof): string {
  const lines = ["Monero payment proof", `Transaction: ${p.txHash}`, `Address: ${p.address}`];
  if (p.txKey) lines.push(`Transaction key: ${p.txKey}`);
  if (p.signature) lines.push(`Signed proof: ${p.signature}`);
  if (p.message) lines.push(`Message: ${p.message}`);
  return lines.join("\n");
}

/** Validates the fields of a proof (from a paste or from separate inputs). */
export function checkPaymentProof(p: PaymentProof): PaymentProof {
  const txHash = p.txHash.trim().toLowerCase();
  if (!HASH.test(txHash)) throw new ProofError("The transaction ID should be 64 letters and numbers (0-9, a-f).");
  const address = p.address.trim();
  if (!addressNetwork(address)) throw new ProofError("The address is not a valid Monero address.");
  const txKey = p.txKey?.trim().toLowerCase() || undefined;
  if (txKey && !TX_KEY.test(txKey)) throw new ProofError("The transaction key should be 64 letters and numbers (0-9, a-f), or a multiple of that.");
  const signature = p.signature?.trim() || undefined;
  if (signature && !SIGNATURE.test(signature)) throw new ProofError("The signed proof should start with OutProofV2 or InProofV2.");
  if (!txKey && !signature) throw new ProofError("Add the transaction key or the signed proof.");
  const message = p.message ?? undefined;
  if (message && message.length > PROOF_MESSAGE_MAX) throw new ProofError(`The message is longer than ${PROOF_MESSAGE_MAX} characters.`);
  return { txHash, address, ...(txKey ? { txKey } : {}), ...(signature ? { signature } : {}), ...(message ? { message } : {}) };
}

/** Reads a pasted proof. Labels are matched loosely; unknown lines are ignored. */
export function parsePaymentProof(text: string): PaymentProof {
  const fields: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z][A-Za-z ]{1,30}?)\s*:\s*(.*?)\s*$/.exec(raw);
    if (!m) continue;
    const key = m[1]!.toLowerCase().replace(/\s+/g, " ");
    if (!(key in fields)) fields[key] = m[2]!;
  }
  const pick = (...names: string[]) => names.map((n) => fields[n]).find((v) => v !== undefined);
  const proof: PaymentProof = {
    txHash: pick("transaction", "transaction id", "tx id", "txid", "tx hash") ?? "",
    address: pick("address", "recipient", "to") ?? "",
    txKey: pick("transaction key", "tx key", "txkey"),
    signature: pick("signed proof", "proof", "signature"),
    message: pick("message"),
  };
  if (!proof.txHash && !proof.address) throw new ProofError("This does not look like a payment proof. Paste the whole text, or fill in the fields.");
  return checkPaymentProof(proof);
}

/**
 * Refuses a payment proof for an address that carries this wallet's own view key (with any
 * spend key). Such a crafted address would let whoever holds the proof decode the sender's
 * change output (monero-project/monero#11586). Throws a ProofError the screen can show.
 */
export function assertSafeProofAddress(target: string, ownPrimaryAddress: string): void {
  const theirs = addressPublicViewKey(target.trim());
  if (theirs && theirs === addressPublicViewKey(ownPrimaryAddress.trim())) {
    throw new ProofError("This address reuses your own wallet's view key, so a proof for it could reveal your change. No proof was made. Ask the recipient for their real address.");
  }
}

/**
 * Proof of funds (wallet2's reserve proof): shows that the wallet behind `address` holds at least
 * `amount` (or everything it has), without moving anything. It names the coins it covers (their
 * key images), so spending them later can be linked to the proof: prove only what is needed.
 */
export interface FundsProof {
  address: string;
  /** Atomic units the proof was made for; absent means the whole wallet. */
  amount?: bigint;
  signature: string;
  message?: string;
}

const RESERVE = /^ReserveProofV[12][1-9A-HJ-NP-Za-km-z]+$/;

export function formatFundsProof(p: FundsProof, formatAmount: (a: bigint) => string): string {
  const lines = ["Monero proof of funds", `Address: ${p.address}`];
  lines.push(p.amount !== undefined ? `At least: ${formatAmount(p.amount)} XMR` : "Covers: the whole wallet");
  if (p.message) lines.push(`Message: ${p.message}`);
  lines.push(`Signed proof: ${p.signature}`);
  return lines.join("\n");
}

/** Reads a pasted proof of funds; the amount line is informational (the check reports the real total). */
export function parseFundsProof(text: string): FundsProof {
  const fields: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z][A-Za-z ]{1,30}?)\s*:\s*(.*?)\s*$/.exec(raw);
    if (m) fields[m[1]!.toLowerCase()] = m[2]!;
  }
  const address = (fields["address"] ?? "").trim();
  if (!addressNetwork(address)) throw new ProofError("The proof needs the wallet's address.");
  const signature = (fields["signed proof"] ?? fields["signature"] ?? "").trim();
  if (!RESERVE.test(signature)) throw new ProofError("The signed proof should start with ReserveProofV2.");
  const message = fields["message"];
  if (message && message.length > PROOF_MESSAGE_MAX) throw new ProofError(`The message is longer than ${PROOF_MESSAGE_MAX} characters.`);
  return { address, signature, ...(message ? { message } : {}) };
}
