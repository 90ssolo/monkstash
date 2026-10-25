import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Wide diagrams for the "How to use Monero" pillar. Phone versions live in
 * UseMoneroPillarNarrowArt.tsx; pair them with <Adaptive> from WhatIsMoneroNarrowArt.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";
const MONO = "var(--font-mono)";

export const JOURNEY = [
  { title: "Get a wallet", a: "Keys made and kept", b: "on your own device", wide: "Keys are made and kept on your device" },
  { title: "Back up 25 words", a: "On paper, offline,", b: "before any money", wide: "On paper, offline, before any money" },
  { title: "Get some XMR", a: "Start with a small", b: "test amount", wide: "Start with a small test amount" },
  { title: "Receive", a: "Share an address", b: "or a QR code", wide: "Share your address or a QR code" },
  { title: "Send", a: "Check the address", b: "and fee, then send", wide: "Check the address and fee, then send" },
  { title: "Confirm", a: "Spendable after 10", b: "blocks (~20 min)", wide: "Spendable after 10 blocks, about 20 min" },
];

/** Hero: the whole journey as a snake of six stations. Step 2 is the one you cannot redo. */
export function JourneyArt() {
  const pos = [
    { x: 16, y: 44 }, { x: 200, y: 44 }, { x: 384, y: 44 },
    { x: 384, y: 214 }, { x: 200, y: 214 }, { x: 16, y: 214 },
  ];
  return (
    <svg viewBox="0 0 560 430" role="img" aria-label="The six steps of using Monero. One, get a wallet: keys are made and kept on your own device. Two, back up the 25 recovery words on paper, offline, before any money goes in. Three, get some XMR, starting with a small test amount. Four, receive by sharing an address or a QR code. Five, send after checking the address and the fee. Six, confirm: received money is spendable after 10 blocks, about 20 minutes. Steps one to three happen once; after that it is receive, send and confirm." style={{ width: "100%", height: "auto" }}>
      <text x="16" y="24" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>USING MONERO, END TO END</text>
      {/* connectors */}
      <path d="M184 104 h16 M368 104 h16" stroke={FOREST} strokeWidth="1.6" />
      <path d="M468 164 v50" stroke={FOREST} strokeWidth="1.6" />
      <path d="M384 274 h-16 M200 274 h-16" stroke={FOREST} strokeWidth="1.6" />
      <path d="M194 99 l6 5 l-6 5 M378 99 l6 5 l-6 5 M463 208 l5 6 l5 -6 M374 269 l-6 5 l6 5 M190 269 l-6 5 l6 5" fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {JOURNEY.map((s, i) => {
        const { x, y } = pos[i]!;
        const key = i === 1;
        const c = key ? CLAY : FOREST;
        return (
          <g key={s.title}>
            <rect x={x} y={y} width="168" height="120" rx="4" fill={key ? PAPER : CARD} stroke={c} strokeWidth={key ? 1.8 : 1.2} />
            <circle cx={x + 26} cy={y + 28} r="13" fill={c} />
            <text x={x + 26} y={y + 33} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{i + 1}</text>
            {key ? <text x={x + 156} y={y + 32} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="1" fill={CLAY}>NO REDO</text> : null}
            <text x={x + 16} y={y + 70} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>{s.title}</text>
            <text x={x + 16} y={y + 92} fontSize="12" fill={INK}>{s.a}</text>
            <text x={x + 16} y={y + 108} fontSize="12" fill={INK}>{s.b}</text>
          </g>
        );
      })}
      <rect x="16" y="356" width="536" height="60" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <MoneroSymbol variant="color" size={28} x={32} y={372} />
      <text x="74" y="382" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>Steps 1 to 3 happen once.</text>
      <text x="74" y="402" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>After that, using Monero is receive, send and confirm.</text>
    </svg>
  );
}

const ADDRESS_TYPES = [
  {
    label: "PRIMARY ADDRESS", sample: "4…", f1: "Starts with 4", f2: "95 characters",
    l1: "Your wallet's first", l2: "address. Fine to share,", l3: "but the same for everyone.",
  },
  {
    label: "SUBADDRESS", sample: "8…", f1: "Starts with 8", f2: "95 characters",
    l1: "As many as you like.", l2: "One per payer, so payers", l3: "cannot link each other.",
  },
  {
    label: "INTEGRATED ADDRESS", sample: "4…+ID", f1: "106 characters", f2: "Has a payment ID",
    l1: "Address plus an 8-byte", l2: "payment ID. Used by shops", l3: "and exchanges to sort.",
  },
];

/** Three kinds of Monero address, and what each one is for. */
export function AddressTypesArt() {
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Three kinds of Monero address. A primary address starts with 4 and is 95 characters: your wallet's first address, fine to share but the same for everyone. A subaddress starts with 8 and is 95 characters: you can make as many as you like, one per payer, so payers cannot link each other. An integrated address is 106 characters: a primary address plus an 8-byte payment ID, used by shops and exchanges to sort incoming payments. All three pay into the same wallet." style={{ width: "100%", height: "auto" }}>
      {ADDRESS_TYPES.map((t, i) => {
        const x = 8 + i * 212;
        const sub = i === 1;
        return (
          <g key={t.label}>
            <rect x={x} y="8" width="200" height="236" rx="4" fill={sub ? PAPER : CARD} stroke={sub ? FOREST : INK} strokeWidth={sub ? 1.8 : 1.2} />
            <text x={x + 16} y="34" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={sub ? FOREST : MUTED}>{t.label}</text>
            <text x={x + 16} y="82" fontFamily={MONO} fontSize="32" fill={sub ? FOREST : INK}>{t.sample}</text>
            <rect x={x + 16} y="100" width="168" height="28" rx="3" fill={CARD} stroke={FOREST} strokeOpacity="0.35" />
            <text x={x + 26} y="119" fontSize="12.5" fontWeight="700" fill={FOREST}>{t.f1}</text>
            <rect x={x + 16} y="134" width="168" height="28" rx="3" fill={CARD} stroke={FOREST} strokeOpacity="0.35" />
            <text x={x + 26} y="153" fontSize="12.5" fontWeight="700" fill={FOREST}>{t.f2}</text>
            <text x={x + 16} y="190" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{t.l1}</text>
            <text x={x + 16} y="208" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{t.l2}</text>
            <text x={x + 16} y="226" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{t.l3}</text>
          </g>
        );
      })}
      <text x="320" y="282" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>All three pay into the same wallet. Day to day, use a fresh subaddress per payer.</text>
    </svg>
  );
}

export const CLOCK = [
  { when: "0:00", title: "Sent", a: "You confirm in", b: "your wallet" },
  { when: "seconds", title: "Seen", a: "Recipient's wallet", b: "spots it, unconfirmed" },
  { when: "~2 min", title: "1 confirmation", a: "About 2 minutes,", b: "in the next block" },
  { when: "~20 min", title: "Spendable", a: "After 10 blocks,", b: "about 20 minutes" },
];

/** How long a Monero payment takes: sent, seen, first confirmation, spendable. */
export function PaymentClockArt() {
  const xs = [75, 215, 345, 535];
  return (
    <svg viewBox="0 0 620 240" role="img" aria-label="The clock of one Monero payment. At zero you confirm the send. Within seconds the recipient's wallet sees it as unconfirmed. In about 2 minutes it gets its first confirmation in the next block. After 10 blocks, about 20 minutes, the recipient can spend it. Block times vary, so these are averages." style={{ width: "100%", height: "auto" }}>
      <line x1="40" y1="100" x2="580" y2="100" stroke={INK} strokeWidth="1.4" />
      <text x="440" y="54" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>10 BLOCKS</text>
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={345 + i * 21.1 - 7.5} y="66" width="15" height="15" rx="2" fill={FOREST} opacity={0.25 + i * 0.075} />
      ))}
      {CLOCK.map((c, i) => {
        const x = xs[i]!;
        const last = i === 3;
        return (
          <g key={c.title}>
            <text x={x} y="40" textAnchor="middle" fontFamily={MONO} fontSize="12" fill={MUTED}>{c.when}</text>
            <circle cx={x} cy="100" r="9" fill={last ? CLAY : FOREST} />
            <text x={x} y="138" textAnchor="middle" fontSize="14" fontWeight="700" fill={last ? CLAY : FOREST}>{c.title}</text>
            <text x={x} y="160" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{c.a}</text>
            <text x={x} y="178" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{c.b}</text>
          </g>
        );
      })}
      <text x="310" y="224" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>Block times vary, so these are averages. Spacing is not to scale.</text>
    </svg>
  );
}

/** Proving a payment with a signed proof. */
export function ProvePaymentArt() {
  const chips = ["Transaction ID", "Signed proof", "Recipient's address"];
  return (
    <svg viewBox="0 0 600 270" role="img" aria-label="How to prove a Monero payment. You, the sender, hand over three things: the transaction ID, a signed payment proof, and the recipient's address. The other person's wallet checks them. They then see the amount that transaction sent to that address, and how many confirmations it has. This proves the payment was sent. It does not prove the money is still unspent." style={{ width: "100%", height: "auto" }}>
      <rect x="8" y="12" width="200" height="176" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="24" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>You, the sender</text>
      {chips.map((c, i) => (
        <g key={c}>
          <rect x="20" y={58 + i * 40} width="176" height="30" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
          <text x="32" y={78 + i * 40} fontSize="13" fill={FOREST} fontWeight="700">{c}</text>
        </g>
      ))}
      <path d="M210 100 h24 M228 94 l6 6 l-6 6" fill="none" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="238" y="62" width="144" height="76" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <text x="310" y="92" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Their wallet</text>
      <text x="310" y="116" textAnchor="middle" fontFamily={MONO} fontSize="12" fill={INK}>check tx proof</text>
      <path d="M384 100 h24 M402 94 l6 6 l-6 6" fill="none" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="412" y="12" width="180" height="176" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="428" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={FOREST}>They see</text>
      {["The amount sent", "to that address", "Confirmations so far"].map((t, i) => (
        <text key={t} x="428" y={78 + i * 26} fontSize="13" fill={INK}>{t}</text>
      ))}
      <path d="M428 160 l5 5 l10 -11" fill="none" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="450" y="166" fontSize="12" fill={FOREST} fontWeight="700">Nothing else</text>
      <rect x="8" y="208" width="584" height="48" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="300" y="237" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>It proves the payment was sent. It does not prove the money is still unspent.</text>
    </svg>
  );
}

export const TROUBLE = [
  { q: "Connected to a node?", arrow: "No", fix: "Wallet not connecting", a: "Try another node. Check your internet,", b: "the port and the network type." },
  { q: "Fully synced?", arrow: "No", fix: "Wallet not syncing", a: "Give it time, then switch nodes. A count", b: "that never moves usually means a bad node." },
  { q: "Synced, still zero?", arrow: "Yes", fix: "Balance not showing", a: "Check the restore height, locked funds,", b: "and that it is the right wallet." },
];

/** Decision flow for a wallet that shows the wrong balance. */
export function TroubleshootArt() {
  return (
    <svg viewBox="0 0 600 320" role="img" aria-label="A three-question check for a wallet that shows zero or the wrong balance. First, is the wallet connected to a node? If not, the wallet is not connecting: try another node and check your internet, the port and the network type. If it is connected, is it fully synced? If not, the wallet is not syncing: give it time, then switch nodes, because a count that never moves usually means a bad node. If it is synced and still shows zero, check the restore height, locked funds, and that it is the right wallet." style={{ width: "100%", height: "auto" }}>
      <text x="8" y="20" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>BALANCE LOOKS WRONG? ASK IN THIS ORDER</text>
      {TROUBLE.map((t, i) => {
        const y = 36 + i * 96;
        return (
          <g key={t.q}>
            <rect x="8" y={y} width="220" height="64" rx="32" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
            <text x="118" y={y + 38} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>{t.q}</text>
            <path d={`M228 ${y + 32} h70 M292 ${y + 26} l6 6 l-6 6`} fill="none" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="262" y={y + 24} textAnchor="middle" fontSize="12" fontWeight="700" fill={CLAY}>{t.arrow}</text>
            <rect x="302" y={y} width="290" height="76" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.2" />
            <text x="316" y={y + 24} fontSize="13.5" fontWeight="700" fill={INK}>{t.fix}</text>
            <text x="316" y={y + 46} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{t.a}</text>
            <text x="316" y={y + 64} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{t.b}</text>
            {i < 2 ? (
              <>
                <path d={`M118 ${y + 64} v32 M112 ${y + 90} l6 6 l6 -6`} fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <text x="130" y={y + 84} fontSize="12" fontWeight="700" fill={FOREST}>Yes</text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
