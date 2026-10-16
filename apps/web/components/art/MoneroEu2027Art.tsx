import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Figure for the "Monero and the EU's 2027 rules" article: where Article 79 of the AMLR reaches.
 * Ink-on-paper line art. Wide version (720 units) and a stacked phone version (360 units),
 * shown through <Adaptive>.
 */

const INK = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Wallet({ x, y, w, title, note }: { x: number; y: number; w: number; title: string; note: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="78" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.4" />
      <MoneroSymbol variant="color" size={30} x={x + 14} y={y + 24} />
      <text x={x + 56} y={y + 34} fontSize="16" fill={INK} style={LABEL}>{title}</text>
      <text x={x + 56} y={y + 56} fontSize="14" fill={GREY} style={LABEL}>{note}</text>
    </g>
  );
}

function Firm({ x, y, w, title, note }: { x: number; y: number; w: number; title: string; note: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="66" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.4" />
      <text x={x + 16} y={y + 28} fontSize="16" fill={INK} style={LABEL}>{title}</text>
      <text x={x + 16} y={y + 49} fontSize="14" fill={GREY} style={LABEL}>{note}</text>
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
}

/** Article 79 binds obliged entities; a self-custody wallet sits outside that box (wide). */
export function Article79ScopeArt() {
  return (
    <svg viewBox="0 0 720 340" width="100%" role="img" aria-label="Diagram. On the left, your self-custody Monero wallet and another person's wallet, linked by a wallet-to-wallet arrow that Article 79 does not mention. On the right, a dashed clay box labelled obliged entities contains a crypto-asset service provider and a bank or payment firm. Article 79 applies inside that box. An arrow from your wallet to the service provider is labelled buy, sell, deposit.">
      <text x="24" y="30" fontSize="17" fill={INK} style={LABEL}>People and their own wallets</text>
      <Wallet x={24} y={52} w={250} title="Your wallet" note="you hold the keys" />
      <Wallet x={24} y={222} w={250} title="Someone else's wallet" note="they hold the keys" />
      <Arrow d="M 110 134 V 216 M 103 208 L 110 216 L 117 208 M 190 216 V 134 M 183 142 L 190 134 L 197 142" />
      <text x="150" y="172" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>wallet to</text>
      <text x="150" y="188" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>wallet</text>

      <rect x="372" y="14" width="336" height="312" rx="6" fill="none" stroke={CLAY} strokeWidth="1.6" strokeDasharray="7 5" />
      <text x="392" y="42" fontSize="17" fill={CLAY} style={LABEL}>Obliged entities: Article 79 applies here</text>
      <Firm x={392} y={68} w={296} title="Crypto-asset service provider" note="exchange, broker, custodian" />
      <Firm x={392} y={160} w={296} title="Bank or payment firm" note="credit and financial institutions" />
      <text x="392" y="268" fontSize="15" fill={INK} style={LABEL}>May not keep accounts that anonymise</text>
      <text x="392" y="288" fontSize="15" fill={INK} style={LABEL}>the holder or obscure transactions,</text>
      <text x="392" y="308" fontSize="15" fill={INK} style={LABEL}>including through anonymity-enhancing coins.</text>

      <Arrow d="M 276 92 H 386 M 378 85 L 386 92 L 378 99" />
      <text x="330" y="80" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>buy, sell,</text>
      <text x="330" y="118" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>deposit</text>
    </svg>
  );
}

/** Phone version, stacked. */
export function Article79ScopeNarrow() {
  return (
    <svg viewBox="0 0 360 600" style={{ width: "100%", height: "auto" }} role="img" aria-label="Diagram. At the top, your self-custody Monero wallet and another person's wallet, linked by a wallet-to-wallet arrow that Article 79 does not mention. Below, a dashed clay box labelled obliged entities contains a crypto-asset service provider and a bank or payment firm. Article 79 applies inside that box. An arrow from your wallet down to the service provider is labelled buy, sell, deposit.">
      <text x="10" y="24" fontSize="16" fill={INK} style={LABEL}>People and their own wallets</text>
      <Wallet x={10} y={38} w={150} title="Your wallet" note="your keys" />
      <Wallet x={200} y={38} w={150} title="Another's" note="their keys" />
      <Arrow d="M 162 70 H 196 M 188 63 L 196 70 L 188 77 M 196 92 H 162 M 170 85 L 162 92 L 170 99" />
      <text x="180" y="140" textAnchor="middle" fontSize="12" fill={GREY} style={LABEL}>wallet to wallet</text>

      <Arrow d="M 85 118 V 196 M 78 188 L 85 196 L 92 188" />
      <text x="96" y="166" fontSize="12" fill={GREY} style={LABEL}>buy, sell, deposit</text>

      <rect x="6" y="204" width="348" height="388" rx="6" fill="none" stroke={CLAY} strokeWidth="1.6" strokeDasharray="7 5" />
      <text x="20" y="232" fontSize="16" fill={CLAY} style={LABEL}>Obliged entities:</text>
      <text x="20" y="254" fontSize="16" fill={CLAY} style={LABEL}>Article 79 applies here</text>
      <Firm x={20} y={272} w={320} title="Crypto-asset service provider" note="exchange, broker, custodian" />
      <Firm x={20} y={354} w={320} title="Bank or payment firm" note="credit and financial institutions" />
      <text x="20" y="462" fontSize="14" fill={INK} style={LABEL}>May not keep accounts that</text>
      <text x="20" y="484" fontSize="14" fill={INK} style={LABEL}>anonymise the holder or obscure</text>
      <text x="20" y="506" fontSize="14" fill={INK} style={LABEL}>transactions, including through</text>
      <text x="20" y="528" fontSize="14" fill={INK} style={LABEL}>anonymity-enhancing coins.</text>
      <text x="20" y="568" fontSize="12" fill={GREY} style={LABEL}>Simplified. Our reading, not legal advice.</text>
    </svg>
  );
}

const STEPS = [
  { date: "31 May 2024", label: "AMLR adopted", short: ["AMLR", "adopted"], done: true },
  { date: "30 Dec 2024", label: "MiCA applies", short: ["MiCA", "applies"], done: true },
  { date: "1 Jul 2026", label: "MiCA transition ends", short: ["MiCA transition", "ends"], done: true },
  { date: "10 Jul 2027", label: "AMLR applies", short: ["AMLR", "applies"], done: false },
  { date: "during 2028", label: "AMLA direct supervision", short: ["AMLA direct", "supervision"], done: false },
];

/** Key dates (wide). */
export function EuTimelineArt() {
  const x0 = 60;
  const step = 120;
  return (
    <svg viewBox="0 0 600 160" width="100%" role="img" aria-label="Timeline: AMLR adopted 31 May 2024. MiCA applies from 30 December 2024. MiCA's transitional period for existing providers ends no later than 1 July 2026. The AMLR, including Article 79, applies from 10 July 2027. AMLA plans to start direct supervision during 2028.">
      <path d={`M ${x0} 70 H ${x0 + step * 2.5}`} stroke={INK} strokeWidth="2" />
      <path d={`M ${x0 + step * 2.5} 70 H ${x0 + step * 4}`} stroke={CLAY} strokeWidth="2" strokeDasharray="6 6" />
      {STEPS.map((s, i) => {
        const x = x0 + i * step;
        const [l1, l2] = s.short;
        return (
          <g key={s.label}>
            <circle cx={x} cy={70} r="9" fill={s.done ? INK : PAPER} stroke={s.done ? INK : CLAY} strokeWidth="1.8" />
            <text x={x} y="38" textAnchor="middle" fontSize="14" fill={s.done ? GREY : CLAY} style={LABEL}>{s.date}</text>
            <text x={x} y="108" textAnchor="middle" fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{l1}</text>
            <text x={x} y="128" textAnchor="middle" fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{l2}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Key dates (phone, vertical). */
export function EuTimelineNarrow() {
  const y0 = 36;
  const step = 64;
  return (
    <svg viewBox="0 0 360 380" style={{ width: "100%", height: "auto" }} role="img" aria-label="Timeline: AMLR adopted 31 May 2024. MiCA applies from 30 December 2024. MiCA's transitional period for existing providers ends no later than 1 July 2026. The AMLR, including Article 79, applies from 10 July 2027. AMLA plans to start direct supervision during 2028.">
      <path d={`M 50 ${y0} V ${y0 + step * 2.5}`} stroke={INK} strokeWidth="2" />
      <path d={`M 50 ${y0 + step * 2.5} V ${y0 + step * 4}`} stroke={CLAY} strokeWidth="2" strokeDasharray="6 6" />
      {STEPS.map((s, i) => {
        const y = y0 + i * step;
        return (
          <g key={s.label}>
            <circle cx={50} cy={y} r="9" fill={s.done ? INK : PAPER} stroke={s.done ? INK : CLAY} strokeWidth="1.8" />
            <text x="80" y={y - 4} fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{s.label}</text>
            <text x="80" y={y + 16} fontSize="13" fill={s.done ? GREY : CLAY} style={LABEL}>{s.date}</text>
          </g>
        );
      })}
      <text x="180" y="358" textAnchor="middle" fontSize="12" fill={GREY} style={LABEL}>From the regulations and AMLA&apos;s timeline.</text>
    </svg>
  );
}
