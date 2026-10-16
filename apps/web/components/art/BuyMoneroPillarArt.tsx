import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Wide diagrams for the How to Buy Monero pillar. Phone versions live in
 * BuyMoneroPillarNarrowArt.tsx; <Adaptive> shows one or the other.
 * No exchange, marketplace or service is named or pictured anywhere here: routes are types only.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

function ArrowRight({ x1, x2, y, color = FOREST }: { x1: number; x2: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke={color} strokeWidth="1.6" />
      <path d={`M${x2 - 8} ${y - 5} L${x2} ${y} L${x2 - 8} ${y + 5} Z`} fill={color} />
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

/** Hero: money in, a seller in the middle, XMR out to a wallet you control. */
export function BuyPathArt() {
  const stages = [
    { title: "You pay", items: ["Bank transfer", "Card", "Cash", "Another coin"], tone: INK },
    { title: "A seller", items: ["Exchange", "Person (P2P)", "Swap service", "Crypto ATM"], tone: CLAY },
    { title: "Your wallet", items: ["Your 25 words", "Keys on your device", "Only you can spend"], tone: FOREST },
  ];
  const seen = ["Your payment details", "How much you bought", "The address you withdrew to", "Your ID, if it checked it"];
  const kept = ["Sender hidden on chain", "Amount hidden on chain", "Later payments private", "Only your keys can move it"];
  return (
    <svg viewBox="0 0 520 420" role="img" aria-label="How buying Monero works. You pay with a bank transfer, a card, cash or another coin. A seller, which can be an exchange, a person on a peer-to-peer marketplace, a swap service or a crypto ATM, sends XMR to your own wallet, where your 25 words and keys stay on your device. The seller can see your payment details, how much you bought, the address you withdrew to, and your ID if it checked it. Once the XMR reaches your wallet, the sender and amount are hidden on chain, later payments stay private, and only your keys can move it." style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>YOUR FIRST XMR, FROM PAYMENT TO POCKET</text>
      {stages.map((s, i) => {
        const x = 8 + i * 177;
        const own = i === 2;
        return (
          <g key={s.title}>
            <rect x={x} y="32" width="150" height="160" rx="4" fill={own ? PAPER : CARD} stroke={s.tone} strokeWidth={own ? 1.6 : 1.2} strokeDasharray={i === 1 ? "5 4" : undefined} />
            {own ? <MoneroSymbol variant="color" size={20} x={x + 14} y={44} /> : null}
            <text x={own ? x + 40 : x + 14} y="60" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={s.tone}>{s.title}</text>
            {s.items.map((it, k) => (
              <text key={it} x={x + 14} y={92 + k * 26} fontSize="12" fill={INK}>{it}</text>
            ))}
          </g>
        );
      })}
      <ArrowRight x1={160} x2={183} y={112} color={INK} />
      <ArrowRight x1={337} x2={360} y={112} color={FOREST} />

      <rect x="8" y="214" width="246" height="196" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.3" strokeDasharray="5 4" />
      <text x="24" y="244" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={CLAY}>What the seller sees</text>
      {seen.map((t, k) => (
        <g key={t}>
          <Eye cx={32} cy={276 + k * 32} />
          <text x="48" y={280 + k * 32} fontSize="12" fill={INK}>{t}</text>
        </g>
      ))}
      <rect x="266" y="214" width="246" height="196" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="282" y="244" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={FOREST}>After it reaches you</text>
      {kept.map((t, k) => (
        <g key={t}>
          <Check cx={290} cy={276 + k * 32} />
          <text x="306" y={280 + k * 32} fontSize="12" fill={INK}>{t}</text>
        </g>
      ))}
    </svg>
  );
}

/** Which route fits: one question per row, one answer per question. */
export function RouteChooserArt() {
  const rows = [
    { q: "Already hold another coin, like bitcoin?", a: "Swap it into XMR" },
    { q: "Paying from a bank, fine with ID checks?", a: "A regulated exchange" },
    { q: "Prefer cash, or dealing with a person?", a: "A peer-to-peer trade" },
    { q: "Want cash in at a machine nearby?", a: "An ATM that sells XMR" },
    { q: "Do you sell goods or do paid work?", a: "Earn it: accept XMR" },
    { q: "Have a spare computer and patience?", a: "Mine it on a CPU" },
  ];
  return (
    <svg viewBox="0 0 600 372" role="img" aria-label="Which way to get Monero fits you. If you already hold another coin such as bitcoin, swap it into XMR. If you pay from a bank and are fine with ID checks, use a regulated exchange. If you prefer cash or dealing with a person, use a peer-to-peer trade. If you want to put cash into a machine, use a crypto ATM that sells XMR. If you sell goods or do paid work, earn it by accepting XMR. If you have a spare computer and patience, mine it on an ordinary processor. Whatever you pick, start small, and every route ends in your own wallet." style={{ width: "100%", height: "auto" }}>
      <text x="10" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHICH ROUTE FITS YOU?</text>
      <text x="360" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>TRY THIS FIRST</text>
      {rows.map((r, i) => {
        const y = 32 + i * 50;
        return (
          <g key={r.q}>
            <rect x="10" y={y} width="318" height="38" rx="4" fill={CARD} stroke={INK} strokeWidth="1.1" />
            <text x="24" y={y + 24} fontSize="13" fill={INK}>{r.q}</text>
            <ArrowRight x1={332} x2={354} y={y + 19} color={CLAY} />
            <rect x="358" y={y} width="232" height="38" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
            <text x="372" y={y + 24} fontSize="13" fontWeight="700" fill={FOREST}>{r.a}</text>
          </g>
        );
      })}
      <text x="10" y="358" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Whatever you pick: start small, and every route ends in your own wallet.</text>
    </svg>
  );
}

/** From the moment the seller sends to the moment you can spend. */
export function ConfirmTimelineArt() {
  const marks = [
    { x: 75, t: "Seller sends", s: "on its own schedule" },
    { x: 215, t: "Shows as pending", s: "usually within minutes" },
    { x: 365, t: "1 confirmation", s: "about 2 minutes later" },
    { x: 515, t: "Spendable", s: "10 blocks, about 20 min" },
  ];
  return (
    <svg viewBox="0 0 600 200" role="img" aria-label="What happens after you withdraw Monero to your own wallet. The seller sends on its own schedule. The payment usually shows as pending within minutes. The first confirmation comes about 2 minutes later, when it is included in a block. After 10 blocks, about 20 minutes, it becomes spendable. The 10-block lock is a Monero network rule, not a wallet setting." style={{ width: "100%", height: "auto" }}>
      <text x="10" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>FROM &quot;WITHDRAW&quot; TO SPENDABLE</text>
      <line x1="40" y1="70" x2="560" y2="70" stroke={INK} strokeWidth="1.4" />
      <rect x="365" y="64" width="150" height="12" rx="2" fill={FOREST} opacity="0.18" />
      {marks.map((m, i) => (
        <g key={m.t}>
          <circle cx={m.x} cy="70" r={i === 3 ? 10 : 7} fill={i === 3 ? FOREST : CARD} stroke={i === 3 ? FOREST : INK} strokeWidth="1.6" />
          {i === 3 ? <path d={`M${m.x - 4.5} 70 l3 3 l6 -6.5`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : null}
          <text x={m.x} y="108" textAnchor="middle" fontSize="13" fontWeight="700" fill={i === 3 ? FOREST : INK}>{m.t}</text>
          <text x={m.x} y="128" textAnchor="middle" fontSize="12" fill={MUTED}>{m.s}</text>
        </g>
      ))}
      <text x="440" y="54" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>the 10-block lock</text>
      <text x="10" y="176" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>The 10-block lock is a Monero network rule, not a wallet setting.</text>
    </svg>
  );
}

/** Where the money goes between "you pay" and "lands in your wallet". Shape only. */
export function FeeStackArt() {
  const W = 340;
  const cuts = [
    { label: "Payment method fee", w: 22 },
    { label: "Trading fee", w: 16 },
    { label: "Price spread", w: 26 },
    { label: "Withdrawal fee", w: 14 },
    { label: "Monero network fee", w: 3 },
  ];
  let right = 240 + W;
  return (
    <svg viewBox="0 0 600 340" role="img" aria-label="Where your money goes when you buy Monero, shown as a shape, not to scale. From what you pay, a payment method fee, a trading fee, the price spread and a withdrawal fee can each take a slice, and the Monero network fee is usually tiny. What is left is the XMR that lands in your wallet. Real costs vary by route, amount and payment method, so compare the final XMR amount you will receive." style={{ width: "100%", height: "auto" }}>
      <text x="10" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHERE YOUR MONEY GOES</text>
      <text x="20" y="54" fontSize="13" fontWeight="700" fill={INK}>What you pay</text>
      <rect x="240" y="38" width={W} height="24" rx="2" fill={INK} opacity="0.75" />
      {cuts.map((c, i) => {
        const y = 76 + i * 36;
        right -= c.w;
        return (
          <g key={c.label}>
            <text x="20" y={y + 16} fontSize="13" fill={INK}>{c.label}</text>
            <rect x="240" y={y} width={right - 240} height="24" rx="2" fill={INK} opacity="0.08" />
            <rect x={right} y={y} width={c.w} height="24" fill={CLAY} />
          </g>
        );
      })}
      <text x="20" y="274" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Lands in your wallet</text>
      <rect x="240" y="256" width={right - 240} height="24" rx="2" fill={FOREST} />
      <text x="20" y="312" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Illustration only: real costs vary by route, amount and payment method.</text>
      <text x="20" y="330" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Compare the final XMR amount, not the advertised price.</text>
    </svg>
  );
}

/** What the seller can know, what the blockchain shows, and what happens after. */
export function WhoKnowsArt() {
  const cols = [
    { title: "The seller knows", sub: "IN ITS OWN RECORDS", items: ["Your ID, if checked", "How you paid", "How much XMR", "Your receive address", "When it happened"], ok: false },
    { title: "The blockchain", sub: "THE WITHDRAWAL", items: ["Sender hidden", "Receiver hidden", "Amount hidden", "Valid, nothing more"], ok: true },
    { title: "Your later moves", sub: "ONCE IT IS YOURS", items: ["Balance stays hidden", "Spends hide in rings", "Seller can't follow"], ok: true },
  ];
  return (
    <svg viewBox="0 0 600 270" role="img" aria-label="Privacy after you buy Monero. The seller knows, in its own records: your ID if it checked it, how you paid, how much XMR you bought, the address you received it at, and when. On the blockchain, the withdrawal itself hides the sender, the receiver and the amount, and shows only that it was valid. Once it is yours, your balance stays private, your spends hide in rings, and the seller cannot follow what you do next. The seller's records stay with the seller, which is why where you buy matters." style={{ width: "100%", height: "auto" }}>
      {cols.map((c, i) => {
        const x = 10 + i * 200;
        return (
          <g key={c.title}>
            <rect x={x} y="10" width="180" height="214" rx="4" fill={c.ok ? PAPER : CARD} stroke={c.ok ? FOREST : CLAY} strokeWidth="1.3" strokeDasharray={c.ok ? undefined : "5 4"} />
            <text x={x + 14} y="38" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={c.ok ? FOREST : CLAY}>{c.title}</text>
            <text x={x + 14} y="56" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>{c.sub}</text>
            {c.items.map((t, k) => (
              <g key={t}>
                {c.ok ? <Check cx={x + 22} cy={84 + k * 30} /> : <Eye cx={x + 22} cy={84 + k * 30} />}
                <text x={x + 38} y={88 + k * 30} fontSize="12" fill={INK}>{t}</text>
              </g>
            ))}
            {i < 2 ? <ArrowRight x1={x + 182} x2={x + 198} y={117} color={FOREST} /> : null}
          </g>
        );
      })}
      <text x="10" y="254" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>The seller&apos;s records stay with the seller. That is why where you buy matters.</text>
    </svg>
  );
}
