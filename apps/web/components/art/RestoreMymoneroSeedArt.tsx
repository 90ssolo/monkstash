import { MoneroSymbol } from "./MoneroSymbol";

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

/** Two phrase cards (13 and 25 words) pointing at the one thing that holds the money: the network. */
export function PhraseLengthsFigure() {
  const rows13 = Array.from({ length: 13 }, (_, i) => i);
  const rows25 = Array.from({ length: 25 }, (_, i) => i);
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Two phrase cards. A short card with 13 word slots and a longer card with 25 word slots. Both point to the Monero network, where the money actually lives." style={{ width: "100%", height: "auto" }}>
      {/* 13 word card */}
      <rect x="20" y="40" width="170" height="190" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="105" y="30" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>13 words (MyMonero style)</text>
      {rows13.map((i) => (
        <line key={i} x1={32 + (i % 2) * 78} y1={62 + Math.floor(i / 2) * 23} x2={90 + (i % 2) * 78} y2={62 + Math.floor(i / 2) * 23} stroke={FOREST} strokeWidth="0.9" opacity="0.7" />
      ))}
      <text x="105" y="252" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>12 words + 1 check word</text>

      {/* 25 word card */}
      <rect x="450" y="40" width="170" height="190" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="535" y="30" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>25 words (standard)</text>
      {rows25.map((i) => (
        <line key={i} x1={462 + (i % 2) * 78} y1={56 + Math.floor(i / 2) * 13.5} x2={520 + (i % 2) * 78} y2={56 + Math.floor(i / 2) * 13.5} stroke={FOREST} strokeWidth="0.9" opacity="0.7" />
      ))}
      <text x="535" y="252" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>24 words + 1 check word</text>

      {/* The network */}
      <circle cx="320" cy="135" r="58" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <MoneroSymbol variant="mono" size={52} x={294} y={96} style={{ color: FOREST }} />
      <text x="320" y="178" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>the network</text>
      <text x="320" y="285" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>The money lives on the network. The words are the key.</text>

      {/* arrows */}
      <path d="M190 135 H258" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M252 129 L260 135 L252 141" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M450 135 H382" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M388 129 L380 135 L388 141" stroke={CLAY} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

/** Two lanes: the safe restore path versus the look-alike site trap. */
export function SafeVersusCloneFigure() {
  return (
    <svg viewBox="0 0 640 280" role="img" aria-label="Two paths. Safe path: your own bookmark or an official source, then the real wallet, then your balance. Trap path: a search ad or a link in a message, then a look-alike site asking for your words, then an emptied wallet." style={{ width: "100%", height: "auto" }}>
      <text x="20" y="24" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>The safe path</text>
      {[
        { x: 20, t1: "Your own", t2: "bookmark" },
        { x: 240, t1: "The real", t2: "wallet screen" },
        { x: 460, t1: "Your balance", t2: "appears" },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y="40" width="160" height="62" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
          <text x={b.x + 80} y="68" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>{b.t1}</text>
          <text x={b.x + 80} y="86" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>{b.t2}</text>
        </g>
      ))}
      <path d="M180 71 H238" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M232 65 L240 71 L232 77" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M400 71 H458" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M452 65 L460 71 L452 77" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <line x1="20" y1="140" x2="620" y2="140" stroke={FOREST} strokeWidth="0.8" strokeDasharray="3 5" opacity="0.5" />

      <text x="20" y="172" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>The trap</text>
      {[
        { x: 20, t1: "A search ad or", t2: "a link in a message" },
        { x: 240, t1: "A look-alike site", t2: "asks for your words" },
        { x: 460, t1: "Your wallet", t2: "is emptied" },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y="188" width="160" height="62" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
          <text x={b.x + 80} y="216" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>{b.t1}</text>
          <text x={b.x + 80} y="234" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>{b.t2}</text>
        </g>
      ))}
      <path d="M180 219 H238" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M232 213 L240 219 L232 225" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M400 219 H458" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <path d="M452 213 L460 219 L452 225" stroke={CLAY} strokeWidth="1.4" fill="none" />
    </svg>
  );
}
