import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Diagrams for /swap-bitcoin-to-monero. Wide and phone versions live together here;
 * <Adaptive> shows one or the other. Timings follow the eigenwallet docs (refund and punish
 * page, checked 2026-10-15): cancel after 24 Bitcoin blocks, refund window of 144 blocks.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

const STEPS = [
  { n: "1", t: "You lock BTC", s: ["in a shared lock", "no one moves alone"] },
  { n: "2", t: "Maker locks XMR", s: ["on the Monero chain", "when BTC confirms"] },
  { n: "3", t: "Maker takes BTC", s: ["which reveals", "the key you need"] },
  { n: "4", t: "You claim XMR", s: ["with that key, and", "the swap is done"] },
] as const;

const ARIA =
  "How a Bitcoin to Monero atomic swap works. Step 1: you lock your bitcoin in a 2-of-2 lock that neither side can move alone. Step 2: after your bitcoin confirms, the maker locks Monero. Step 3: the maker claims the bitcoin, and doing so reveals the key you need. Step 4: you use that key to claim the Monero, and the swap is done. If the swap stalls, it can be cancelled after 24 Bitcoin blocks, about 4 hours. You then have a refund window of 144 blocks, about 24 hours, during which only you can take your bitcoin back; the app needs to run for a few minutes in that window. If you stay offline for the whole window, the maker can claim your bitcoin.";

function ArrowRight({ x1, x2, y, color = FOREST }: { x1: number; x2: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke={color} strokeWidth="1.6" />
      <path d={`M${x2 - 8} ${y - 5} L${x2} ${y} L${x2 - 8} ${y + 5} Z`} fill={color} />
    </g>
  );
}

function ArrowDown({ x, y1, y2, color = FOREST }: { x: number; y1: number; y2: number; color?: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke={color} strokeWidth="1.6" />
      <path d={`M${x - 5} ${y2 - 8} L${x} ${y2} L${x + 5} ${y2 - 8} Z`} fill={color} />
    </g>
  );
}

function Num({ cx, cy, n, done }: { cx: number; cy: number; n: string; done: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill={done ? FOREST : CARD} stroke={FOREST} strokeWidth="1.5" />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={done ? "#fff" : FOREST}>{n}</text>
    </g>
  );
}

/** Wide: the four happy-path steps in a row, the safety net underneath. */
export function AtomicSwapArt() {
  return (
    <svg viewBox="0 0 600 360" role="img" aria-label={ARIA} style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>A BTC TO XMR ATOMIC SWAP, IN FOUR MOVES</text>
      {STEPS.map((s, i) => {
        const x = 8 + i * 150;
        const last = i === 3;
        return (
          <g key={s.n}>
            <rect x={x} y="34" width="132" height="120" rx="4" fill={last ? PAPER : CARD} stroke={last ? FOREST : INK} strokeWidth={last ? 1.6 : 1.1} />
            <Num cx={x + 22} cy={56} n={s.n} done={last} />
            {last ? <MoneroSymbol variant="color" size={18} x={x + 104} y={46} /> : null}
            <text x={x + 12} y="94" fontFamily={SERIF} fontStyle="italic" fontSize="15.5" fill={last ? FOREST : INK}>{s.t}</text>
            {s.s.map((line, k) => (
              <text key={line} x={x + 12} y={118 + k * 17} fontSize="11" fill={MUTED}>{line}</text>
            ))}
            {i < 3 ? <ArrowRight x1={x + 133} x2={x + 149} y={94} /> : null}
          </g>
        );
      })}

      <rect x="8" y="176" width="584" height="122" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.3" strokeDasharray="5 4" />
      <text x="24" y="202" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>If it stalls: the safety net</text>
      <line x1="40" y1="246" x2="560" y2="246" stroke={INK} strokeWidth="1.3" />
      <rect x="200" y="240" width="260" height="12" rx="2" fill={FOREST} opacity="0.18" />
      {[
        { x: 40, t: "Swap starts", s: "BTC locked" },
        { x: 200, t: "Cancel possible", s: "after 24 BTC blocks, ~4 h" },
        { x: 460, t: "Refund window ends", s: "144 blocks later, ~24 h" },
      ].map((m) => (
        <g key={m.t}>
          <circle cx={m.x} cy="246" r="6" fill={CARD} stroke={INK} strokeWidth="1.5" />
          <text x={m.x} y="272" textAnchor={m.x === 40 ? "start" : "middle"} fontSize="12" fontWeight="700" fill={INK}>{m.t}</text>
          <text x={m.x} y="288" textAnchor={m.x === 40 ? "start" : "middle"} fontSize="11" fill={MUTED}>{m.s}</text>
        </g>
      ))}
      <text x="330" y="232" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>only you can refund here</text>
      <text x="8" y="324" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Open the app for a few minutes inside the window.</text>
      <text x="8" y="344" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Offline the whole time, and the maker can claim your BTC.</text>
    </svg>
  );
}

/** Phone: steps stacked, then the safety net as a short vertical list. */
export function AtomicSwapNarrow() {
  const net = [
    { t: "Swap starts", s: "your BTC is locked" },
    { t: "Cancel becomes possible", s: "after 24 BTC blocks, about 4 hours" },
    { t: "Refund window: only you can refund", s: "lasts 144 blocks, about 24 hours" },
    { t: "Window closes", s: "stayed offline? the maker can claim your BTC" },
  ];
  return (
    <svg viewBox="0 0 360 640" role="img" aria-label={ARIA} style={{ width: "100%", height: "auto" }}>
      <text x="8" y="18" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>BTC TO XMR ATOMIC SWAP</text>
      {STEPS.map((s, i) => {
        const y = 32 + i * 76;
        const last = i === 3;
        return (
          <g key={s.n}>
            <rect x="8" y={y} width="344" height="58" rx="4" fill={last ? PAPER : CARD} stroke={last ? FOREST : INK} strokeWidth={last ? 1.6 : 1.1} />
            <Num cx={32} cy={y + 29} n={s.n} done={last} />
            <text x="54" y={y + 25} fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={last ? FOREST : INK}>{s.t}</text>
            <text x="54" y={y + 44} fontSize="11" fill={MUTED}>{`${s.s[0]} ${s.s[1]}`}</text>
            {last ? <MoneroSymbol variant="color" size={18} x={322} y={y + 20} /> : null}
            {i < 3 ? <ArrowDown x={180} y1={y + 59} y2={y + 76} /> : null}
          </g>
        );
      })}
      <rect x="8" y="348" width="344" height="252" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.3" strokeDasharray="5 4" />
      <text x="22" y="374" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>If it stalls: the safety net</text>
      <line x1="34" y1="400" x2="34" y2="570" stroke={INK} strokeWidth="1.3" />
      {net.map((m, k) => {
        const y = 400 + k * 56;
        return (
          <g key={m.t}>
            <circle cx="34" cy={y} r="6" fill={k === 2 ? FOREST : CARD} stroke={k === 2 ? FOREST : INK} strokeWidth="1.5" />
            <text x="52" y={y + 4} fontSize="12.5" fontWeight="700" fill={k === 2 ? FOREST : INK}>{m.t}</text>
            <text x="52" y={y + 22} fontSize="11" fill={MUTED}>{m.s}</text>
          </g>
        );
      })}
      <text x="8" y="624" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Open the app for a few minutes inside the window.</text>
    </svg>
  );
}
