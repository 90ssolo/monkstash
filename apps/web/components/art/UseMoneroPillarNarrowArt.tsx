import { MoneroSymbol } from "./MoneroSymbol";
import { CLOCK, JOURNEY, TROUBLE } from "./UseMoneroPillarArt";

/*
 * Phone layouts for the "How to use Monero" pillar diagrams. Drawn 360 units wide and
 * stacked vertically, so labels render at 11px or larger on a 375px screen. Pair each
 * with its wide version through <Adaptive> (WhatIsMoneroNarrowArt).
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";
const MONO = "var(--font-mono)";

/** Phone hero: the six steps as a vertical list. */
export function JourneyNarrow() {
  return (
    <svg viewBox="0 0 360 520" role="img" aria-label="The six steps of using Monero. One, get a wallet: keys are made and kept on your device. Two, back up the 25 recovery words on paper, offline, before any money goes in. Three, get some XMR, starting with a small test amount. Four, receive by sharing your address or a QR code. Five, send after checking the address and the fee. Six, confirm: received money is spendable after 10 blocks, about 20 minutes. Steps one to three happen once; after that it is receive, send and confirm." style={{ width: "100%", height: "auto" }}>
      <text x="4" y="18" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>USING MONERO, END TO END</text>
      <line x1="30" y1="63" x2="30" y2="393" stroke={FOREST} strokeWidth="1.4" strokeDasharray="3 4" />
      {JOURNEY.map((s, i) => {
        const y = 34 + i * 66;
        const key = i === 1;
        const c = key ? CLAY : FOREST;
        return (
          <g key={s.title}>
            <rect x="4" y={y} width="352" height="58" rx="4" fill={key ? PAPER : CARD} stroke={c} strokeWidth={key ? 1.8 : 1.2} />
            <circle cx="30" cy={y + 29} r="13" fill={c} />
            <text x="30" y={y + 34} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{i + 1}</text>
            <text x="56" y={y + 25} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>{s.title}</text>
            {key ? <text x="344" y={y + 24} textAnchor="end" fontSize="10.5" fontWeight="700" letterSpacing="1" fill={CLAY}>NO REDO</text> : null}
            <text x="56" y={y + 45} fontSize="12.5" fill={INK}>{s.wide}</text>
          </g>
        );
      })}
      <rect x="4" y="442" width="352" height="70" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <MoneroSymbol variant="color" size={26} x={16} y={464} />
      <text x="54" y="472" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>Steps 1 to 3 happen once.</text>
      <text x="54" y="494" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>Then: receive, send, confirm.</text>
    </svg>
  );
}

const ADDRESS_NARROW = [
  { label: "PRIMARY ADDRESS", sample: "4…", fact: "Starts with 4, 95 characters", a: "Your wallet's first address. Fine to", b: "share, but the same for everyone." },
  { label: "SUBADDRESS", sample: "8…", fact: "Starts with 8, 95 characters", a: "As many as you like. One per payer, so", b: "payers cannot link each other." },
  { label: "INTEGRATED ADDRESS", sample: "+ID", fact: "106 characters, has a payment ID", a: "An address plus an 8-byte payment ID.", b: "Used by shops and exchanges to sort." },
];

/** Phone version of the three address types. */
export function AddressTypesNarrow() {
  return (
    <svg viewBox="0 0 360 430" role="img" aria-label="Three kinds of Monero address. A primary address starts with 4 and is 95 characters: your wallet's first address, fine to share but the same for everyone. A subaddress starts with 8 and is 95 characters: make as many as you like, one per payer, so payers cannot link each other. An integrated address is 106 characters: an address plus an 8-byte payment ID, used by shops and exchanges to sort payments. All three pay into the same wallet." style={{ width: "100%", height: "auto" }}>
      {ADDRESS_NARROW.map((t, i) => {
        const y = 4 + i * 128;
        const sub = i === 1;
        return (
          <g key={t.label}>
            <rect x="4" y={y} width="352" height="118" rx="4" fill={sub ? PAPER : CARD} stroke={sub ? FOREST : INK} strokeWidth={sub ? 1.8 : 1.2} />
            <text x="18" y={y + 26} fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={sub ? FOREST : MUTED}>{t.label}</text>
            <text x="340" y={y + 34} textAnchor="end" fontFamily={MONO} fontSize="26" fill={sub ? FOREST : INK}>{t.sample}</text>
            <text x="18" y={y + 54} fontSize="12.5" fontWeight="700" fill={FOREST}>{t.fact}</text>
            <text x="18" y={y + 80} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{t.a}</text>
            <text x="18" y={y + 100} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{t.b}</text>
          </g>
        );
      })}
      <text x="180" y="404" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={FOREST}>All three pay into the same wallet.</text>
      <text x="180" y="424" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={FOREST}>Day to day, use a fresh subaddress per payer.</text>
    </svg>
  );
}

/** Phone version of the payment clock: a vertical timeline. */
export function PaymentClockNarrow() {
  const ys = [40, 110, 180, 380];
  return (
    <svg viewBox="0 0 360 456" role="img" aria-label="The clock of one Monero payment. At zero you confirm the send. Within seconds the recipient's wallet sees it as unconfirmed. In about 2 minutes it gets its first confirmation in the next block. After 10 blocks, about 20 minutes, the recipient can spend it. Block times vary, so these are averages." style={{ width: "100%", height: "auto" }}>
      <line x1="30" y1="40" x2="30" y2="380" stroke={INK} strokeWidth="1.4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x="25.5" y={216 + i * 12.6} width="9" height="9" rx="1.5" fill={FOREST} opacity={0.25 + i * 0.075} />
      ))}
      <text x="56" y="290" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>10 BLOCKS, ABOUT 20 MINUTES</text>
      {CLOCK.map((c, i) => {
        const y = ys[i]!;
        const last = i === 3;
        return (
          <g key={c.title}>
            <circle cx="30" cy={y} r="9" fill={last ? CLAY : FOREST} />
            <text x="56" y={y + 5} fontSize="15" fontWeight="700" fill={last ? CLAY : FOREST}>{c.title}</text>
            <text x="350" y={y + 5} textAnchor="end" fontFamily={MONO} fontSize="12" fill={MUTED}>{c.when}</text>
            <text x="56" y={y + 27} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{c.a} {c.b}</text>
          </g>
        );
      })}
      <text x="4" y="444" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>Block times vary. These are averages, not to scale.</text>
    </svg>
  );
}

/** Phone version of proving a payment. */
export function ProvePaymentNarrow() {
  const chips = ["Transaction ID", "Transaction key", "Recipient's address"];
  const arrow = (y: number) => (
    <path d={`M180 ${y} v22 M174 ${y + 16} l6 6 l6 -6`} fill="none" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  );
  return (
    <svg viewBox="0 0 360 500" role="img" aria-label="How to prove a Monero payment. You, the sender, hand over three things: the transaction ID, the transaction key, and the recipient's address. The other person's wallet checks them. They then see the amount that transaction sent to that address, and how many confirmations it has. This proves the payment was sent. It does not prove the money is still unspent." style={{ width: "100%", height: "auto" }}>
      <rect x="4" y="4" width="352" height="166" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="18" y="32" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>You, the sender</text>
      {chips.map((c, i) => (
        <g key={c}>
          <rect x="16" y={46 + i * 40} width="328" height="30" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
          <text x="28" y={66 + i * 40} fontSize="13" fontWeight="700" fill={FOREST}>{c}</text>
        </g>
      ))}
      {arrow(174)}
      <rect x="4" y="202" width="352" height="64" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <text x="18" y="230" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Their wallet</text>
      <text x="18" y="252" fontFamily={MONO} fontSize="12" fill={INK}>check tx key</text>
      {arrow(270)}
      <rect x="4" y="298" width="352" height="116" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="18" y="326" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={FOREST}>They see</text>
      <text x="18" y="350" fontSize="13" fill={INK}>The amount sent to that address</text>
      <text x="18" y="372" fontSize="13" fill={INK}>Confirmations so far</text>
      <text x="18" y="398" fontSize="12.5" fontWeight="700" fill={FOREST}>Nothing else about your wallet</text>
      <rect x="4" y="428" width="352" height="66" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="180" y="456" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>It proves the payment was sent.</text>
      <text x="180" y="478" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>It does not prove the money is unspent.</text>
    </svg>
  );
}

/** Phone version of the troubleshooting flow. */
export function TroubleshootNarrow() {
  return (
    <svg viewBox="0 0 360 578" role="img" aria-label="A three-question check for a wallet that shows zero or the wrong balance. First, is the wallet connected to a node? If not, the wallet is not connecting: try another node and check your internet, the port and the network type. If it is connected, is it fully synced? If not, the wallet is not syncing: give it time, then switch nodes, because a count that never moves usually means a bad node. If it is synced and still shows zero, check the restore height, locked funds, and that it is the right wallet." style={{ width: "100%", height: "auto" }}>
      <text x="4" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>BALANCE LOOKS WRONG? ASK IN THIS ORDER</text>
      {TROUBLE.map((t, i) => {
        const y = 28 + i * 196;
        return (
          <g key={t.q}>
            <rect x="4" y={y} width="352" height="48" rx="24" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
            <text x="180" y={y + 30} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>{t.q}</text>
            <path d={`M22 ${y + 48} v60 h18`} fill="none" stroke={CLAY} strokeWidth="1.6" />
            <rect x="40" y={y + 58} width="316" height="100" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.2" />
            <text x="54" y={y + 78} fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={CLAY}>{`IF ${t.arrow.toUpperCase()}`}</text>
            <text x="54" y={y + 98} fontSize="13.5" fontWeight="700" fill={INK}>{t.fix}</text>
            <text x="54" y={y + 120} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{t.a}</text>
            <text x="54" y={y + 138} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{t.b}</text>
            {i < 2 ? (
              <>
                <path d={`M12 ${y + 48} v148 M6 ${y + 190} l6 6 l6 -6`} fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <text x="20" y={y + 182} fontSize="12" fontWeight="700" fill={FOREST}>If yes</text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
