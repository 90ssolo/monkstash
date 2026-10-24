import { FORMATS, KEY_ROWS, LOST_ROWS } from "./SeedPhrasePillarArt";

/*
 * Phone layouts for the Monero seed phrase pillar. Drawn 360 units wide and stacked
 * vertically, so on a 375px screen every label renders at 11px or larger. The wide
 * versions live in SeedPhrasePillarArt.tsx; <Adaptive> shows one or the other.
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

/** Phone hero: the 25-word sheet on top, the keys it produces below. */
export function SeedTreeNarrow() {
  const boxes = [
    { y: 376, title: "Private spend key", sub: "spends your money", tone: CLAY },
    { y: 474, title: "Private view key", sub: "sees payments coming in", tone: FOREST },
    { y: 572, title: "Public address", sub: "safe to share with anyone", tone: FOREST },
  ];
  return (
    <svg viewBox="0 0 360 644" role="img" aria-label="A Monero seed phrase is a sheet of 25 words: words 1 to 24 carry your secret and word 25 is a checksum that catches mistakes. The words produce your private spend key, which spends your money. The private view key is made by hashing the spend key and can only see incoming payments. The public parts of both keys form your address, which is safe to share." style={{ width: "100%", height: "auto" }}>
      <rect x="4" y="4" width="352" height="340" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <text x="20" y="34" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={INK}>Your 25 words</text>
      <text x="20" y="54" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>the whole wallet, written down</text>
      {Array.from({ length: 25 }).map((_, i) => {
        const x = 22 + (i % 5) * 65;
        const y = 70 + Math.floor(i / 5) * 44;
        const check = i === 24;
        return (
          <g key={i}>
            <rect x={x} y={y} width="56" height="36" rx="3" fill={CARD} stroke={check ? CLAY : FOREST} strokeWidth={check ? 1.8 : 1.1} />
            <text x={x + 6} y={y + 14} fontSize="11" fontWeight="700" fill={check ? CLAY : MUTED}>{i + 1}</text>
            <line x1={x + 8} y1={y + 27} x2={x + 48} y2={y + 27} stroke={check ? CLAY : FOREST} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
          </g>
        );
      })}
      <rect x="22" y="298" width="11" height="11" rx="2" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="40" y="308" fontSize="12" fill={INK}>Words 1 to 24: your secret</text>
      <rect x="22" y="320" width="11" height="11" rx="2" fill={CARD} stroke={CLAY} strokeWidth="1.8" />
      <text x="40" y="330" fontSize="12" fill={INK}>Word 25: the checksum</text>

      <ArrowDown x={180} y1={346} y2={374} color={CLAY} />
      {boxes.map((b) => (
        <g key={b.title}>
          <rect x="4" y={b.y} width="352" height="66" rx="4" fill={b.title === "Public address" ? CARD : PAPER} stroke={b.tone} strokeWidth="1.5" />
          <text x="20" y={b.y + 28} fontWeight="700" fontSize="14.5" fill={b.tone}>{b.title}</text>
          <text x="20" y={b.y + 51} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={INK}>{b.sub}</text>
        </g>
      ))}
      <ArrowDown x={180} y1={442} y2={472} dashed />
      <text x="192" y="462" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={MUTED}>hashed</text>
      <ArrowDown x={180} y1={540} y2={570} />
      <text x="192" y="560" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={MUTED}>public parts</text>
    </svg>
  );
}

function Mark({ cx, cy, yes }: { cx: number; cy: number; yes: boolean }) {
  return yes ? (
    <g>
      <circle cx={cx} cy={cy} r="8" fill={FOREST} />
      <path d={`M${cx - 4} ${cy} l2.6 2.6 l5 -5.4`} fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ) : (
    <g>
      <circle cx={cx} cy={cy} r="8" fill="none" stroke={MUTED} strokeWidth="1.3" />
      <line x1={cx - 3.5} y1={cy} x2={cx + 3.5} y2={cy} stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

/** Phone version of what each secret can do: one card per secret. */
export function KeyPowerNarrow() {
  const share: Record<string, string> = { Never: "Never share", Carefully: "Share carefully", Yes: "Share freely" };
  return (
    <svg viewBox="0 0 360 404" role="img" aria-label="What each Monero secret can do. The 25 words: see incoming payments, spend, and restore the whole wallet; never share them. The private spend key: the same powers; never share it. The private view key: sees incoming payments only; share it carefully. The public address: cannot see, spend or restore anything; share it freely." style={{ width: "100%", height: "auto" }}>
      <text x="4" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WHAT EACH SECRET CAN DO</text>
      {KEY_ROWS.map((r, i) => {
        const y = 28 + i * 94;
        const marks = [
          { label: "Sees payments", yes: r.see, x: 16 },
          { label: "Spends", yes: r.spend, x: 138 },
          { label: "Restores all", yes: r.restore, x: 246 },
        ];
        return (
          <g key={r.name}>
            <rect x="4" y={y} width="352" height="84" rx="4" fill={i % 2 ? CARD : PAPER} stroke={INK} strokeOpacity="0.3" />
            <text x="16" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>{r.name}</text>
            <text x="344" y={y + 30} textAnchor="end" fontWeight="700" fontSize="12" fill={r.tone}>{share[r.share]}</text>
            {marks.map((m) => (
              <g key={m.label}>
                <Mark cx={m.x + 8} cy={y + 60} yes={m.yes} />
                <text x={m.x + 22} y={y + 64} fontSize="12" fill={m.yes ? INK : MUTED}>{m.label}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** Phone version of the word-count guide: one row per format. */
export function WordCountNarrow() {
  return (
    <svg viewBox="0 0 360 452" role="img" aria-label="Count your words to know your format. 25 words is the standard Monero seed, read by most Monero wallets, including MonkStash, and it needs a restore date. 16 words is a Polyseed, used by Feather and Cake Wallet, with the creation date built in; MonkStash restores it. 13 words is the old MyMonero format, which derives keys its own way; MonkStash restores it. 12 or 24 words is usually a Bitcoin-style BIP39 phrase, apart from Cake Wallet's optional 12-word Monero seed; MonkStash does not read it." style={{ width: "100%", height: "auto" }}>
      <text x="4" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>COUNT YOUR WORDS FIRST</text>
      {FORMATS.map((f, i) => {
        const y = 28 + i * 104;
        return (
          <g key={f.n}>
            <rect x="4" y={y} width="352" height="94" rx="4" fill={f.ok ? PAPER : CARD} stroke={f.ok ? FOREST : INK} strokeWidth={f.ok ? 1.6 : 1.1} />
            <text x="18" y={y + 46} fontFamily={SERIF} fontStyle="italic" fontSize={f.n.length > 2 ? 22 : 32} fill={f.ok ? FOREST : INK}>{f.n}</text>
            <text x="18" y={y + 68} fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>WORDS</text>
            <text x="112" y={y + 24} fontWeight="700" fontSize="14" fill={f.ok ? FOREST : INK}>{f.name}</text>
            <text x="112" y={y + 44} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{f.lines[0]}</text>
            <text x="112" y={y + 62} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{f.lines[1]}</text>
            <text x="112" y={y + 82} fontWeight="700" fontSize="12.5" fill={f.ok ? FOREST : CLAY}>{f.lines[2]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Phone version of the restore height timeline. */
export function RestoreHeightNarrow() {
  return (
    <svg viewBox="0 0 360 360" role="img" aria-label="A timeline of the Monero blockchain from 2014 to today, with the day your wallet was created and your first payment marked. A restore height that is too low finds everything but makes the first sync slow. A height just before the wallet was created is fast and complete. A height after your first payment skips that payment, so the balance looks too small until you rescan from earlier." style={{ width: "100%", height: "auto" }}>
      <text x="20" y="18" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>THE BLOCKCHAIN, OLDEST TO NEWEST</text>
      <text x="164" y="64" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={FOREST}>wallet created</text>
      <text x="206" y="64" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={CLAY}>first payment</text>
      <line x1="170" y1="72" x2="170" y2="104" stroke={FOREST} strokeWidth="1.4" strokeDasharray="3 3" />
      <line x1="202" y1="72" x2="202" y2="90" stroke={CLAY} strokeWidth="1.4" />
      <line x1="20" y1="98" x2="340" y2="98" stroke={INK} strokeWidth="2" />
      {[202, 256, 306].map((x) => <circle key={x} cx={x} cy="98" r="5.5" fill={CLAY} />)}
      <text x="20" y="120" fontSize="11.5" fill={MUTED}>2014</text>
      <text x="340" y="120" textAnchor="end" fontSize="11.5" fill={MUTED}>today</text>

      <text x="20" y="162" fontSize="12.5" fill={INK}><tspan fontWeight="700">Too low:</tspan> finds it all, slow first sync</text>
      <ArrowRight x1={20} x2={340} y={176} color={MUTED} />
      <text x="20" y="216" fontSize="12.5" fill={INK}><tspan fontWeight="700" fill={FOREST}>Just right:</tspan> fast and complete</text>
      <line x1="160" y1="224" x2="160" y2="236" stroke={FOREST} strokeWidth="2" />
      <ArrowRight x1={160} x2={340} y={230} color={FOREST} />
      <text x="20" y="270" fontSize="12.5" fill={INK}><tspan fontWeight="700" fill={CLAY}>Too high:</tspan> skips your first payment</text>
      <line x1="226" y1="278" x2="226" y2="290" stroke={CLAY} strokeWidth="2" />
      <ArrowRight x1={226} x2={340} y={284} color={CLAY} />
      <text x="20" y="330" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>Not lost, just not scanned. Rescan from earlier.</text>
    </svg>
  );
}

/** Phone version of the lost-seed decision: one card per situation. */
export function LostSeedNarrow() {
  return (
    <svg viewBox="0 0 360 352" role="img" aria-label="If you lost your 25 words, what you still have decides what is possible. If the wallet still opens on a device, write the words down from it today. If you saved the private spend key, restore from keys and make a new backup. If you only have the address and view key, you can watch incoming payments but never spend. If you have none of these, the money cannot be recovered." style={{ width: "100%", height: "auto" }}>
      <text x="4" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>IF YOU STILL HAVE</text>
      {LOST_ROWS.map((r, i) => {
        const y = 28 + i * 80;
        return (
          <g key={r.have}>
            <rect x="4" y={y} width="352" height="70" rx="4" fill={r.bad ? CARD : PAPER} stroke={r.bad ? CLAY : FOREST} strokeWidth="1.4" strokeDasharray={r.bad ? "5 4" : undefined} />
            <text x="18" y={y + 28} fontWeight="700" fontSize="13.5" fill={INK}>{r.have}</text>
            <ArrowRight x1={18} x2={38} y={y + 48} color={r.bad ? CLAY : FOREST} />
            <text x="46" y={y + 53} fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={r.bad ? CLAY : FOREST}>{r.then}</text>
          </g>
        );
      })}
    </svg>
  );
}
