"use client";
/**
 * "Install as an app": puts the wallet on the home screen or desktop with its own window. Uses the
 * browser's own install prompt where there is one (Chrome, Edge, Android); explains Add to Home
 * Screen on iPhone and iPad. Nothing is downloaded from anywhere else, and the installed app loads
 * the same checkable files as the website (there is no service worker).
 */
import { useEffect, useState } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp() {
  const [web, setWeb] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    // The extension is already an app of its own.
    setWeb(location.protocol === "https:" || location.protocol === "http:");
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (!web) return null;
  if (installed) return <p className="small muted" style={{ margin: 0 }}>You are using MonkStash as an app.</p>;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice.catch(() => ({ outcome: "dismissed" as const }));
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <div style={{ display: "grid", gap: "var(--s-2)" }}>
      <p className="small muted" style={{ margin: 0 }}>
        Open MonkStash from your home screen or desktop, in its own window, with Send and Receive one tap away. It is the same
        wallet and the same files as this page: your keys stay on this device.
      </p>
      {prompt ? (
        <button type="button" className="btn btn-secondary btn-sm" style={{ justifySelf: "start" }} onClick={() => void install()}>Install MonkStash</button>
      ) : ios ? (
        <p className="small" style={{ margin: 0 }}>On iPhone or iPad: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>
      ) : (
        <p className="small" style={{ margin: 0 }}>In Chrome or Edge, use the install icon in the address bar, or the browser menu&apos;s <strong>Install</strong> item. Firefox on Android: menu, then <strong>Add to Home screen</strong>.</p>
      )}
    </div>
  );
}
