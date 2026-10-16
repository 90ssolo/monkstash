import { MoneroSymbol } from "./MoneroSymbol";
import { DECISION_LABEL, DECISION_ROWS, MINING_LABEL, MINING_PATHS, SETUPS, WHO_SEES_LABEL, type Cell } from "./MoneroNodePillarArt";

/*
 * Phone layouts for the Monero Node pillar diagrams. Drawn 360 units wide and stacked
 * vertically, so every label renders at 11px or larger on a 375px screen. The wide
 * versions live in MoneroNodePillarArt.tsx; <Adaptive> picks one.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

function Check({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill={FOREST} />
      <path d={`M${cx - 4.5} ${cy} l3 3 l5.5 -6`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Alert({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill={CARD} stroke={CLAY} strokeWidth="1.6" />
      <path d={`M${cx} ${cy - 5} v5.5`} stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={cx} cy={cy + 4} r="1.1" fill={CLAY} />
    </g>
  );
}

function VArrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  const dir = y2 > y1 ? 1 : -1;
  return (
    <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <path d={`M${x - 5} ${y2 - dir * 8} L${x} ${y2} L${x + 5} ${y2 - dir * 8}`} />
    </g>
  );
}

function ListPanel({ y, title, items, ok }: { y: number; title: string; items: string[]; ok: boolean }) {
  return (
    <g>
      <rect x="4" y={y} width="352" height="132" rx="4" fill={ok ? PAPER : CARD} stroke={ok ? FOREST : CLAY} strokeWidth="1.4" strokeDasharray={ok ? undefined : "5 4"} />
      <text x="20" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={ok ? FOREST : CLAY}>{title}</text>
      {items.map((t, i) => (
        <g key={t}>
          {ok ? <Check cx={30} cy={y + 62 + i * 26} /> : <Alert cx={30} cy={y + 62 + i * 26} />}
          <text x="48" y={y + 67 + i * 26} fontSize="13.5" fill={INK}>{t}</text>
        </g>
      ))}
    </g>
  );
}

/** Phone hero: device on top, traffic in the middle, node below, then what the node sees. */
export function WalletNodeSplitNarrow() {
  const device = ["25 recovery words", "Private spend key", "Private view key", "Scanning for your payments", "Signing each payment"];
  return (
    <svg viewBox="0 0 360 710" role="img" aria-label="Your wallet and a Monero node split the work. Your device keeps the 25 recovery words, the private spend key and the private view key, scans for your payments and signs each payment. The node holds the blockchain, sends blocks to your wallet to scan, and receives your signed payment to pass on. A remote node can see your IP address, the transactions you send and when you connect. It never sees your keys or recovery words, your balance, or who you paid and how much." style={{ width: "100%", height: "auto" }}>
      <rect x="4" y="4" width="352" height="200" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <text x="20" y="34" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={FOREST}>Your device</text>
      <text x="20" y="54" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={MUTED}>STAYS ON YOUR DEVICE</text>
      {device.map((d, i) => (
        <g key={d}>
          <Check cx={30} cy={80 + i * 26} />
          <text x="48" y={85 + i * 26} fontSize="13.5" fill={INK}>{d}</text>
        </g>
      ))}

      <VArrow x={110} y1={210} y2={278} color={FOREST} />
      <text x="122" y="248" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={FOREST}>signed payment</text>
      <VArrow x={250} y1={278} y2={210} color={INK} />
      <text x="262" y="248" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>blocks to scan</text>

      <rect x="4" y="284" width="352" height="124" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <MoneroSymbol variant="color" size={20} x={18} y={298} />
      <text x="46" y="314" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={INK}>A Monero node</text>
      <text x="20" y="336" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={MUTED}>HOLDS THE BLOCKCHAIN</text>
      {[0, 1, 2, 3].map((i) => {
        const x = 20 + i * 82;
        return (
          <g key={i}>
            <rect x={x} y="352" width="70" height="32" rx="2" fill={i % 2 ? PAPER : CARD} stroke={INK} strokeWidth="1" />
            <rect x={x + 10} y="363" width="50" height="10" rx="2" fill={FOREST} opacity="0.22" />
            {i < 3 ? <line x1={x + 70} y1="368" x2={x + 82} y2="368" stroke={INK} strokeWidth="1.2" /> : null}
          </g>
        );
      })}

      <ListPanel y={424} title="A remote node can see" items={["Your IP address", "Transactions you send", "When you connect"]} ok={false} />
      <ListPanel y={572} title="It never sees" items={["Your keys or recovery words", "Your balance", "Who you paid, or how much"]} ok />
    </svg>
  );
}

function Mark({ kind, x, cy }: { kind: Cell; x: number; cy: number }) {
  const word = kind === "sees" ? "Sees it" : kind === "hidden" ? "Hidden" : "Never";
  return (
    <g>
      {kind === "sees" ? <Alert cx={x} cy={cy} /> : <Check cx={x} cy={cy} />}
      <text x={x + 14} y={cy + 4.5} fontSize="12.5" fill={kind === "sees" ? CLAY : INK} fontWeight={kind === "sees" ? 700 : 400}>{word}</text>
    </g>
  );
}

/** Phone version of the comparison grid: one card per setup. */
export function WhoSeesWhatNarrow() {
  const labels = ["Your IP address", "Payments to you", "Can it spend?"];
  return (
    <svg viewBox="0 0 360 630" role="img" aria-label={WHO_SEES_LABEL} style={{ width: "100%", height: "auto" }}>
      {SETUPS.map((s, r) => {
        const y = 4 + r * 146;
        return (
          <g key={s.name}>
            <rect x="4" y={y} width="352" height="134" rx="4" fill={r % 2 ? CARD : PAPER} stroke={INK} strokeWidth="1.2" />
            <text x="20" y={y + 28} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>{s.name}</text>
            <text x="20" y={y + 46} fontSize="11" fill={MUTED}>{s.sub}</text>
            {s.cells.map((c, i) => (
              <g key={i}>
                <text x="20" y={y + 76 + i * 24} fontSize="12.5" fill={INK}>{labels[i]}</text>
                <Mark kind={c} x={250} cy={y + 72 + i * 24} />
              </g>
            ))}
          </g>
        );
      })}
      <text x="8" y="602" fontSize="11.5" fill={MUTED}>Any node you use also sees the</text>
      <text x="8" y="620" fontSize="11.5" fill={MUTED}>transactions you broadcast through it.</text>
    </svg>
  );
}

/** Phone version of the decision rows: situation, arrow, setup. */
export function NodeDecisionNarrow() {
  return (
    <svg viewBox="0 0 360 606" role="img" aria-label={DECISION_LABEL} style={{ width: "100%", height: "auto" }}>
      <text x="8" y="14" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={MUTED}>IF YOU... THEN A GOOD FIT IS</text>
      {DECISION_ROWS.map((r, i) => {
        const y = 24 + i * 148;
        return (
          <g key={r.a}>
            <rect x="4" y={y} width="352" height="58" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
            <text x="20" y={y + 24} fontSize="13.5" fill={INK}>{r.q[0]}</text>
            <text x="20" y={y + 44} fontSize="13.5" fill={INK}>{r.q[1]}</text>
            <VArrow x={40} y1={y + 61} y2={y + 77} color={CLAY} />
            <rect x="4" y={y + 80} width="352" height="52" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
            <text x="20" y={y + 102} fontSize="14" fontWeight="700" fill={FOREST}>{r.a}</text>
            <text x="20" y={y + 121} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{r.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Phone version of the three ways to mine: one card each. */
export function MiningPathsNarrow() {
  return (
    <svg viewBox="0 0 360 524" role="img" aria-label={MINING_LABEL} style={{ width: "100%", height: "auto" }}>
      {MINING_PATHS.map((p, c) => {
        const y = 4 + c * 160;
        return (
          <g key={p.name}>
            <rect x="4" y={y} width="352" height="148" rx="4" fill={p.strong ? PAPER : CARD} stroke={p.strong ? FOREST : INK} strokeWidth={p.strong ? 1.6 : 1.2} />
            <text x="20" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={p.strong ? FOREST : INK}>{p.name}</text>
            {p.rows.map(([k, v], i) => (
              <g key={k}>
                <text x="20" y={y + 62 + i * 26} fontSize="10.5" fontWeight="700" letterSpacing="1" fill={MUTED}>{k}</text>
                <text x="176" y={y + 62 + i * 26} fontSize="13" fill={INK}>{v}</text>
              </g>
            ))}
          </g>
        );
      })}
      <text x="8" y="500" fontSize="11.5" fill={MUTED}>XMRig works with all three. The official</text>
      <text x="8" y="518" fontSize="11.5" fill={MUTED}>GUI and CLI wallets can solo mine on a CPU.</text>
    </svg>
  );
}
