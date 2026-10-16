import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Diagrams for /buy-monero-without-kyc. Wide and phone versions live together here;
 * <Adaptive> shows one or the other. No service is named or pictured: parties are roles only.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

const LANES = [
  {
    title: "Your bank or card",
    note: "sees the money leave",
    items: ["Who you paid", "How much, and when", "Your account name"],
    tone: CLAY,
    dashed: true,
  },
  {
    title: "The other trader",
    note: "sees the trade",
    items: ["The name you paid from", "The amount you bought", "The address you gave"],
    tone: CLAY,
    dashed: true,
  },
  {
    title: "The Monero chain",
    note: "shows almost nothing",
    items: ["Sender hidden", "Amount hidden", "One-time address"],
    tone: FOREST,
    dashed: false,
  },
] as const;

const ARIA =
  "Who can see a no-KYC Monero purchase paid from a bank or card. Your bank or card issuer sees who you paid, how much and when, and your name on the account. The other trader sees the name you paid from, the amount you bought and the address you gave. The Monero blockchain hides the sender and the amount and uses a one-time receive address. No ID check is not the same as anonymous: the money leg stays visible.";

function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g fill="none" stroke={CLAY} strokeWidth="1.5">
      <path d={`M${cx - 8} ${cy} Q${cx} ${cy - 7} ${cx + 8} ${cy} Q${cx} ${cy + 7} ${cx - 8} ${cy} Z`} />
      <circle cx={cx} cy={cy} r="2.2" fill={CLAY} stroke="none" />
    </g>
  );
}

function Check({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill={FOREST} />
      <path d={`M${cx - 4} ${cy} l2.7 2.7 l5 -5.4`} fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function ArrowRight({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke={INK} strokeWidth="1.5" />
      <path d={`M${x2 - 8} ${y - 5} L${x2} ${y} L${x2 - 8} ${y + 5} Z`} fill={INK} />
    </g>
  );
}

function ArrowDown({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke={INK} strokeWidth="1.5" />
      <path d={`M${x - 5} ${y2 - 8} L${x} ${y2} L${x + 5} ${y2 - 8} Z`} fill={INK} />
    </g>
  );
}

/** Wide: three lanes left to right, from your bank to the chain. */
export function WhoSeesNoKycArt() {
  return (
    <svg viewBox="0 0 600 290" role="img" aria-label={ARIA} style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>NO ID CHECK IS NOT THE SAME AS ANONYMOUS</text>
      {LANES.map((l, i) => {
        const x = 8 + i * 200;
        const chain = i === 2;
        return (
          <g key={l.title}>
            <rect x={x} y="34" width="180" height="188" rx="4" fill={chain ? PAPER : CARD} stroke={l.tone} strokeWidth={chain ? 1.6 : 1.2} strokeDasharray={l.dashed ? "5 4" : undefined} />
            {chain ? <MoneroSymbol variant="color" size={18} x={x + 14} y={46} /> : null}
            <text x={chain ? x + 38 : x + 14} y="60" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={l.tone}>{l.title}</text>
            <text x={x + 14} y="82" fontSize="11.5" fill={MUTED}>{l.note}</text>
            {l.items.map((it, k) => (
              <g key={it}>
                {chain ? <Check cx={x + 22} cy={118 + k * 34} /> : <Eye cx={x + 22} cy={118 + k * 34} />}
                <text x={x + 38} y={122 + k * 34} fontSize="12" fill={INK}>{it}</text>
              </g>
            ))}
          </g>
        );
      })}
      <ArrowRight x1={188} x2={208} y={128} />
      <ArrowRight x1={388} x2={408} y={128} />
      <text x="8" y="252" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Monero hides the coins once they move. The payment you made to get them stays on record</text>
      <text x="8" y="272" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>with your bank and with the person you paid.</text>
    </svg>
  );
}

/** Phone: the same three lanes stacked. */
export function WhoSeesNoKycNarrow() {
  return (
    <svg viewBox="0 0 360 560" role="img" aria-label={ARIA} style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>NO ID CHECK IS NOT ANONYMOUS</text>
      {LANES.map((l, i) => {
        const y = 32 + i * 162;
        const chain = i === 2;
        return (
          <g key={l.title}>
            <rect x="8" y={y} width="344" height="136" rx="4" fill={chain ? PAPER : CARD} stroke={l.tone} strokeWidth={chain ? 1.6 : 1.2} strokeDasharray={l.dashed ? "5 4" : undefined} />
            {chain ? <MoneroSymbol variant="color" size={18} x={22} y={y + 12} /> : null}
            <text x={chain ? 46 : 22} y={y + 27} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={l.tone}>{l.title}</text>
            <text x="340" y={y + 27} textAnchor="end" fontSize="11.5" fill={MUTED}>{l.note}</text>
            {l.items.map((it, k) => (
              <g key={it}>
                {chain ? <Check cx={30} cy={y + 56 + k * 28} /> : <Eye cx={30} cy={y + 56 + k * 28} />}
                <text x="46" y={y + 60 + k * 28} fontSize="13" fill={INK}>{it}</text>
              </g>
            ))}
            {i < 2 ? <ArrowDown x={180} y1={y + 138} y2={y + 160} /> : null}
          </g>
        );
      })}
      <text x="8" y="520" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Monero hides the coins once they move.</text>
      <text x="8" y="540" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>The payment you made stays on record.</text>
    </svg>
  );
}
