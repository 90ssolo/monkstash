/** Figures for the "Monero view only wallet" guide. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** What goes into a view-only wallet. */
export function ViewOnlyInArt() {
  return (
    <svg viewBox="0 0 720 280" width="100%" role="img" aria-label="Two things go into a view-only wallet: your primary address and your private view key. Your recovery words and your private spend key stay out.">
      <defs>
        <marker id="vo-in-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={FOREST} strokeWidth="1.4" />
        </marker>
      </defs>
      <text x="24" y="28" fontSize="15" fill={FOREST} style={LABEL}>Goes in</text>
      <rect x="24" y="44" width="220" height="64" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="134" y="72" fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>Primary address</text>
      <text x="134" y="92" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>starts with 4, safe to share</text>
      <rect x="24" y="120" width="220" height="64" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="134" y="148" fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>Private view key</text>
      <text x="134" y="168" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>64 characters, 0-9 and a-f</text>

      <path d="M 248 76 L 330 120" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#vo-in-arrow)" />
      <path d="M 248 152 L 330 136" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#vo-in-arrow)" />

      <rect x="336" y="76" width="180" height="104" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.8" />
      <circle cx="426" cy="116" r="16" fill="none" stroke={CLAY} strokeWidth="1.6" />
      <circle cx="426" cy="116" r="5" fill="none" stroke={CLAY} strokeWidth="1.6" />
      <path d="M 402 116 Q 426 94 450 116 Q 426 138 402 116" fill="none" stroke={CLAY} strokeWidth="1.2" opacity="0.6" />
      <text x="426" y="158" fontSize="16" fill={CLAY} textAnchor="middle" style={LABEL}>View-only wallet</text>

      <text x="560" y="28" fontSize="15" fill={CLAY} style={LABEL}>Stays out</text>
      <rect x="560" y="44" width="136" height="64" rx="4" fill="none" stroke={CLAY} strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="628" y="72" fontSize="14" fill={CLAY} textAnchor="middle" style={LABEL}>25 recovery words</text>
      <path d="M 572 98 L 684 54" stroke={CLAY} strokeWidth="1.6" fill="none" />
      <rect x="560" y="120" width="136" height="64" rx="4" fill="none" stroke={CLAY} strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="628" y="148" fontSize="14" fill={CLAY} textAnchor="middle" style={LABEL}>Private spend key</text>
      <path d="M 572 174 L 684 130" stroke={CLAY} strokeWidth="1.6" fill="none" />

      <text x="24" y="238" fontSize="13" fill={FOREST} style={LABEL}>Because the spend key never enters this wallet, nothing that happens here can move your money.</text>
    </svg>
  );
}

/** What a view-only wallet shows, and the gap. */
export function ViewOnlySeesArt() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="A view-only wallet adds up payments received, but cannot recognise payments you sent. After a spend, the balance it shows is higher than the real balance until key images are imported.">
      <text x="24" y="28" fontSize="15" fill={FOREST} style={LABEL}>Real wallet</text>
      <text x="410" y="28" fontSize="15" fill={CLAY} style={LABEL}>View-only wallet</text>

      <rect x="24" y="44" width="290" height="190" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="44" y="78" fontSize="15" fill={FOREST} style={LABEL}>Received</text>
      <text x="290" y="78" fontSize="15" fill={FOREST} textAnchor="end" style={LABEL}>3.0</text>
      <text x="44" y="112" fontSize="15" fill={FOREST} style={LABEL}>Spent</text>
      <text x="290" y="112" fontSize="15" fill={FOREST} textAnchor="end" style={LABEL}>minus 1.2</text>
      <line x1="44" y1="130" x2="290" y2="130" stroke={FOREST} strokeWidth="1.2" />
      <text x="44" y="166" fontSize="18" fill={FOREST} style={LABEL}>Balance</text>
      <text x="290" y="166" fontSize="22" fill={FOREST} textAnchor="end" style={LABEL}>1.8</text>
      <text x="44" y="214" fontSize="12" fill={FOREST} style={LABEL}>what you can actually spend</text>

      <rect x="410" y="44" width="286" height="190" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <text x="430" y="78" fontSize="15" fill={FOREST} style={LABEL}>Received</text>
      <text x="676" y="78" fontSize="15" fill={FOREST} textAnchor="end" style={LABEL}>3.0</text>
      <text x="430" y="112" fontSize="15" fill={CLAY} opacity="0.6" style={LABEL}>Spent</text>
      <text x="676" y="112" fontSize="15" fill={CLAY} opacity="0.6" textAnchor="end" style={LABEL}>not seen</text>
      <line x1="430" y1="130" x2="676" y2="130" stroke={CLAY} strokeWidth="1.2" />
      <text x="430" y="166" fontSize="18" fill={CLAY} style={LABEL}>Shown</text>
      <text x="676" y="166" fontSize="22" fill={CLAY} textAnchor="end" style={LABEL}>3.0</text>
      <text x="430" y="214" fontSize="12" fill={CLAY} style={LABEL}>too high by the amount you spent</text>

      <path d="M 318 139 L 404 139" stroke={FOREST} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
      <text x="24" y="272" fontSize="13" fill={FOREST} style={LABEL}>Importing key images from the full wallet closes the gap. Until then, read the number as a ceiling.</text>
    </svg>
  );
}
