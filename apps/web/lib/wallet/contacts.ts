"use client";
/**
 * Contacts are private (who you pay), so they are stored sealed with the wallet's own secret,
 * like payment requests: readable only while the wallet is unlocked, never sent anywhere.
 */
import type { Contact } from "@quietmint/wallet-core";

export interface ContactStore {
  load(): Promise<Contact[]>;
  save(list: Contact[]): Promise<void>;
}
