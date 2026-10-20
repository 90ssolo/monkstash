/**
 * Service worker: starts the host page (where the wallet runs) when a view needs it, and passes on
 * the computer's lock state so the wallet locks with it. Chrome stops this worker when idle; the
 * host page keeps running on its own, so nothing here holds wallet state.
 */
import type { Control } from "./shared/rpc";

const HOST_URL = "host.html";
/** A host page that has not said it is ready by then is closed and started again on the next try. */
const HOST_START_MS = 15_000;
let creating: Promise<void> | null = null;

async function hostExists(): Promise<boolean> {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [chrome.runtime.getURL(HOST_URL)] });
  return contexts.length > 0;
}

/** Creates the host page once; resolves when it has started listening. */
async function ensureHost(): Promise<void> {
  if (await hostExists()) return;
  creating ??= (async () => {
    let onReady: ((raw: unknown) => void) | null = null;
    const ready = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("The wallet did not start. Close this window and open it again.")), HOST_START_MS);
      onReady = (raw: unknown) => {
        if ((raw as Control)?.t !== "host-ready") return;
        clearTimeout(timer);
        resolve();
      };
      chrome.runtime.onMessage.addListener(onReady);
    });
    try {
      await chrome.offscreen.createDocument({
        url: HOST_URL,
        reasons: ["WORKERS"],
        justification: "Runs the Monero wallet engine (WebAssembly in a Web Worker) while the popup is closed.",
      });
      await ready;
    } catch (e) {
      // A page that never got ready would block every later start: close it, so the next try is clean.
      await chrome.offscreen.closeDocument().catch(() => {});
      throw e;
    } finally {
      if (onReady) chrome.runtime.onMessage.removeListener(onReady);
    }
  })().finally(() => { creating = null; });
  return creating;
}

chrome.runtime.onMessage.addListener((raw, sender, reply) => {
  // Only this extension's own pages (there are no content scripts or external pages).
  if (sender.id !== chrome.runtime.id) return false;
  const msg = raw as Control;
  if (msg?.t === "ensure-host") {
    ensureHost().then(() => reply({ ok: true }), (e: unknown) => reply({ ok: false, error: (e as Error)?.message ?? String(e) }));
    return true;
  }
  return false;
});

// Lock with the computer: "locked" means the screen is locked (not merely idle).
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener((state) => {
  if (state !== "locked") return;
  void hostExists().then((up) => {
    if (up) void chrome.runtime.sendMessage({ t: "idle-state", state } satisfies Control).catch(() => {});
  });
});

chrome.runtime.onInstalled.addListener((details) => {
  // First install: onboarding (create or restore) happens in a full tab, never in the small popup.
  if (details.reason === "install") void chrome.tabs.create({ url: chrome.runtime.getURL("tab.html") });
});
