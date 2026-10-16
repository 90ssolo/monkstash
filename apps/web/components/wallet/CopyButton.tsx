"use client";
import { useState } from "react";

export function CopyButton({ value, label = "Copy", className = "btn btn-secondary btn-sm" }: { value: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("done");
    } catch {
      setState("fail");
    }
    setTimeout(() => setState("idle"), 1800);
  }
  return (
    <>
      <button type="button" className={className} onClick={copy}>
        {state === "done" ? "Copied" : state === "fail" ? "Copy failed" : label}
      </button>
      <span className="visually-hidden" role="status">{state === "done" ? "Copied" : state === "fail" ? "Copy failed" : ""}</span>
    </>
  );
}
