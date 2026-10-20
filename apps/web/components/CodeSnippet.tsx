"use client";
/**
 * A shell snippet in the MonkStash style: an ink card with a title bar and a copy button.
 * Lines starting with "# " are comments; lines starting with two spaces continue the command
 * above. The "$" prompt is drawn but never copied, so a copied snippet pastes and runs as is.
 */
import { useState } from "react";
import styles from "./code-snippet.module.css";

type Kind = "comment" | "cmd" | "cont";

function kindOf(line: string): Kind {
  if (line.startsWith("# ")) return "comment";
  if (line.startsWith("  ")) return "cont";
  return "cmd";
}

/** Light colouring: the program, flags, addresses and paths, the line-continuation mark. */
function Tokens({ line, first }: { line: string; first: boolean }) {
  const parts = line.split(/(\s+)/);
  let seenWord = false;
  return (
    <>
      {parts.map((p, i) => {
        if (!p || /^\s+$/.test(p)) return p;
        let cls = "";
        if (first && !seenWord) cls = styles.prog!;
        else if (p === "\\" || p === "&&" || p === ">" || p === "|") cls = styles.op!;
        else if (p.startsWith("-")) cls = styles.flag!;
        else if (p.includes("://") || p.includes("/") || p.includes(".json") || /^[0-9a-f]{12,}$/.test(p)) cls = styles.arg!;
        seenWord = true;
        return cls ? <span key={i} className={cls}>{p}</span> : p;
      })}
    </>
  );
}

export function CodeSnippet({ title, code, note }: { title: string; code: string; note?: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "fail">("idle");
  const lines = code.split("\n");
  // A command that ends with "\" continues on the next line, so the next one gets no prompt.
  let continues = false;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code.replace(/\n+$/, "") + "\n");
      setCopied("done");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied("idle"), 1800);
  }

  return (
    <figure className={styles.snippet}>
      <figcaption className={styles.bar}>
        <span className={styles.title}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 6l4 4-4 4M10 14h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {title}
        </span>
        {note ? <span className={styles.note}>{note}</span> : null}
        <button type="button" className={styles.copy} onClick={copy}>
          {copied === "done" ? (
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="7" y="7" width="9" height="9" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M13 4.5H5.6A1.6 1.6 0 0 0 4 6.1V13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          )}
          <span>{copied === "done" ? "Copied" : copied === "fail" ? "Copy failed" : "Copy"}</span>
        </button>
        <span className="visually-hidden" role="status">{copied === "done" ? "Commands copied" : copied === "fail" ? "Copy failed" : ""}</span>
      </figcaption>
      <pre className={styles.pre} tabIndex={0} aria-label={`${title}: commands`}>
        <code>
          {lines.map((line, i) => {
            const k = kindOf(line);
            const prompt = k === "cmd" && !continues;
            const out = (
              <span key={i} className={`${styles.line} ${k === "comment" ? styles.comment : ""}`}>
                <span className={styles.prompt} aria-hidden="true">{prompt ? "$" : ""}</span>
                {k === "comment" ? line : <Tokens line={line} first={prompt} />}
                {"\n"}
              </span>
            );
            if (k !== "comment") continues = line.trimEnd().endsWith("\\");
            return out;
          })}
        </code>
      </pre>
    </figure>
  );
}
