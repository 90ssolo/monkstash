/** The MonkStash sprig: the brand's signature mark, reused as an accent and divider. */
export function Sprig({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size * 0.6} viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <path d="M3 9 q4 -1 7 -6 q-5 0 -7 5z" fill="var(--mint)" />
      <path d="M9 9 q4 0 8 -4 q-5 -1 -8 3z" fill="var(--mint)" />
    </svg>
  );
}

/** A thin rule with a centered sprig, used between sections. */
export function SprigRule({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", color: "var(--line-strong)" }}>
      <span style={{ flex: 1, height: 1, background: "currentColor" }} />
      <Sprig size={22} />
      <span style={{ flex: 1, height: 1, background: "currentColor" }} />
    </div>
  );
}
