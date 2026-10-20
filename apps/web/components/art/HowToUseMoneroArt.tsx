import { MoneroSymbol } from "./MoneroSymbol";

/** Figures for the "How to use Monero" hub guide. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** The seven steps from nothing to confident. */
export function JourneyMapArt() {
  const steps = [
    { n: 1, t: "Get a wallet", x: 90, y: 70 },
    { n: 2, t: "Back up your words", x: 270, y: 70 },
    { n: 3, t: "Get some XMR", x: 450, y: 70 },
    { n: 4, t: "Receive", x: 630, y: 70 },
    { n: 5, t: "Send", x: 180, y: 200 },
    { n: 6, t: "Spend", x: 360, y: 200 },
    { n: 7, t: "Stay private and safe", x: 540, y: 200 },
  ];
  return (
    <svg viewBox="0 0 720 290" width="100%" role="img" aria-label="Seven steps to using Monero: get a wallet, back up your words, get some XMR, receive, send, spend, and stay private and safe.">
      <path d="M 90 70 L 630 70 C 700 70 700 135 630 135 L 180 135 C 110 135 110 200 180 200 L 540 200" stroke={FOREST} strokeWidth="1.4" fill="none" strokeDasharray="5 4" opacity="0.6" />
      {steps.map((s) => (
        <g key={s.n}>
          <circle cx={s.x} cy={s.y} r="26" fill={PAPER} stroke={s.n === 2 ? CLAY : FOREST} strokeWidth="1.6" />
          <text x={s.x} y={s.y + 7} fontSize="22" textAnchor="middle" fill={s.n === 2 ? CLAY : FOREST} style={LABEL}>{s.n}</text>
          <text x={s.x} y={s.y + 50} fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>{s.t}</text>
        </g>
      ))}
      <text x="270" y="124" fontSize="12" textAnchor="middle" fill={CLAY} style={LABEL}>the one step you cannot redo</text>
      <text x="360" y="275" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Most people finish steps 1 to 4 in under an hour.</text>
    </svg>
  );
}

/** Receiving and sending side by side. */
export function ReceiveSendArt() {
  const receive = ["Copy your address or show the QR", "The sender pays it", "Your wallet finds the payment", "Spendable after 10 confirmations"];
  const send = ["Paste their address, enter an amount", "Check the fee, then confirm", "The network adds it to a block", "They see it within a few minutes"];
  const box = (rows: string[], y: number, color: string, id: string) =>
    rows.map((t, i) => {
      const x = 130 + i * 148;
      const parts = t.length > 20 ? [t.slice(0, t.lastIndexOf(" ", 20)), t.slice(t.lastIndexOf(" ", 20) + 1)] : [t];
      return (
        <g key={`${id}${i}`}>
          <rect x={x} y={y} width="128" height="76" rx="4" fill={PAPER} stroke={color} strokeWidth="1.4" />
          <text x={x + 10} y={y + 20} fontSize="12" fill={color} style={LABEL}>{i + 1}</text>
          {parts.map((p, k) => (
            <text key={k} x={x + 64} y={y + 40 + k * 16} fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>{p}</text>
          ))}
          {i < 3 ? <path d={`M ${x + 130} ${y + 38} L ${x + 146} ${y + 38} M ${x + 141} ${y + 33} L ${x + 146} ${y + 38} L ${x + 141} ${y + 43}`} stroke={color} strokeWidth="1.4" fill="none" /> : null}
        </g>
      );
    });
  return (
    <svg viewBox="0 0 720 260" width="100%" role="img" aria-label="Receiving: copy your address, the sender pays it, your wallet finds it, spendable after 10 confirmations. Sending: paste the address and amount, check the fee, the network adds it to a block, the recipient sees it within minutes.">
      <text x="24" y="70" fontSize="18" fill={FOREST} style={LABEL}>Receive</text>
      <text x="24" y="210" fontSize="18" fill={CLAY} style={LABEL}>Send</text>
      {box(receive, 32, FOREST, "r")}
      {box(send, 172, CLAY, "s")}
    </svg>
  );
}

/** Where Monero's privacy comes from, and what it does not cover. */
export function PrivacySourceArt() {
  const cards = [
    { x: 24, t: "Ring signatures", a: "Your spend is mixed with", b: "decoys, so the sender is hidden" },
    { x: 260, t: "Stealth addresses", a: "Every payment goes to a one-time", b: "address, so the receiver is hidden" },
    { x: 496, t: "RingCT", a: "The amount is hidden", b: "but still checked by the network" },
  ];
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Monero hides the sender with ring signatures, the receiver with stealth addresses, and the amount with RingCT. Your choice of node and what you tell people are still up to you.">
      <MoneroSymbol x={322} y={8} size={76} variant="color" />
      {cards.map((c) => (
        <g key={c.t}>
          <path d={`M 360 88 L ${c.x + 100} 130`} stroke={FOREST} strokeWidth="1.2" fill="none" opacity="0.7" />
          <rect x={c.x} y="130" width="200" height="96" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
          <text x={c.x + 100} y="160" fontSize="16" textAnchor="middle" fill={FOREST} style={LABEL}>{c.t}</text>
          <text x={c.x + 100} y="188" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>{c.a}</text>
          <text x={c.x + 100} y="206" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>{c.b}</text>
        </g>
      ))}
      <rect x="24" y="244" width="672" height="40" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="360" y="269" fontSize="13.5" textAnchor="middle" fill={CLAY} style={LABEL}>Still up to you: which node you connect to, who you tell, and where your words are kept.</text>
    </svg>
  );
}
