/*
 * Wide diagrams for the Monero seed phrase pillar. Each has a phone version in
 * SeedPhrasePillarNarrowArt.tsx; pages show one or the other with <Adaptive>.
 * Seed slots are drawn blank on purpose: we never print real-looking seed words.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

function ArrowDown({ x, y1, y2, color = FOREST, dashed = false }: { x: number; y1: number; y2: number; color?: string; dashed?: boolean }) {
  return (
    <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y1} x2={x} y2={y2 - 2} strokeDasharray={dashed ? "4 3" : undefined} />
      <path d={`M${x - 5} ${y2 - 7} L${x} ${y2} L${x + 5} ${y2 - 7}`} />
    </g>
  );
}

function ArrowRight({ x1, x2, y, color = FOREST }: { x1: number; x2: number; y: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y} x2={x2 - 2} y2={y} />
      <path d={`M${x2 - 7} ${y - 5} L${x2} ${y} L${x2 - 7} ${y + 5}`} />
    </g>
  );
}

function Slot({ x, y, w, h, n }: { x: number; y: number; w: number; h: number; n: number }) {
  const check = n === 25;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={CARD} stroke={check ? CLAY : FOREST} strokeWidth={check ? 1.8 : 1.1} />
      <text x={x + 7} y={y + 15} fontSize="11" fontWeight="700" fill={check ? CLAY : MUTED}>{n}</text>
      <line x1={x + 8} y1={y + h - 10} x2={x + w - 8} y2={y + h - 10} stroke={check ? CLAY : FOREST} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    </g>
  );
}

/** Hero: a 25-word sheet (24 words plus a checksum) that produces the spend key, the view key and the address. */
export function SeedTreeArt() {
  const boxes = [
    { y: 40, title: "Private spend key", sub: "spends your money", tone: CLAY },
    { y: 172, title: "Private view key", sub: "sees payments coming in", tone: FOREST },
    { y: 304, title: "Public address", sub: "safe to share with anyone", tone: FOREST },
  ];
  return (
    <svg viewBox="0 0 600 420" role="img" aria-label="A Monero seed phrase is a sheet of 25 words: words 1 to 24 carry your secret and word 25 is a checksum that catches mistakes. The words produce your private spend key, which spends your money. The private view key is made by hashing the spend key and can only see incoming payments. The public parts of both keys form your address, which is safe to share. The arrows only run one way." style={{ width: "100%", height: "auto" }}>
      <rect x="8" y="8" width="300" height="404" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <text x="26" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={INK}>Your 25 words</text>
      <text x="26" y="60" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>the whole wallet, written down</text>
      {Array.from({ length: 25 }).map((_, i) => (
        <Slot key={i} x={26 + (i % 5) * 56} y={80 + Math.floor(i / 5) * 52} w={50} h={40} n={i + 1} />
      ))}
      <rect x="26" y="348" width="11" height="11" rx="2" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="44" y="358" fontSize="12" fill={INK}>Words 1 to 24: your secret</text>
      <rect x="26" y="372" width="11" height="11" rx="2" fill={CARD} stroke={CLAY} strokeWidth="1.8" />
      <text x="44" y="382" fontSize="12" fill={INK}>Word 25: the checksum</text>

      {boxes.map((b) => (
        <g key={b.title}>
          <rect x="340" y={b.y} width="252" height="78" rx="4" fill={b.title === "Public address" ? CARD : PAPER} stroke={b.tone} strokeWidth="1.5" />
          <text x="356" y={b.y + 32} fontWeight="700" fontSize="14.5" fill={b.tone}>{b.title}</text>
          <text x="356" y={b.y + 56} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{b.sub}</text>
        </g>
      ))}
      <ArrowRight x1={308} x2={338} y={79} color={CLAY} />
      <ArrowDown x={466} y1={118} y2={170} dashed />
      <text x="476" y="150" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={MUTED}>hashed</text>
      <ArrowDown x={466} y1={250} y2={302} />
      <text x="476" y="282" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={MUTED}>public parts</text>
      <text x="340" y="406" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={MUTED}>The arrows only run one way.</text>
    </svg>
  );
}

function Yes({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill={FOREST} />
      <path d={`M${cx - 4.5} ${cy} l3 3 l5.5 -6`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
function No({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill="none" stroke={MUTED} strokeWidth="1.3" />
      <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={MUTED} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

export const KEY_ROWS = [
  { name: "Your 25 words", sub: "the seed phrase", see: true, spend: true, restore: true, share: "Never", tone: CLAY },
  { name: "Private spend key", sub: "signs payments", see: true, spend: true, restore: true, share: "Never", tone: CLAY },
  { name: "Private view key", sub: "reads payments in", see: true, spend: false, restore: false, share: "Carefully", tone: FOREST },
  { name: "Public address", sub: "where you get paid", see: false, spend: false, restore: false, share: "Yes", tone: FOREST },
] as const;

/** What each secret can do: see incoming payments, spend, restore the full wallet, and whether to share it. */
export function KeyPowerArt() {
  const cols = [
    { label: "SEES PAYMENTS", x: 280 },
    { label: "SPENDS", x: 366 },
    { label: "RESTORES ALL", x: 452 },
    { label: "SHARE IT?", x: 540 },
  ];
  return (
    <svg viewBox="0 0 600 296" role="img" aria-label="What each Monero secret can do. The 25 words: see incoming payments, spend, and restore the whole wallet; never share them. The private spend key: the same powers; never share it. The private view key: sees incoming payments only, cannot spend or restore the full wallet; share it carefully. The public address: cannot see, spend or restore anything; share it freely." style={{ width: "100%", height: "auto" }}>
      {cols.map((c) => (
        <text key={c.label} x={c.x} y="30" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1" fill={MUTED}>{c.label}</text>
      ))}
      {KEY_ROWS.map((r, i) => {
        const y = 44 + i * 62;
        return (
          <g key={r.name}>
            <rect x="8" y={y} width="584" height="54" rx="4" fill={i % 2 ? CARD : PAPER} stroke={INK} strokeOpacity="0.25" />
            <text x="24" y={y + 25} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>{r.name}</text>
            <text x="24" y={y + 44} fontSize="12" fill={MUTED}>{r.sub}</text>
            {r.see ? <Yes cx={280} cy={y + 27} /> : <No cx={280} cy={y + 27} />}
            {r.spend ? <Yes cx={366} cy={y + 27} /> : <No cx={366} cy={y + 27} />}
            {r.restore ? <Yes cx={452} cy={y + 27} /> : <No cx={452} cy={y + 27} />}
            <text x="540" y={y + 32} textAnchor="middle" fontWeight="700" fontSize="13" fill={r.tone}>{r.share}</text>
          </g>
        );
      })}
    </svg>
  );
}

export const FORMATS = [
  { n: "25", name: "Standard", lines: ["most Monero wallets", "needs a restore date", "MonkStash: yes"], ok: true },
  { n: "16", name: "Polyseed", lines: ["Feather, Cake Wallet", "date is built in", "MonkStash: no"], ok: false },
  { n: "13", name: "MyMonero", lines: ["the old web wallet", "own key derivation", "MonkStash: yes"], ok: true },
  { n: "12 / 24", name: "BIP39 style", lines: ["usually not Monero", "Cake: 12-word option", "MonkStash: no"], ok: false },
] as const;

/** Which seed do you have? Count the words. */
export function WordCountArt() {
  return (
    <svg viewBox="0 0 600 262" role="img" aria-label="Count your words to know your format. 25 words is the standard Monero seed, read by most Monero wallets, including MonkStash, and it needs a restore date. 16 words is a Polyseed, used by Feather and Cake Wallet, with the creation date built in; MonkStash does not read it. 13 words is the old MyMonero format, which derives keys its own way; MonkStash restores it. 12 or 24 words is usually a Bitcoin-style BIP39 phrase, except Cake Wallet's optional 12-word Monero seed; MonkStash does not read it." style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>COUNT YOUR WORDS FIRST</text>
      {FORMATS.map((f, i) => {
        const x = 8 + i * 148;
        return (
          <g key={f.n}>
            <rect x={x} y="30" width="138" height="184" rx="4" fill={f.ok ? PAPER : CARD} stroke={f.ok ? FOREST : INK} strokeWidth={f.ok ? 1.6 : 1.1} />
            <text x={x + 12} y="72" fontFamily={SERIF} fontStyle="italic" fontSize={f.n.length > 2 ? 28 : 36} fill={f.ok ? FOREST : INK}>{f.n}</text>
            <text x={x + 12} y="92" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WORDS</text>
            <text x={x + 12} y="122" fontWeight="700" fontSize="14" fill={f.ok ? FOREST : INK}>{f.name}</text>
            {f.lines.map((l, k) => (
              <text key={l} x={x + 12} y={148 + k * 20} fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={k === 2 ? (f.ok ? FOREST : CLAY) : INK} fontWeight={k === 2 ? 700 : 400}>{l}</text>
            ))}
          </g>
        );
      })}
      <text x="8" y="246" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>Each format needs a wallet that reads it. The words are not interchangeable.</text>
    </svg>
  );
}

/** Restore height: where the scan starts decides what the wallet finds. */
export function RestoreHeightArt() {
  return (
    <svg viewBox="0 0 600 262" role="img" aria-label="A timeline of the Monero blockchain from 2014 to today, with the day your wallet was created and your first payment marked. A restore height that is too low finds everything but makes the first sync slow. A height just before the wallet was created is fast and complete. A height after your first payment skips that payment, so the balance looks too small until you rescan from earlier." style={{ width: "100%", height: "auto" }}>
      <text x="30" y="20" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>THE BLOCKCHAIN, OLDEST TO NEWEST</text>
      <line x1="30" y1="96" x2="570" y2="96" stroke={INK} strokeWidth="2" />
      <text x="30" y="116" fontSize="11.5" fill={MUTED}>2014</text>
      <text x="570" y="116" textAnchor="end" fontSize="11.5" fill={MUTED}>today</text>
      <line x1="320" y1="70" x2="320" y2="102" stroke={FOREST} strokeWidth="1.4" strokeDasharray="3 3" />
      <text x="314" y="62" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>wallet created</text>
      <text x="384" y="62" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>your first payment</text>
      <line x1="380" y1="70" x2="380" y2="88" stroke={CLAY} strokeWidth="1.4" />
      {[380, 450, 520].map((x) => <circle key={x} cx={x} cy="96" r="6" fill={CLAY} />)}

      <text x="30" y="148" fontSize="12.5" fill={INK}><tspan fontWeight="700">Too low:</tspan> finds everything, but the first sync is slow</text>
      <ArrowRight x1={30} x2={570} y={160} color={MUTED} />
      <text x="30" y="190" fontSize="12.5" fill={INK}><tspan fontWeight="700" fill={FOREST}>Just right:</tspan> fast and complete</text>
      <line x1="310" y1="194" x2="310" y2="206" stroke={FOREST} strokeWidth="2" />
      <ArrowRight x1={310} x2={570} y={200} color={FOREST} />
      <text x="30" y="230" fontSize="12.5" fill={INK}><tspan fontWeight="700" fill={CLAY}>Too high:</tspan> skips your first payment</text>
      <line x1="410" y1="234" x2="410" y2="246" stroke={CLAY} strokeWidth="2" />
      <ArrowRight x1={410} x2={570} y={240} color={CLAY} />
    </svg>
  );
}

export const LOST_ROWS = [
  { have: "The wallet still opens on a device", then: "Write the words down from it today", bad: false },
  { have: "You saved the private spend key", then: "Restore from keys, then back up", bad: false },
  { have: "Only the address and view key", then: "Watch payments in, but never spend", bad: false },
  { have: "None of these", then: "The money cannot be recovered", bad: true },
] as const;

/** Lost the 25 words? What you still have decides what is possible. */
export function LostSeedArt() {
  return (
    <svg viewBox="0 0 600 306" role="img" aria-label="If you lost your 25 words, what you still have decides what is possible. If the wallet still opens on a device, write the words down from it today. If you saved the private spend key, restore from keys and make a new backup. If you only have the address and view key, you can watch incoming payments but never spend. If you have none of these, the money cannot be recovered." style={{ width: "100%", height: "auto" }}>
      <text x="20" y="24" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHAT YOU STILL HAVE</text>
      <text x="340" y="24" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHAT YOU CAN DO</text>
      {LOST_ROWS.map((r, i) => {
        const y = 40 + i * 64;
        return (
          <g key={r.have}>
            <rect x="8" y={y} width="300" height="50" rx="4" fill={CARD} stroke={INK} strokeOpacity="0.4" />
            <text x="20" y={y + 30} fontWeight="700" fontSize="13" fill={INK}>{r.have}</text>
            <ArrowRight x1={310} x2={334} y={y + 25} color={r.bad ? CLAY : FOREST} />
            <rect x="336" y={y} width="256" height="50" rx="4" fill={r.bad ? CARD : PAPER} stroke={r.bad ? CLAY : FOREST} strokeWidth="1.4" strokeDasharray={r.bad ? "5 4" : undefined} />
            <text x="350" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={r.bad ? CLAY : FOREST}>{r.then}</text>
          </g>
        );
      })}
    </svg>
  );
}
