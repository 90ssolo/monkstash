/** Figures for the "Monero view key" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Key({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="13" />
      <circle cx="18" cy="18" r="4" />
      <path d="M 31 18 L 86 18" />
      <path d="M 70 18 L 70 30 M 82 18 L 82 28" />
    </g>
  );
}

/** Two keys, two powers. */
export function ViewKeyPowersArt() {
  const spend = [
    { t: "See money coming in", ok: true },
    { t: "See money going out", ok: true },
    { t: "Send Monero", ok: true },
  ];
  const view = [
    { t: "See money coming in", ok: true },
    { t: "See money going out reliably", ok: false },
    { t: "Send Monero", ok: false },
  ];
  const rows = (items: { t: string; ok: boolean }[], x: number, color: string) =>
    items.map((r, i) => (
      <g key={r.t}>
        {r.ok ? (
          <path d={`M ${x} ${150 + i * 40} l 6 7 l 12 -14`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d={`M ${x} ${142 + i * 40} l 14 14 M ${x + 14} ${142 + i * 40} l -14 14`} stroke={CLAY} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        <text x={x + 30} y={155 + i * 40} fontSize="15" fill={r.ok ? color : CLAY} style={LABEL}>{r.t}</text>
      </g>
    ));
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two keys, two powers. The private spend key can see incoming and outgoing payments and can send. The private view key can see incoming payments but cannot reliably see outgoing ones and cannot send.">
      <rect x="24" y="20" width="324" height="262" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <Key x={44} y={36} color={CLAY} />
      <text x="44" y="100" fontSize="19" fill={CLAY} style={LABEL}>Private spend key</text>
      <text x="44" y="122" fontSize="13" fill={FOREST} style={LABEL}>Never share. Whoever has it owns the money.</text>
      {rows(spend, 46, FOREST)}

      <rect x="372" y="20" width="324" height="262" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <Key x={392} y={36} color={FOREST} />
      <text x="392" y="100" fontSize="19" fill={FOREST} style={LABEL}>Private view key</text>
      <text x="392" y="122" fontSize="13" fill={FOREST} style={LABEL}>Can be shared on purpose. Shows your history.</text>
      {rows(view, 394, FOREST)}
    </svg>
  );
}

/** What a holder of the view key sees across a short history. */
export function ViewKeySeesArt() {
  const tx = [
    { label: "Received 2.0 XMR", seen: true },
    { label: "Sent to a shop", seen: false },
    { label: "Received 0.5 XMR", seen: true },
    { label: "Sent to a friend", seen: false },
    { label: "Received 1.2 XMR", seen: true },
  ];
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="A wallet's real history has three payments in and two payments out. Someone holding only the view key sees the three payments in. The two payments out are not reliably visible to them.">
      <text x="24" y="28" fontSize="15" fill={FOREST} style={LABEL}>What really happened</text>
      <text x="410" y="28" fontSize="15" fill={CLAY} style={LABEL}>What the view key holder sees</text>
      {tx.map((t, i) => {
        const y = 46 + i * 44;
        return (
          <g key={t.label}>
            <rect x="24" y={y} width="300" height="34" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
            <text x="40" y={y + 22} fontSize="14" fill={FOREST} style={LABEL}>{t.label}</text>
            {t.seen ? (
              <>
                <rect x="410" y={y} width="286" height="34" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
                <text x="426" y={y + 22} fontSize="14" fill={CLAY} style={LABEL}>{t.label}</text>
                <path d={`M 332 ${y + 17} L 404 ${y + 17}`} stroke={FOREST} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
              </>
            ) : (
              <>
                <rect x="410" y={y} width="286" height="34" rx="3" fill="none" stroke={FOREST} strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
                <text x="426" y={y + 22} fontSize="14" fill={FOREST} opacity="0.55" style={LABEL}>nothing shown</text>
              </>
            )}
          </g>
        );
      })}
      <text x="24" y="284" fontSize="13" fill={FOREST} style={LABEL}>The balance a view key shows adds up money in and never subtracts money out, so treat it as an upper limit.</text>
    </svg>
  );
}
