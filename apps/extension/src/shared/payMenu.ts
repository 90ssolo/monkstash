/**
 * Right-click "Pay with MonkStash": on a selected address or a payment link, opens the full wallet
 * view with Send filled in. The extension still cannot read pages: the browser hands over only the
 * text or link that was right-clicked, and only when this menu item is chosen. Nothing is paid
 * without the usual review and password.
 */
import { readPastedRecipient } from "@quietmint/wallet-core";

export const PAY_MENU_ID = "monkstash-pay";

/** Adds the menu item (on install and update; menu items persist across restarts). */
export function installPayMenu() {
  // Defensive: without the menu API the rest of the extension must still start.
  if (!chrome.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: PAY_MENU_ID, title: "Pay with MonkStash", contexts: ["selection", "link"] });
  });
}

/** The wallet page to open for what was right-clicked: Send with the request, or just Send. */
export function payPageFor(info: { selectionText?: string; linkUrl?: string }): string {
  const link = info.linkUrl ?? "";
  const text = /^monero:/i.test(link) || /\/pay#/i.test(link) ? link : (info.selectionText ?? link);
  const p = readPastedRecipient(text);
  let uri: string | null = null;
  if (p.kind === "address") uri = `monero:${p.address}`;
  else if (p.kind === "request") {
    const raw = p.uri.replace(/^#/, "");
    try { uri = raw.startsWith("pay=") ? decodeURIComponent(raw.slice(4)) : raw; } catch { uri = null; }
  }
  return chrome.runtime.getURL(uri ? `tab.html#pay=${encodeURIComponent(uri)}` : "tab.html#section=send");
}

/** Listens for the menu item (top level of the background, so a click wakes it). */
export function listenPayMenu() {
  chrome.contextMenus?.onClicked.addListener(onPayMenu);
}

export function onPayMenu(info: chrome.contextMenus.OnClickData) {
  if (info.menuItemId !== PAY_MENU_ID) return;
  void chrome.tabs.create({ url: payPageFor(info) });
}
