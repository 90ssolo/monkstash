/**
 * Smart Paste: what someone copied into the recipient box. People copy addresses broken over
 * lines, `monero:` payment links, MonkStash pay links (https://.../pay#monero:...), names such
 * as donate.getmonero.org, and sometimes a gift link by mistake. This sorts them; the send
 * screen then fills in the address and amount, or explains what was pasted.
 */
import { GIFT_PARAM } from "./gift";
import { openAliasFqdn } from "./openalias";
import { addressNetwork } from "./request";

export type PastedRecipient =
  | { kind: "empty" }
  /** A bare address (whitespace from line breaks removed). */
  | { kind: "address"; address: string }
  /** A payment request: a `monero:` URI or a pay link's fragment, ready for parsePaymentUri. */
  | { kind: "request"; uri: string }
  /** A name such as donate.getmonero.org or donate@getmonero.org (OpenAlias). */
  | { kind: "name"; name: string }
  /** A gift link: something to open and claim, not an address to pay. */
  | { kind: "gift" }
  | { kind: "unknown" };

const GIFT = new RegExp(`[#&]${GIFT_PARAM}=`);

export function readPastedRecipient(text: string): PastedRecipient {
  const t = text.trim();
  if (!t) return { kind: "empty" };
  // An address first: copied from a narrow screen or a PDF it may carry spaces or line breaks.
  const squashed = t.replace(/\s+/g, "");
  if (addressNetwork(squashed)) return { kind: "address", address: squashed };
  if (/^monero:/i.test(t)) return { kind: "request", uri: t };
  if (GIFT.test(t)) return { kind: "gift" };
  if (/^https?:\/\//i.test(t)) {
    let hash = "";
    try {
      hash = new URL(t).hash;
    } catch {
      return { kind: "unknown" };
    }
    let decoded = hash;
    try { decoded = decodeURIComponent(hash); } catch { /* keep it as it is */ }
    return /monero:/i.test(decoded) ? { kind: "request", uri: hash } : { kind: "unknown" };
  }
  if (t.startsWith("#") && /monero:/i.test(t)) return { kind: "request", uri: t };
  if (openAliasFqdn(t)) return { kind: "name", name: t };
  return { kind: "unknown" };
}
