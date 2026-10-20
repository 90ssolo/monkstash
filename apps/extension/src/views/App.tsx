/**
 * The extension's screens: the web wallet's own components, fed by the host page instead of a
 * wallet running in this page. The same app draws the popup, the side panel and the full tab.
 *
 * Creating or restoring a wallet only happens in the full tab: recovery words are never shown or
 * typed in the small popup, which closes as soon as you click elsewhere.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { WalletPublic, StoredWallet } from "@quietmint/wallet-core";
import { Dashboard } from "@/components/wallet/Dashboard";
import { Loading, Onboarding, Welcome, type OnboardingResult } from "@/components/wallet/Onboarding";
import { Fatal, Opening, OtherNetwork, SaveProblemNotice, Unlock } from "@/components/wallet/WalletApp";
import { Stage } from "@/components/wallet/Stage";
import type { SetupMode } from "@/lib/wallet/session";
import { ArtLock } from "@/components/wallet/WalletArt";
import { BrandMark } from "@/components/BrandMark";
import styles from "@/components/wallet/wallet.module.css";
import { siteHref } from "@/lib/site";
import { forgetNode, HostConnection, remoteCashier, remoteContacts, remoteRequests, remoteSettings, remoteWallet } from "./remote";
import ext from "./extension.module.css";

export type Surface = "popup" | "side" | "tab";

const host = new HostConnection();
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Opens the full view in a tab, at a dashboard section when given (popup "More" items, Settings). */
function openTab(section?: string) {
  void chrome.tabs.create({ url: chrome.runtime.getURL(`tab.html${section ? `#section=${section}` : ""}`) });
}

/** From the popup: open the full view and close the popup (it would sit over the new tab). */
function openFull(section?: string) {
  openTab(section);
  window.close();
}

export function App({ surface }: { surface: Surface }) {
  const [error, setError] = useState<string | null>(null);
  const state = useSyncExternalStore((fn) => host.onState(fn), () => host.state, () => host.state);

  useEffect(() => {
    host.connect().catch((e: unknown) => setError((e as Error).message));
  }, []);

  // Any use of any view keeps the wallet from locking for idleness (checked in the host).
  useEffect(() => {
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - last < 10_000) return;
      last = now;
      host.activity();
    };
    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true });
    return () => { for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity); };
  }, []);

  const view = state?.view;
  return (
    <div className={`${styles.shell} ${ext[surface]}`}>
      <header className={`${styles.appBar} ${ext.bar}`} inert={state?.cashierOn || undefined}>
        <a className="brand" href={siteHref("/")}><BrandMark /><span>MonkStash</span></a>
        <div className={ext.actions}>
        {surface === "tab" ? (
          <span className={styles.appStatus}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            Keys stay on this device
          </span>
        ) : null}
          {surface !== "tab" ? (
            <button type="button" className={ext.iconBtn} onClick={() => { openTab(); if (surface === "popup") window.close(); }} title="Open in a tab" aria-label="Open in a tab">
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M9 2.5h4.5V7M13.5 2.5 8 8M6.5 3.5h-3v9h9v-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ) : null}
          {surface === "popup" ? (
            <button type="button" className={ext.iconBtn} onClick={openSidePanel} title="Open in the side panel" aria-label="Open in the side panel">
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="2" y="2.5" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2.5v11" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          ) : null}
        </div>
      </header>
      <main id="main" className={view?.name === "open" ? styles.mainWide : styles.main}>
        {error || host.error ? <Fatal message={(error || host.error)!} /> : null}
        {!error && !host.error && (!state || view?.name === "boot") ? <Loading text="Loading…" /> : null}
        {state && view ? <Screen surface={surface} /> : null}
      </main>
    </div>
  );
}

function openSidePanel() {
  if (__FIREFOX__) {
    // Must run inside the click itself (Firefox drops the request after any await).
    void chrome.sidebarAction.open().catch(() => {});
    window.close();
    return;
  }
  void chrome.windows.getCurrent().then(async (w) => {
    if (w.id !== undefined) await chrome.sidePanel.open({ windowId: w.id });
    window.close();
  });
}

function Screen({ surface }: { surface: Surface }) {
  const state = host.state!;
  const view = state.view;
  const controller = <T,>(method: string, ...args: unknown[]) => host.call<T>("controller", method, ...args);

  if (view.name === "welcome") {
    if (surface !== "tab") return <SetUpInTab />;
    return <Welcome moveFirst onPick={(mode) => void controller("pick", mode)} />;
  }
  if (view.name === "onboard") {
    if (surface !== "tab") return <SetUpInTab continuing />;
    return (
      <Onboarding
        mode={view.mode as SetupMode}
        onCancel={() => void controller("pick", null)}
        onSwitchMode={(mode) => void controller("pick", mode)}
        onDone={(r: OnboardingResult) => controller("onboarded", r)}
      />
    );
  }
  if (view.name === "locked") {
    return (
      <Unlock
        record={view.record as Pick<StoredWallet, "pub">}
        unlock={(pw) => controller<"open" | "code">("unlock", pw)}
        submitCode={(code) => controller("submitCode", code)}
        onForget={() => void controller("remove")}
        warm={noop}
      />
    );
  }
  if (view.name === "otherNetwork") return <OtherNetwork record={view.record as Pick<StoredWallet, "pub">} onRemove={() => void controller("remove")} />;
  if (view.name === "opening") return <Opening />;
  if (view.name === "fatal") return <Fatal message={view.message as string} />;
  if (view.name === "open") return <OpenWallet surface={surface} />;
  return null;
}

const noop = () => {};
// Stable functions: the dashboard runs effects whenever these change identity.
const setCashierOn = (on: boolean) => void host.call("controller", "setCashierOn", on);
const lock = () => void host.call("controller", "lock");
const remove = () => {
  // Access to the person's own node goes with the wallet.
  forgetNode(host.state?.settings?.node ?? null);
  void host.call("controller", "remove");
};
const onSynced = () => void host.call("controller", "onSynced");

function OpenWallet({ surface }: { surface: Surface }) {
  const state = host.state!;
  const pubJson = JSON.stringify(state.view.pub);
  // One stand-in per opened engine: the screens keep their state while the host stays the same.
  const pub = useMemo(() => JSON.parse(pubJson) as WalletPublic, [pubJson]);
  const wallet = useMemo(() => remoteWallet(host, pub, state.walletSeq), [state.walletSeq]); // eslint-disable-line react-hooks/exhaustive-deps
  // Its timers and listeners stop with its screens.
  useEffect(() => () => wallet.dispose(), [wallet]);
  const stores = useMemo(() => ({ requests: remoteRequests(host), contacts: remoteContacts(host), cashier: remoteCashier(host) }), [state.walletSeq]);
  const settingsJson = JSON.stringify(state.settings);
  const settings = useMemo(() => remoteSettings(host, pub, surface === "tab" ? undefined : () => (surface === "popup" ? openFull("settings") : openTab("settings"))), [settingsJson, pub, surface]); // eslint-disable-line react-hooks/exhaustive-deps
  const compact = useMemo(() => (surface === "popup" ? { openFull } : undefined), [surface]);
  return (
    <>
      {state.saveProblem ? <SaveProblemNotice problem={state.saveProblem} /> : null}
      <Dashboard
        key={state.walletSeq}
        pub={pub}
        wallet={wallet}
        onLock={lock}
        onRemove={remove}
        onSynced={onSynced}
        settings={settings}
        requests={stores.requests}
        cashier={stores.cashier}
        contacts={stores.contacts}
        onCashierChange={setCashierOn}
        compact={compact}
        leaveText="you close every MonkStash window"
      />
    </>
  );
}

/** Popup and side panel: setting up a wallet happens in a full tab. */
function SetUpInTab({ continuing = false }: { continuing?: boolean }) {
  return (
    <Stage tone="ink" kicker={continuing ? "Setting up" : "Welcome"} sizzle={<>Your keys, <mark>on this device</mark>.</>} art={<ArtLock />}>
      <h1 className={styles.title}>{continuing ? "Finish setting up in the tab" : "Set up MonkStash"}</h1>
      <p className="muted">
        {continuing
          ? "Your wallet setup is open in a browser tab. Recovery words are only ever shown there, never in this small window."
          : "Create a new wallet, restore one from your recovery words, or add a watch-only wallet. Setup opens in a full tab, so your recovery words are never shown in this small window."}
      </p>
      <button type="button" className="btn btn-primary btn-block" onClick={() => { openTab(); window.close(); }}>
        {continuing ? "Go to the setup tab" : "Set up in a tab"}
      </button>
    </Stage>
  );
}
