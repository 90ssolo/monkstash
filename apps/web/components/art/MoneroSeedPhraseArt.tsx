/** Figures for the "Monero seed phrase" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** 24 seed words plus one checksum word. */
export function SeedAnatomyArt() {
  const cells = Array.from({ length: 24 }, (_, i) => ({
    n: i + 1,
    x: 30 + (i % 6) * 92,
    y: 52 + Math.floor(i / 6) * 48,
  }));
  return (
    <svg viewBox="0 0 720 290" width="100%" role="img" aria-label="A Monero seed is 25 words: 24 words that encode your secret, then one checksum word that catches typing mistakes.">
      <text x="30" y="30" fontSize="15" fill={FOREST} style={LABEL}>Words 1 to 24 carry your secret</text>
      <text x="690" y="30" textAnchor="end" fontSize="15" fill={CLAY} style={LABEL}>Word 25 checks them</text>
      {cells.map((c) => (
        <g key={c.n}>
          <rect x={c.x} y={c.y} width="80" height="36" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
          <text x={c.x + 10} y={c.y + 23} fontSize="13" fill={FOREST} style={LABEL}>{c.n}</text>
          <line x1={c.x + 28} y1={c.y + 22} x2={c.x + 70} y2={c.y + 22} stroke={FOREST} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        </g>
      ))}
      <rect x="600" y="52" width="90" height="180" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <text x="645" y="130" fontSize="22" fill={CLAY} textAnchor="middle" style={LABEL}>25</text>
      <text x="645" y="156" fontSize="12" fill={CLAY} textAnchor="middle" style={LABEL}>checksum</text>
      <path d="M 570 142 L 592 142" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M 586 137 L 593 142 L 586 147" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <text x="30" y="264" fontSize="13" fill={FOREST} style={LABEL}>Wrong word or wrong order? The last word will not match, so the wallet tells you before anything is restored.</text>
    </svg>
  );
}

/** The seed is the root that produces the spend key, the view key and the address. */
export function SeedRootArt() {
  return (
    <svg viewBox="0 0 720 310" width="100%" role="img" aria-label="Your 25 words produce the private spend key. The private view key is derived from the spend key. Together they produce your public address.">
      <defs>
        <marker id="seedroot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={FOREST} strokeWidth="1.4" />
        </marker>
      </defs>
      <rect x="24" y="112" width="150" height="86" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.8" />
      <text x="99" y="148" fontSize="20" fill={CLAY} textAnchor="middle" style={LABEL}>Your 25 words</text>
      <text x="99" y="172" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>the root of everything</text>

      <rect x="270" y="38" width="190" height="72" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="365" y="68" fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>Private spend key</text>
      <text x="365" y="90" fontSize="12" fill={CLAY} textAnchor="middle" style={LABEL}>can spend your money</text>

      <rect x="270" y="200" width="190" height="72" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="365" y="230" fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>Private view key</text>
      <text x="365" y="252" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>can only see payments in</text>

      <rect x="540" y="112" width="156" height="86" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="618" y="148" fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>Public address</text>
      <text x="618" y="172" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>safe to share</text>

      <path d="M 174 140 L 266 80" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#seedroot-arrow)" />
      <path d="M 365 110 L 365 196" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#seedroot-arrow)" strokeDasharray="4 3" />
      <text x="376" y="160" fontSize="12" fill={FOREST} style={LABEL}>derived by hashing</text>
      <path d="M 460 74 L 536 138" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#seedroot-arrow)" />
      <path d="M 460 236 L 536 174" stroke={FOREST} strokeWidth="1.4" fill="none" markerEnd="url(#seedroot-arrow)" />
      <text x="30" y="296" fontSize="12" fill={FOREST} style={LABEL}>The arrows only run one way: nobody can work backwards from an address to your words.</text>
    </svg>
  );
}

/** Good versus bad places to keep the seed. */
export function SeedStorageArt() {
  const good = ["Pen on paper, written by you", "Stamped or engraved metal", "Two or more separate places", "Tested once with a restore"];
  const bad = ["Screenshot or phone photo", "Email, chat or cloud notes", "Typed into any website", "One copy in one drawer"];
  return (
    <svg viewBox="0 0 720 270" width="100%" role="img" aria-label="Good places to keep a seed: paper, metal, two separate locations, and a tested restore. Bad places: screenshots, email or cloud notes, websites, and a single copy.">
      <rect x="24" y="20" width="324" height="226" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="44" y="50" fontSize="18" fill={FOREST} style={LABEL}>Keep it like this</text>
      <rect x="372" y="20" width="324" height="226" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="392" y="50" fontSize="18" fill={CLAY} style={LABEL}>Never like this</text>
      {good.map((t, i) => (
        <g key={t}>
          <path d={`M 46 ${88 + i * 42} l 6 7 l 12 -14`} stroke={FOREST} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="78" y={92 + i * 42} fontSize="15" fill={FOREST} style={LABEL}>{t}</text>
        </g>
      ))}
      {bad.map((t, i) => (
        <g key={t}>
          <path d={`M 394 ${80 + i * 42} l 14 14 M 408 ${80 + i * 42} l -14 14`} stroke={CLAY} strokeWidth="2" fill="none" strokeLinecap="round" />
          <text x="424" y={92 + i * 42} fontSize="15" fill={CLAY} style={LABEL}>{t}</text>
        </g>
      ))}
    </svg>
  );
}
