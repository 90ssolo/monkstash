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
 * The transaction key is what most wallets, explorers and Bisq ask for. The signed proof
 * (wallet2's get_tx_proof) can also carry a message, such as an order number. Either one lets
 * anyone with access to the blockchain confirm the payment; neither can be used to spend.
 * Checking needs a node, so it happens in the wallet engine; this module only formats and
 * parses, so a bad paste gets a clear message before any network request.
 */
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
