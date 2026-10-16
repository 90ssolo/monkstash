import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Phone layouts for the How to Buy Monero diagrams. Drawn 360 units wide and stacked
 * vertically, so on a 375px screen every label renders at 11px or larger. The wide versions
 * live in BuyMoneroPillarArt.tsx; <Adaptive> (from WhatIsMoneroNarrowArt) picks one.
 * No exchange, marketplace or service is named or pictured: routes are types only.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

function ArrowDown({ x, y1, y2, color = FOREST }: { x: number; y1: number; y2: number; color?: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke={color} strokeWidth="1.6" />
      <path d={`M${x - 5} ${y2 - 8} L${x} ${y2} L${x + 5} ${y2 - 8} Z`} fill={color} />
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

function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g fill="none" stroke={CLAY} strokeWidth="1.5">
      <path d={`M${cx - 8} ${cy} Q${cx} ${cy - 7} ${cx + 8} ${cy} Q${cx} ${cy + 7} ${cx - 8} ${cy} Z`} />
      <circle cx={cx} cy={cy} r="2.2" fill={CLAY} stroke="none" />
    </g>
  );
}

/** Phone hero: the three stages stacked, ending in your own wallet. */
export function BuyPathNarrow() {
  const stages = [
    { title: "You pay", items: ["Bank transfer", "Card", "Cash", "Another coin"], tone: INK },
    { title: "A seller", items: ["Exchange", "Person (P2P)", "Swap service", "Crypto ATM"], tone: CLAY },
    { title: "Your wallet", items: ["Your 25 words", "Keys on your device", "Only you can spend"], tone: FOREST },
  ];
  return (
    <svg viewBox="0 0 360 380" role="img" aria-label="How buying Monero works. You pay with a bank transfer, a card, cash or another coin. A seller, which can be an exchange, a person on a peer-to-peer marketplace, a swap service or a crypto ATM, sends XMR to your own wallet, where your 25 words and keys stay on your device and only you can spend. Withdraw at once: then only your keys can move it." style={{ width: "100%", height: "auto" }}>
      <text x="6" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>FROM PAYMENT TO POCKET</text>
      {stages.map((s, i) => {
        const y = 28 + i * 112;
        const own = i === 2;
        return (
          <g key={s.title}>
            <rect x="4" y={y} width="352" height="88" rx="4" fill={own ? PAPER : CARD} stroke={s.tone} strokeWidth={own ? 1.6 : 1.2} strokeDasharray={i === 1 ? "5 4" : undefined} />
            {own ? <MoneroSymbol variant="color" size={20} x={18} y={y + 12} /> : null}
            <text x={own ? 46 : 20} y={y + 28} fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={s.tone}>{s.title}</text>
            {s.items.map((it, k) => (
              <text key={it} x={k % 2 ? 186 : 20} y={y + 56 + Math.floor(k / 2) * 20} fontSize="12.5" fill={INK}>{it}</text>
            ))}
            {i < 2 ? <ArrowDown x={180} y1={y + 90} y2={y + 110} color={i === 0 ? INK : FOREST} /> : null}
          </g>
        );
      })}
      <text x="8" y="366" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Withdraw at once: then only your keys can move it.</text>
    </svg>
  );
}

/** Phone version of the route chooser: question, then the route to try. */
export function RouteChooserNarrow() {
  const rows = [
    { q: "Already hold another coin, like bitcoin?", a: "Swap it into XMR" },
    { q: "Paying from a bank, fine with ID checks?", a: "A regulated exchange" },
    { q: "Prefer cash, or dealing with a person?", a: "A peer-to-peer trade" },
    { q: "Want cash in at a machine nearby?", a: "An ATM that sells XMR" },
    { q: "Do you sell goods or do paid work?", a: "Earn it: accept XMR" },
    { q: "Have a spare computer and patience?", a: "Mine it on a CPU" },
  ];
  return (
    <svg viewBox="0 0 360 560" role="img" aria-label="Which way to get Monero fits you. If you already hold another coin such as bitcoin, swap it into XMR. If you pay from a bank and are fine with ID checks, use a regulated exchange. If you prefer cash or dealing with a person, use a peer-to-peer trade. If you want to put cash into a machine, use an ATM that sells XMR. If you sell goods or do paid work, earn it by accepting XMR. If you have a spare computer and patience, mine it on an ordinary processor. Whatever you pick, start small, and every route ends in your own wallet." style={{ width: "100%", height: "auto" }}>
      <text x="6" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHICH ROUTE FITS YOU?</text>
      {rows.map((r, i) => {
        const y = 32 + i * 82;
        return (
          <g key={r.q}>
            <text x="8" y={y + 18} fontSize="13" fill={INK}>{r.q}</text>
            <rect x="4" y={y + 28} width="352" height="36" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
            <line x1="18" y1={y + 46} x2="30" y2={y + 46} stroke={CLAY} strokeWidth="1.6" />
            <path d={`M29 ${y + 41} L36 ${y + 46} L29 ${y + 51} Z`} fill={CLAY} />
            <text x="46" y={y + 51} fontSize="13.5" fontWeight="700" fill={FOREST}>{r.a}</text>
          </g>
        );
      })}
      <text x="8" y="530" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>Whatever you pick, start small.</text>
      <text x="8" y="550" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>Every route ends in your own wallet.</text>
    </svg>
  );
}

/** Phone version of the confirmation timeline, drawn top to bottom. */
export function ConfirmTimelineNarrow() {
  const marks = [
    { t: "Seller sends", s: "on its own schedule" },
    { t: "Shows as pending", s: "usually within minutes" },
    { t: "1 confirmation", s: "about 2 minutes later" },
    { t: "Spendable", s: "10 blocks, about 20 minutes" },
  ];
  return (
    <svg viewBox="0 0 360 350" role="img" aria-label="What happens after you withdraw Monero to your own wallet. The seller sends on its own schedule. The payment usually shows as pending within minutes. The first confirmation comes about 2 minutes later. After 10 blocks, about 20 minutes, it becomes spendable. The 10-block lock is a Monero network rule, not a wallet setting." style={{ width: "100%", height: "auto" }}>
      <text x="6" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>FROM &quot;WITHDRAW&quot; TO SPENDABLE</text>
      <line x1="30" y1="50" x2="30" y2="260" stroke={INK} strokeWidth="1.4" />
      <rect x="24" y="190" width="12" height="70" rx="2" fill={FOREST} opacity="0.18" />
      {marks.map((m, i) => {
        const y = 50 + i * 70;
        const last = i === 3;
        return (
          <g key={m.t}>
            <circle cx="30" cy={y} r={last ? 10 : 7} fill={last ? FOREST : CARD} stroke={last ? FOREST : INK} strokeWidth="1.6" />
            {last ? <path d={`M25.5 ${y} l3 3 l6 -6.5`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : null}
            <text x="56" y={y + 5} fontSize="14" fontWeight="700" fill={last ? FOREST : INK}>{m.t}</text>
            <text x="56" y={y + 25} fontSize="12.5" fill={MUTED}>{m.s}</text>
          </g>
        );
      })}
      <text x="350" y="234" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>the 10-block lock</text>
      <text x="8" y="312" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>The 10-block lock is a network rule,</text>
      <text x="8" y="332" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>not a wallet setting.</text>
    </svg>
  );
}

/** Phone version of the fee shape. */
export function FeeStackNarrow() {
  const W = 320;
  const cuts = [
    { label: "Payment method fee", w: 21 },
    { label: "Trading fee", w: 15 },
    { label: "Price spread", w: 24 },
    { label: "Withdrawal fee", w: 13 },
    { label: "Monero network fee", w: 3 },
  ];
  let right = 20 + W;
  return (
    <svg viewBox="0 0 360 450" role="img" aria-label="Where your money goes when you buy Monero, shown as a shape, not to scale. From what you pay, a payment method fee, a trading fee, the price spread and a withdrawal fee can each take a slice, and the Monero network fee is usually tiny. What is left is the XMR that lands in your wallet. Real costs vary by route, amount and payment method, so compare the final XMR amount." style={{ width: "100%", height: "auto" }}>
      <text x="6" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHERE YOUR MONEY GOES</text>
      <text x="20" y="44" fontSize="13" fontWeight="700" fill={INK}>What you pay</text>
      <rect x="20" y="52" width={W} height="20" rx="2" fill={INK} opacity="0.75" />
      {cuts.map((c, i) => {
        const y = 94 + i * 50;
        right -= c.w;
        return (
          <g key={c.label}>
            <text x="20" y={y} fontSize="13" fill={INK}>{c.label}</text>
            <rect x="20" y={y + 8} width={right - 20} height="20" rx="2" fill={INK} opacity="0.08" />
            <rect x={right} y={y + 8} width={c.w} height="20" fill={CLAY} />
          </g>
        );
      })}
      <text x="20" y="346" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Lands in your wallet</text>
      <rect x="20" y="354" width={right - 20} height="20" rx="2" fill={FOREST} />
      <text x="8" y="404" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Illustration only. Real costs vary by</text>
      <text x="8" y="422" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>route, amount and payment method.</text>
      <text x="8" y="440" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Compare the final XMR amount.</text>
    </svg>
  );
}

/** Phone version of who knows what: three stacked panels. */
export function WhoKnowsNarrow() {
  const panels = [
    { title: "The seller knows", sub: "IN ITS OWN RECORDS", items: ["Your ID, if it checked it", "How you paid", "How much XMR you bought", "The address you received at", "When it happened"], ok: false },
    { title: "The blockchain shows", sub: "THE WITHDRAWAL ITSELF", items: ["Sender hidden", "Receiver hidden", "Amount hidden", "Valid, nothing more"], ok: true },
    { title: "Your later moves", sub: "ONCE IT IS YOURS", items: ["Your balance stays hidden", "Your spends hide in rings", "The seller can't follow"], ok: true },
  ];
  let y = 4;
  return (
    <svg viewBox="0 0 360 636" role="img" aria-label="Privacy after you buy Monero. The seller knows, in its own records: your ID if it checked it, how you paid, how much XMR you bought, the address you received it at, and when. On the blockchain, the withdrawal itself hides the sender, the receiver and the amount, and shows only that it was valid. Once it is yours, your balance stays hidden, your spends hide in rings, and the seller cannot follow what you do next. The seller's records stay with the seller, which is why where you buy matters." style={{ width: "100%", height: "auto" }}>
      {panels.map((p, i) => {
        const top = y;
        const h = 72 + p.items.length * 26;
        y = top + h + 24;
        return (
          <g key={p.title}>
            <rect x="4" y={top} width="352" height={h} rx="4" fill={p.ok ? PAPER : CARD} stroke={p.ok ? FOREST : CLAY} strokeWidth="1.3" strokeDasharray={p.ok ? undefined : "5 4"} />
            <text x="20" y={top + 28} fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={p.ok ? FOREST : CLAY}>{p.title}</text>
            <text x="20" y={top + 46} fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{p.sub}</text>
            {p.items.map((t, k) => (
              <g key={t}>
                {p.ok ? <Check cx={30} cy={top + 68 + k * 26} /> : <Eye cx={30} cy={top + 68 + k * 26} />}
                <text x="48" y={top + 72 + k * 26} fontSize="13" fill={INK}>{t}</text>
              </g>
            ))}
            {i < 2 ? <ArrowDown x={180} y1={top + h + 2} y2={top + h + 22} /> : null}
          </g>
        );
      })}
      <text x="8" y="608" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>The seller&apos;s records stay with the seller.</text>
      <text x="8" y="628" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>That is why where you buy matters.</text>
    </svg>
  );
}
