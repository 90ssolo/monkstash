import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

export interface TestWallet { label: string; seed: string; primaryAddress: string; privateViewKey: string; restoreHeight: number }

const WALLETS_FILE = fileURLToPath(new URL("../../../apps/web/test-wallets.local.json", import.meta.url));

/** Throwaway stagenet wallets (never committed). Empty when the file is missing. */
export function testWallets(): TestWallet[] {
  if (!existsSync(WALLETS_FILE)) return [];
  const raw = JSON.parse(readFileSync(WALLETS_FILE, "utf8"));
  return Array.isArray(raw) ? raw : raw.wallets ?? Object.values(raw);
}

export const wallet = (label: string): TestWallet => {
  const w = testWallets().find((x) => x.label === label);
  if (!w) throw new Error(`no test wallet ${label}`);
  return w;
};

export const PASSWORD = "E2e-Wallet-Pass-58";

/** Same algorithm as an authenticator app: TOTP, SHA-1, 30 s, 6 digits. */
export function totp(base32: string, t = Date.now()): string {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32.replace(/=+$/, "").toUpperCase()) bits += alpha.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(Math.floor(t / 1000 / 30)));
  const h = createHmac("sha1", key).update(msg).digest();
  const o = h[h.length - 1]! & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

/**
 * Opens the wallet page. `mode` picks the demo engine before the page loads: "simulation" uses
 * canned data, "stagenet" the public stagenet node.
 */
export async function openWallet(page: Page, mode: "simulation" | "stagenet" = "simulation") {
  await page.addInitScript((m) => {
    try {
      const k = "quietmint.demo.session.v1";
      const cur = JSON.parse(localStorage.getItem(k) ?? "null");
      if (!cur || cur.mode !== m) localStorage.setItem(k, JSON.stringify({ assignedLabel: cur?.assignedLabel ?? "e2e", mode: m }));
    } catch { /* storage blocked: the test that needs it fails visibly */ }
  }, mode);
  await page.goto("/wallet");
}

export async function setPassword(page: Page, password = PASSWORD) {
  await page.locator("#pw").fill(password);
  await page.locator("#pw2").fill(password);
  await page.getByRole("button", { name: "Continue" }).click();
}

/** Restores a test wallet from its words (no restore date: scans from the default). */
export async function restore(page: Page, w: TestWallet, opts: { skipTotp?: boolean } = { skipTotp: true }) {
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(w.seed);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#pw")).toBeVisible();
  await setPassword(page);
  if (opts.skipTotp) await page.getByRole("button", { name: /^Skip/ }).first().click();
}

export const dashboard = (page: Page) => expect(page.getByRole("button", { name: "Lock" }).first()).toBeVisible({ timeout: 60_000 });

export async function lock(page: Page) {
  await page.getByRole("button", { name: "Lock" }).first().click();
  await expect(page.locator("#upw")).toBeVisible();
}

export async function unlock(page: Page, password = PASSWORD) {
  await page.locator("#upw").fill(password);
  await page.locator("#upw").press("Enter");
}
