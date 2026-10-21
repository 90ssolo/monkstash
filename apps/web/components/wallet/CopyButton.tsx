"use client";
import { useEffect, useRef, useState } from "react";

/** How long a sensitive value (a view key) may stay on the clipboard before it is cleared. */
const CLEAR_AFTER_MS = 45_000;

export function CopyButton({ value, label = "Copy", className = "btn btn-secondary btn-sm", sensitive = false }: { value: string; label?: string; className?: string; sensitive?: boolean }) {
  const [state, setState] = useState<"idle" | "done" | "fail" | "cleared">("idle");
  const clearTimer = useRef<number | null>(null);
  // When the panel closes before the timer, clear the clipboard right away.
  useEffect(() => () => {
    if (clearTimer.current === null) return;
    window.clearTimeout(clearTimer.current);
    void navigator.clipboard?.writeText("").catch(() => {});
  }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("done");
      if (sensitive) {
        if (clearTimer.current !== null) window.clearTimeout(clearTimer.current);
        // Overwrite the clipboard, so the value does not linger in clipboard history or sync.
        clearTimer.current = window.setTimeout(() => {
          clearTimer.current = null;
          void navigator.clipboard.writeText("").then(() => setState("cleared"), () => {});
        }, CLEAR_AFTER_MS);
      }
    } catch {
      setState("fail");
    }
    setTimeout(() => setState((s) => (s === "cleared" ? s : "idle")), 1800);
  }
  const text = state === "done" ? (sensitive ? "Copied, clears in 45 s" : "Copied") : state === "fail" ? "Copy failed" : state === "cleared" ? "Clipboard cleared" : label;
  return (
    <>
      <button type="button" className={className} onClick={copy}>{text}</button>
      <span className="visually-hidden" role="status">{state === "idle" ? "" : text}</span>
    </>
  );
}
