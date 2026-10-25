/** Entry point for the popup, the side panel and the full tab (the page tells which with data-surface). */
import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "../fonts.css";
import "./popup.css";
import { App, type Surface } from "./App";
import { applyWalletTheme, getWalletTheme } from "@/lib/wallet/theme";

const surface = (document.documentElement.dataset.surface ?? "tab") as Surface;

// Links to the website open in a normal browser tab, never inside the popup or side panel.
document.addEventListener("click", (e) => {
  if (e.defaultPrevented) return;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || !/^https?:/i.test(a.href)) return;
  e.preventDefault();
  void chrome.tabs.create({ url: a.href });
});

// Before the first frame, so a chosen dark theme never flashes light.
applyWalletTheme(getWalletTheme());

createRoot(document.getElementById("root")!).render(<App surface={surface} />);
