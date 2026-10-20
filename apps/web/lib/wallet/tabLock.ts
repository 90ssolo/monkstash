"use client";
/**
 * One open wallet at a time per browser. Two tabs running the same wallet would each hand out
 * "the next" subaddress, so a payment request in one tab and a till sale in the other could
 * share an address, and each tab's saves would overwrite the other's lists.
 *
 * Uses the Web Locks API. This tab queues for the lock: a reload gets it as soon as the old
 * page lets go, and a second tab shows a notice after a short wait (and still takes over by
 * itself if the first tab closes). "Use it here" steals the lock, which closes the wallet in
 * the other tab.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const LOCK = "monkstash-wallet";
/** How long a reload may take to release the old page's lock before we call it "another tab". */
const GRACE_MS = 1200;

/** checking: asking the browser. owner: this tab runs the wallet. elsewhere: another tab does.
 *  moved: this tab had the wallet and another tab took over. */
export type TabState = "checking" | "owner" | "elsewhere" | "moved";

export function useSingleTab(): { state: TabState; takeOver: () => void } {
  const [state, setState] = useState<TabState>("checking");
  /** Cancels the current request or releases the held lock. */
  const cancel = useRef<(() => void) | null>(null);

  const hold = useCallback((steal: boolean) => {
    const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
    if (!locks) { setState("owner"); return; } // Very old browsers: no coordination possible.
    let granted = false;
    let disposed = false;
    let release: (() => void) | null = null;
    const ctrl = new AbortController();
    const timer = steal ? undefined : window.setTimeout(() => { if (!granted && !disposed) setState("elsewhere"); }, GRACE_MS);
    cancel.current = () => {
      disposed = true;
      window.clearTimeout(timer);
      if (!granted) ctrl.abort();
      release?.();
    };
    const options: LockOptions = steal ? { steal: true } : { signal: ctrl.signal };
    locks.request(LOCK, options, async () => {
      // Granted after this request was cancelled (e.g. a re-render): let go at once.
      if (disposed) return;
      granted = true;
      window.clearTimeout(timer);
      setState("owner");
      await new Promise<void>((r) => { release = r; });
    }).catch((err: unknown) => {
      if ((err as DOMException)?.name !== "AbortError" || disposed || !granted) return;
      // We held the lock and another tab stole it: stop using the wallet here.
      setState("moved");
    });
  }, []);

  useEffect(() => {
    hold(false);
    return () => cancel.current?.();
  }, [hold]);

  const takeOver = useCallback(() => {
    cancel.current?.();
    hold(true);
  }, [hold]);

  return { state, takeOver };
}
