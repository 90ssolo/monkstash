/**
 * The wallet's colour theme: follow the system, or always light or dark. A per-device preference in
 * localStorage, never part of a wallet. The content site stays light; only the wallet screens read it.
 *
 * The tokens live in globals.css. The wallet shell carries data-wallet-root, so "system" already works
 * in the server-rendered page; an explicit choice is put on <html> as data-wallet-theme.
 */
import { useEffect, useSyncExternalStore } from "react";

export type WalletTheme = "system" | "light" | "dark";

const KEY = "monkstash.theme.v1";
const LIGHT_BAR = "#edeee6";
const DARK_BAR = "#111813";
const listeners = new Set<() => void>();
let current: WalletTheme | null = null;

function read(): WalletTheme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch { /* storage blocked */ }
  return "system";
}

export function getWalletTheme(): WalletTheme {
  if (current === null) current = typeof window === "undefined" ? "system" : read();
  return current;
}

export function setWalletTheme(theme: WalletTheme): void {
  current = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch { /* storage blocked: the choice lasts until the page closes */ }
  applyWalletTheme(theme);
  for (const fn of listeners) fn();
}

function prefersDark(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Puts the choice on <html> and matches the browser's bar colour (phones colour it). */
export function applyWalletTheme(theme: WalletTheme): void {
  const root = document.documentElement;
  root.dataset.walletTheme = theme;
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = dark ? DARK_BAR : LIGHT_BAR;
}

/** For the wallet shell: applies the saved theme while mounted and follows system changes. */
export function useApplyWalletTheme(): void {
  useEffect(() => {
    applyWalletTheme(getWalletTheme());
    const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
    const onChange = () => applyWalletTheme(getWalletTheme());
    mq?.addEventListener("change", onChange);
    return () => {
      mq?.removeEventListener("change", onChange);
      delete document.documentElement.dataset.walletTheme;
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (meta) meta.content = LIGHT_BAR;
    };
  }, []);
}

export function useWalletTheme(): [WalletTheme, (t: WalletTheme) => void] {
  const theme = useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    getWalletTheme,
    () => "system" as WalletTheme,
  );
  return [theme, setWalletTheme];
}
