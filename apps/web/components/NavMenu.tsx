"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Phone navigation menu. A native <details> so it works without script; this
 * client layer adds the expected dismissals: Escape (focus returns to the
 * toggle), choosing a link, and clicking anywhere outside.
 */
export function NavMenu({ items }: { items: { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const close = (refocus: boolean) => {
      if (!el.open) return;
      el.open = false;
      if (refocus) el.querySelector("summary")?.focus();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && el.open) { e.preventDefault(); close(true); } };
    const onPointer = (e: PointerEvent) => { if (!el.contains(e.target as Node)) close(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <details className="nav-menu" ref={ref}>
      <summary><span className="nav-menu-icon" aria-hidden="true" /><span className="nav-menu-label">Menu</span></summary>
      <ul>
        {items.map((n) => (
          <li key={n.href}>
            <Link href={n.href} onClick={() => { if (ref.current) ref.current.open = false; }}>{n.label}</Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
