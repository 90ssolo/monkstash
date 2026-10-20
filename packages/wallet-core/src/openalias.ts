/**
 * OpenAlias (openalias.org): human-readable names for Monero addresses, published as DNS TXT
 * records like `oa1:xmr recipient_address=4...; recipient_name=Monero Development;`.
 * These helpers follow the application workflow from the spec: turn "name@domain" into an
 * FQDN, then take the first `oa1:xmr` record. DNSSEC is checked by the caller.
 */
import { addressNetwork } from "./request";

export interface OpenAliasRecord {
  address: string;
  name?: string;
  description?: string;
}

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;

/**
 * The FQDN to look up for what the user typed, or null if it is not an OpenAlias name
 * (for example a Monero address, or text with spaces). "name@domain" becomes "name.domain".
 */
export function openAliasFqdn(input: string): string | null {
  const raw = input.trim().toLowerCase().replace(/\.$/, "");
  if (!raw || /\s/.test(raw) || addressNetwork(input.trim())) return null;
  const fqdn = raw.replace("@", ".");
  if (!fqdn.includes(".") || fqdn.includes("@") || fqdn.length > 253) return null;
  const labels = fqdn.split(".");
  if (labels.some((l) => !LABEL.test(l))) return null;
  // The last label is a TLD: letters only (or punycode).
  if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(labels[labels.length - 1]!)) return null;
  return fqdn;
}

/** Joins a TXT record that arrives as several quoted strings, and removes the quotes. */
function unquote(record: string): string {
  const parts = record.match(/"((?:[^"\\]|\\.)*)"/g);
  return parts ? parts.map((p) => p.slice(1, -1).replace(/\\(.)/g, "$1")).join("") : record;
}

/** The first `oa1:<ticker>` record with a recipient_address, or null. */
export function parseOpenAliasTxt(records: string[], ticker = "xmr"): OpenAliasRecord | null {
  const prefix = `oa1:${ticker}`;
  for (const rec of records) {
    const text = unquote(rec).trim();
    if (!text.toLowerCase().startsWith(prefix + " ") && text.toLowerCase() !== prefix) continue;
    const fields: Record<string, string> = {};
    for (const part of text.slice(prefix.length).split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq).trim().toLowerCase();
      let value = part.slice(eq + 1).trim();
      if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
      if (key && !(key in fields)) fields[key] = value;
    }
    const address = fields["recipient_address"];
    if (!address) continue;
    return {
      address,
      ...(fields["recipient_name"] ? { name: fields["recipient_name"].slice(0, 80) } : {}),
      ...(fields["tx_description"] ? { description: fields["tx_description"].slice(0, 120) } : {}),
    };
  }
  return null;
}
