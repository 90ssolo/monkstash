/**
 * Private contacts: names for addresses, kept encrypted on the device (the app stores them).
 * This module holds the pure rules, including the "tamper alarm":
 *
 *  - Lookalike addresses. Address-poisoning and clipboard malware swap in an address that
 *    starts and ends like one you know, because those are the parts people check. A pasted
 *    address that shares the first and last characters of a saved contact's address but is
 *    not that address is flagged loudly. By chance this almost never happens (58^8 to one).
 *  - Changed names. A contact saved by an OpenAlias name that now resolves to a different
 *    address is flagged too.
 *
 * A contact's address legitimately differs between payments when they give you fresh
 * subaddresses, so a merely different address is not an alarm.
 */
import { addressNetwork } from "./request";
import { openAliasFqdn } from "./openalias";
import type { NetworkType } from "./network";

export interface Contact {
  id: string;
  name: string;
  /** The address you pay them at. */
  address: string;
  /** Set when the contact was saved from an OpenAlias name (e.g. donate.getmonero.org). */
  alias?: string;
  note?: string;
  createdAt: string;
  lastPaidAt?: string;
}

export const CONTACT_NAME_MAX = 40;
export const CONTACT_NOTE_MAX = 120;
export const MAX_CONTACTS = 500;
/** How many characters at each end people tend to check, and malware tends to copy. */
export const LOOKALIKE_EDGE = 4;

export class ContactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactError";
  }
}

/** Validates and normalizes a new or edited contact. */
export function checkContact(input: { name: string; address: string; alias?: string; note?: string }, network: NetworkType, existing: Contact[], selfId?: string): { name: string; address: string; alias?: string; note?: string } {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) throw new ContactError("Give the contact a name.");
  if (name.length > CONTACT_NAME_MAX) throw new ContactError(`Keep the name under ${CONTACT_NAME_MAX} characters.`);
  const address = input.address.trim();
  const net = addressNetwork(address);
  if (!net) throw new ContactError("That is not a valid Monero address.");
  if (net !== network) throw new ContactError(`That is a ${net} address, but this wallet is on ${network}.`);
  const alias = input.alias ? openAliasFqdn(input.alias) ?? undefined : undefined;
  const note = input.note?.trim() || undefined;
  if (note && note.length > CONTACT_NOTE_MAX) throw new ContactError(`Keep the note under ${CONTACT_NOTE_MAX} characters.`);
  const others = existing.filter((c) => c.id !== selfId);
  if (others.length >= MAX_CONTACTS) throw new ContactError(`You can keep up to ${MAX_CONTACTS} contacts.`);
  const sameName = others.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (sameName) throw new ContactError(`You already have a contact called ${sameName.name}.`);
  const sameAddress = others.find((c) => c.address === address);
  if (sameAddress) throw new ContactError(`This address is already saved as ${sameAddress.name}.`);
  return { name, address, ...(alias ? { alias } : {}), ...(note ? { note } : {}) };
}

/** The contact saved with exactly this address, if any. */
export function contactForAddress(address: string, contacts: Contact[]): Contact | null {
  const a = address.trim();
  return contacts.find((c) => c.address === a) ?? null;
}

/** The contact saved with this OpenAlias name, if any. */
export function contactForAlias(fqdn: string, contacts: Contact[]): Contact | null {
  return contacts.find((c) => c.alias === fqdn) ?? null;
}

/**
 * A saved contact whose address looks like this one (same first and last characters) but is
 * not the same address: the signature of address poisoning or clipboard swapping.
 */
export function lookalikeContact(address: string, contacts: Contact[]): Contact | null {
  const a = address.trim();
  if (a.length < 2 * LOOKALIKE_EDGE + 2) return null;
  // The first character only says the network and type, so compare after it.
  const head = (s: string) => s.slice(1, 1 + LOOKALIKE_EDGE);
  const tail = (s: string) => s.slice(-LOOKALIKE_EDGE);
  return contacts.find((c) => c.address !== a && head(c.address) === head(a) && tail(c.address) === tail(a)) ?? null;
}

/** For a contact saved by name: true when the name now resolves to a different address. */
export function aliasChanged(contact: Contact, resolvedAddress: string): boolean {
  return !!contact.alias && contact.address !== resolvedAddress.trim();
}

/** Contacts in a stable display order: most recently paid first, then by name. */
export function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => (b.lastPaidAt ?? "").localeCompare(a.lastPaidAt ?? "") || a.name.localeCompare(b.name));
}
