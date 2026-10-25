import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figures for "Is a Monero web wallet safe?". Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const MINT = "#e4efe7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;
const SANS = { fontFamily: "var(--font-sans)" } as const;

const TYPES_ARIA =
  "Three kinds of Monero web wallet, by who holds what. Custodial: the company holds your keys and can spend your money. Light wallet server: you keep the spend key, but the server holds your view key and sees your incoming payments. Local scan, like MonkStash: both keys stay in your browser; a node only sees which blocks are requested.";

const TYPES = [
  { title: "Custodial", keys: "company holds your keys", sees: "can spend your money", tone: CLAY },
  { title: "Light wallet server", keys: "you keep the spend key", sees: "server has your view key", tone: CLAY },
  { title: "Local scan (MonkStash)", keys: "both keys in your browser", sees: "node sees block requests", tone: FOREST },
];

function TypeCard({ x, y, w, t }: { x: number; y: number; w: number; t: (typeof TYPES)[number] }) {
  const safe = t.tone === FOREST;
  return (
    <g>
      <rect x={x} y={y} width={w} height={120} rx="5" fill={safe ? MINT : PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 28} fontSize="15" fill={FOREST} textAnchor="middle" style={LABEL}>{t.title}</text>
      <path d={`M${x + 16} ${y + 42} H${x + w - 16}`} stroke={GREY} strokeWidth="0.8" opacity="0.5" />
      <text x={x + w / 2} y={y + 68} fontSize="12.5" fill={FOREST} textAnchor="middle" style={SANS}>{t.keys}</text>
      <text x={x + w / 2} y={y + 94} fontSize="12.5" fill={t.tone} textAnchor="middle" style={SANS}>{t.sees}</text>
    </g>
  );
}

function TypesWide() {
  return (
    <svg viewBox="0 0 720 190" width="100%" role="img" aria-label={TYPES_ARIA}>
      {TYPES.map((t, i) => <TypeCard key={t.title} x={14 + i * 236} y={20} w={220} t={t} />)}
      <text x={360} y={176} fontSize="13" fill={GREY} textAnchor="middle" style={LABEL}>more control, less trust in someone else: left to right</text>
    </svg>
  );
}

function TypesNarrow() {
  return (
    <svg viewBox="0 0 360 430" width="100%" role="img" aria-label={TYPES_ARIA}>
      {TYPES.map((t, i) => <TypeCard key={t.title} x={40} y={10 + i * 136} w={280} t={t} />)}
      <text x={180} y={422} fontSize="13" fill={GREY} textAnchor="middle" style={LABEL}>more control as you go down</text>
    </svg>
  );
}

/** Custodial, light wallet server and local-scan web wallets compared. */
export function WebWalletTypesArt() {
  return <Adaptive wide={<TypesWide />} narrow={<TypesNarrow />} />;
}

const FLOW_ARIA =
  "Who can see what when you use MonkStash. Your browser holds the recovery words and keys, encrypted with your password, and scans blocks for your payments. Our server sends the wallet's code and relays requests: it sees your IP address and which blocks your wallet asks for, never your keys or balance. The Monero node sees our server's address and the same requests. With your own node, the relay drops out.";

function Box({ x, y, w, h, title, lines, fill }: { x: number; y: number; w: number; h: number; title: string; lines: string[]; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={fill} stroke={FOREST} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 26} fontSize="15" fill={FOREST} textAnchor="middle" style={LABEL}>{title}</text>
      {lines.map((l, i) => (
        <text key={l} x={x + w / 2} y={y + 54 + i * 20} fontSize="12" fill={i === lines.length - 1 && fill === PAPER ? CLAY : FOREST} textAnchor="middle" style={SANS}>{l}</text>
      ))}
    </g>
  );
}

const DEVICE = ["recovery words and keys,", "encrypted with your password;", "scans blocks for your payments"];
const SERVER = ["sends the wallet's code;", "relays requests: sees your IP", "never your keys or balance"];
const NODE = ["sees our server's address", "and the block requests", "never your keys"];

function FlowWide() {
  return (
    <svg viewBox="0 0 720 200" width="100%" role="img" aria-label={FLOW_ARIA}>
      <Box x={14} y={20} w={216} h={130} title="Your browser" lines={DEVICE} fill={MINT} />
      <Box x={252} y={20} w={216} h={130} title="Our server" lines={SERVER} fill={PAPER} />
      <Box x={490} y={20} w={216} h={130} title="A Monero node" lines={NODE} fill={PAPER} />
      <path d="M232 85 H248 M242 80 L248 85 L242 90 M470 85 H486 M480 80 L486 85 L480 90" stroke={CLAY} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M122 154 C 122 184, 598 184, 598 154" stroke={FOREST} strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
      <text x={360} y={194} fontSize="12.5" fill={FOREST} textAnchor="middle" style={LABEL}>with your own node, the relay drops out</text>
    </svg>
  );
}

function FlowNarrow() {
  return (
    <svg viewBox="0 0 360 470" width="100%" role="img" aria-label={FLOW_ARIA}>
      <Box x={40} y={10} w={280} h={120} title="Your browser" lines={DEVICE} fill={MINT} />
      <Box x={40} y={160} w={280} h={120} title="Our server" lines={SERVER} fill={PAPER} />
      <Box x={40} y={310} w={280} h={120} title="A Monero node" lines={NODE} fill={PAPER} />
      <path d="M180 134 V156 M175 150 L180 156 L185 150 M180 284 V306 M175 300 L180 306 L185 300" stroke={CLAY} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={180} y={458} fontSize="12.5" fill={FOREST} textAnchor="middle" style={LABEL}>with your own node, the relay drops out</text>
    </svg>
  );
}

/** What the browser, our server and the node each see. */
export function WebWalletFlowArt() {
  return <Adaptive wide={<FlowWide />} narrow={<FlowNarrow />} />;
}
