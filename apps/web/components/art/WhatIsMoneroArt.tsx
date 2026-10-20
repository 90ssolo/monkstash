import { MoneroSymbol } from "./MoneroSymbol";

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";
const MONO = "var(--font-mono)";

/** Hero: the same three payments on a public ledger and on Monero's ledger. */
export function LedgerContrastArt() {
  const rows = [
    { from: "bc1q8f…7k2", to: "bc1qa2…m9x", amt: "0.84 BTC" },
    { from: "bc1qa2…m9x", to: "bc1q3t…v0e", amt: "0.21 BTC" },
    { from: "bc1q8f…7k2", to: "bc1qz7…p4c", amt: "1.50 BTC" },
  ];
  return (
    <svg viewBox="0 0 520 440" role="img" aria-label="Two ledgers recording the same three payments. On a public ledger, every sender address, receiver address and amount can be read, and repeated addresses link payments together. On Monero's ledger, each sender is one of 16 possible signers, each receiver is a fresh one-time address, and every amount is hidden." style={{ width: "100%", height: "auto" }}>
      {/* public ledger */}
      <rect x="8" y="8" width="504" height="190" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="28" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={INK}>A public ledger</text>
      <text x="492" y="40" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>anyone can read this</text>
      {["From", "To", "Amount"].map((h, i) => (
        <text key={h} x={[28, 196, 396][i]} y="68" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{h.toUpperCase()}</text>
      ))}
      {rows.map((r, i) => {
        const y = 82 + i * 34;
        const linked = r.from === "bc1q8f…7k2";
        return (
          <g key={i}>
            <rect x="20" y={y} width="480" height="26" rx="2" fill={i % 2 ? PAPER : CARD} />
            <text x="28" y={y + 17} fontFamily={MONO} fontSize="12.5" fill={linked ? CLAY : INK} fontWeight={linked ? 700 : 400}>{r.from}</text>
            <text x="196" y={y + 17} fontFamily={MONO} fontSize="12.5" fill={INK}>{r.to}</text>
            <text x="396" y={y + 17} fontFamily={MONO} fontSize="12.5" fill={INK}>{r.amt}</text>
          </g>
        );
      })}
      <path d="M118 99 C 150 120, 150 152, 118 166" fill="none" stroke={CLAY} strokeWidth="1.4" strokeDasharray="3 3" />
      <text x="28" y="190" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={CLAY}>Same sender twice: anyone can link these payments and add up the balance.</text>

      {/* Monero ledger */}
      <rect x="8" y="226" width="504" height="206" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <MoneroSymbol variant="color" size={24} x={24} y={243} />
      <text x="56" y="261" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={FOREST}>Monero&apos;s ledger</text>
      <text x="492" y="261" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>only the people involved can read it</text>
      {["From", "To", "Amount"].map((h, i) => (
        <text key={h} x={[28, 196, 396][i]} y="290" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{h.toUpperCase()}</text>
      ))}
      {[0, 1, 2].map((i) => {
        const y = 304 + i * 34;
        return (
          <g key={i}>
            <rect x="20" y={y} width="480" height="26" rx="2" fill={i % 2 ? CARD : PAPER} stroke={FOREST} strokeOpacity="0.18" />
            {Array.from({ length: 16 }).map((_, d) => (
              <circle key={d} cx={30 + d * 8.6} cy={y + 13} r="2.6" fill={FOREST} opacity={0.28} />
            ))}
            <rect x="196" y={y + 8} width="150" height="10" rx="2" fill={FOREST} opacity="0.22" />
            <rect x="396" y={y + 8} width="84" height="10" rx="2" fill={FOREST} opacity="0.22" />
          </g>
        );
      })}
      <text x="28" y="420" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>1 of 16 signers</text>
      <text x="196" y="420" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>new one-time address</text>
      <text x="396" y="420" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>amount hidden</text>
    </svg>
  );
}

function Lock({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <rect x="-9" y="-2" width="18" height="14" rx="2.5" fill={CARD} />
      <path d="M-5.5 -2 v-4 a5.5 5.5 0 0 1 11 0 v4" />
      <circle cx="0" cy="5" r="1.4" fill={color} stroke="none" />
    </g>
  );
}

/** The three secrets of a payment, and the tool that hides each one. */
export function ThreeSecretsArt() {
  const cols = [
    { label: "Who paid", tool: "Ring signatures", note: "your signature hides among 15 decoys" },
    { label: "Who got paid", tool: "Stealth addresses", note: "a fresh address for every payment" },
    { label: "How much", tool: "RingCT", note: "amounts encrypted, totals still checked" },
  ];
  return (
    <svg viewBox="0 0 600 250" role="img" aria-label="A Monero payment has three secrets. Ring signatures hide who paid, stealth addresses hide who got paid, and RingCT hides how much was sent." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="20" width="580" height="96" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="28" y="14" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ONE MONERO PAYMENT</text>
      {cols.map((c, i) => {
        const x = 10 + i * 193.3;
        return (
          <g key={c.label}>
            {i > 0 ? <line x1={x} y1="20" x2={x} y2="116" stroke={INK} strokeWidth="1" /> : null}
            <text x={x + 96} y="52" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={INK}>{c.label}</text>
            <rect x={x + 36} y="68" width="120" height="12" rx="2" fill={FOREST} opacity="0.22" />
            <Lock x={x + 96} y={92} color={FOREST} />
            <line x1={x + 96} y1="116" x2={x + 96} y2="150" stroke={CLAY} strokeWidth="1.4" strokeDasharray="3 3" />
            <rect x={x + 16} y="150" width="160" height="40" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
            <text x={x + 96} y="175" textAnchor="middle" fontWeight="700" fontSize="14" fill={FOREST}>{c.tool}</text>
            <text x={x + 96} y="214" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{c.note}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** What Monero hides on the blockchain, versus what can still leak around it. */
export function HiddenVsLeakArt() {
  const hidden = ["Sender", "Receiver", "Amount", "Your balance", "Your payment history"];
  const leaks = ["Your IP address, seen by the node", "Exchange records tied to your ID", "Addresses you post in public", "Screenshots and chat messages", "Timing you reveal yourself"];
  return (
    <svg viewBox="0 0 600 260" role="img" aria-label="Left, what Monero hides on the blockchain: sender, receiver, amount, balance and payment history. Right, what can still leak around it: your IP address, exchange records tied to your identity, addresses you post publicly, screenshots and chats, and timing you reveal yourself." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="282" height="240" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="28" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={FOREST}>Hidden by Monero</text>
      <text x="28" y="62" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ON THE BLOCKCHAIN</text>
      {hidden.map((h, i) => (
        <g key={h}>
          <circle cx="38" cy={92 + i * 32} r="9" fill={FOREST} />
          <path d={`M33.5 ${92 + i * 32} l3 3 l5.5 -6`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="56" y={97 + i * 32} fontSize="14" fill={INK}>{h}</text>
        </g>
      ))}
      <rect x="308" y="10" width="282" height="240" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="326" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={CLAY}>Can still leak</text>
      <text x="326" y="62" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>AROUND IT, SO HABITS MATTER</text>
      {leaks.map((h, i) => (
        <g key={h}>
          <circle cx="336" cy={92 + i * 32} r="9" fill="none" stroke={CLAY} strokeWidth="1.6" />
          <path d={`M336 ${87 + i * 32} v5.5`} stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="336" cy={96 + i * 32} r="1.1" fill={CLAY} />
          <text x="354" y={97 + i * 32} fontSize="12.5" fill={INK}>{h}</text>
        </g>
      ))}
    </svg>
  );
}

/** Emission shape: a fast early curve, then a small permanent tail from May 2022. Not to scale. */
export function EmissionShapeArt() {
  return (
    <svg viewBox="0 0 600 270" role="img" aria-label="A sketch of Monero's supply over time, not to scale. New coins were issued quickly in the early years, the curve flattened, and from the end of May 2022 a small fixed reward of 0.6 XMR per block continues forever, so supply keeps growing slowly." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="580" height="250" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <line x1="60" y1="210" x2="560" y2="210" stroke={INK} strokeWidth="1.2" />
      <line x1="60" y1="40" x2="60" y2="210" stroke={INK} strokeWidth="1.2" />
      <text x="70" y="40" fontSize="10" fontWeight="700" letterSpacing="1.4" fill={MUTED}>TOTAL SUPPLY</text>
      {[["2014", 60], ["2018", 190], ["2022", 330], ["2026", 450], ["later", 545]].map(([l, x]) => (
        <text key={l} x={Number(x)} y="230" textAnchor="middle" fontSize="11" fill={MUTED}>{l}</text>
      ))}
      <path d="M60 210 C 120 110, 200 80, 330 70" fill="none" stroke={FOREST} strokeWidth="3" />
      <path d="M330 70 L 560 50" fill="none" stroke={CLAY} strokeWidth="3" />
      <circle cx="330" cy="70" r="5" fill={CLAY} />
      <line x1="330" y1="70" x2="330" y2="210" stroke={CLAY} strokeWidth="1" strokeDasharray="3 3" />
      <text x="150" y="150" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>main emission:</text>
      <text x="150" y="168" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>rewards shrink over time</text>
      <text x="350" y="104" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>tail emission, from May 2022:</text>
      <text x="350" y="122" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>0.6 XMR per block, forever</text>
      <text x="350" y="140" fontSize="11" fill={MUTED}>a slowly shrinking percentage each year</text>
      <text x="560" y="250" textAnchor="end" fontSize="10" fill={MUTED}>shape only, not to scale</text>
    </svg>
  );
}
