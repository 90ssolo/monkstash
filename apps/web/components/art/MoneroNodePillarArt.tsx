import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Wide diagrams for the Monero Node pillar. Phone versions live in
 * MoneroNodePillarNarrowArt.tsx; pages show one or the other through <Adaptive>.
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

function Arrow({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) {
  const dir = x2 > x1 ? 1 : -1;
  return (
    <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <path d={`M${x2 - dir * 8} ${y - 5} L${x2} ${y} L${x2 - dir * 8} ${y + 5}`} />
    </g>
  );
}

/** Hero: what stays on your device, what travels to the node, and what the node can and cannot see. */
export function WalletNodeSplitArt() {
  const device = ["25 recovery words", "Private spend key", "Private view key", "Scanning for your payments", "Signing each payment"];
  const sees = ["Your IP address", "Transactions you send", "When you connect"];
  const never = ["Your keys or recovery words", "Your balance", "Who you paid, or how much"];
  return (
    <svg viewBox="0 0 560 440" role="img" aria-label="Your wallet and a Monero node split the work. Your device keeps the 25 recovery words, the private spend key and the private view key, scans for your payments and signs each payment. The node holds the blockchain, sends blocks to your wallet to scan, and receives your signed payment to pass on. A remote node can see your IP address, the transactions you send and when you connect. It never sees your keys or recovery words, your balance, or who you paid and how much." style={{ width: "100%", height: "auto" }}>
      {/* device */}
      <rect x="10" y="10" width="240" height="232" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <text x="28" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={FOREST}>Your device</text>
      <text x="28" y="64" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>STAYS ON YOUR DEVICE</text>
      {device.map((d, i) => (
        <g key={d}>
          <Check cx={38} cy={92 + i * 30} />
          <text x="56" y={97 + i * 30} fontSize="12.5" fill={INK}>{d}</text>
        </g>
      ))}

      {/* traffic */}
      <text x="305" y="100" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={INK}>blocks to scan</text>
      <Arrow x1={356} x2={256} y={110} color={INK} />
      <text x="305" y="160" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>signed payment</text>
      <Arrow x1={256} x2={356} y={170} color={FOREST} />

      {/* node */}
      <rect x="360" y="10" width="190" height="232" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <MoneroSymbol variant="color" size={20} x={376} y={26} />
      <text x="402" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={INK}>A Monero node</text>
      <text x="376" y="64" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>HOLDS THE BLOCKCHAIN</text>
      {[0, 1, 2, 3].map((i) => {
        const y = 78 + i * 36;
        return (
          <g key={i}>
            <rect x="384" y={y} width="142" height="28" rx="2" fill={i % 2 ? PAPER : CARD} stroke={INK} strokeWidth="1" />
            <rect x="394" y={y + 9} width="70" height="10" rx="2" fill={FOREST} opacity="0.22" />
            <rect x="472" y={y + 9} width="44" height="10" rx="2" fill={FOREST} opacity="0.22" />
            {i < 3 ? <line x1="455" y1={y + 28} x2="455" y2={y + 36} stroke={INK} strokeWidth="1.2" /> : null}
          </g>
        );
      })}
      <text x="455" y="232" textAnchor="middle" fontSize="11" fill={MUTED}>every block, checked</text>

      {/* what the node sees */}
      <rect x="10" y="262" width="265" height="168" rx="4" fill={CARD} stroke={CLAY} strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="28" y="292" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={CLAY}>A remote node can see</text>
      {sees.map((s, i) => (
        <g key={s}>
          <Alert cx={38} cy={324 + i * 30} />
          <text x="56" y={329 + i * 30} fontSize="13" fill={INK}>{s}</text>
        </g>
      ))}
      <rect x="285" y="262" width="265" height="168" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="303" y="292" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={FOREST}>It never sees</text>
      {never.map((s, i) => (
        <g key={s}>
          <Check cx={313} cy={324 + i * 30} />
          <text x="331" y={329 + i * 30} fontSize="13" fill={INK}>{s}</text>
        </g>
      ))}
    </svg>
  );
}

export type Cell = "sees" | "hidden" | "never";
export const SETUPS: { name: string; sub: string; cells: [Cell, Cell, Cell] }[] = [
  { name: "Your own node", sub: "you run it", cells: ["hidden", "hidden", "never"] },
  { name: "A remote node", sub: "someone else runs it", cells: ["sees", "hidden", "never"] },
  { name: "Remote node over Tor", sub: "node sees a Tor address", cells: ["hidden", "hidden", "never"] },
  { name: "Light wallet server", sub: "holds your view key", cells: ["sees", "sees", "never"] },
];
export const WHO_SEES_LABEL =
  "What each setup can see. Your own node: no outside party sees your IP address or your incoming payments, and it cannot spend. A remote node: sees your IP address, cannot see your incoming payments, cannot spend. A remote node over Tor: sees a Tor address instead of your IP, cannot see your incoming payments, cannot spend. A light wallet server: sees your IP address and every incoming payment, because it holds your view key, but cannot spend. Any node you use sees the transactions you broadcast through it.";

function CellMark({ kind, cx, cy }: { kind: Cell; cx: number; cy: number }) {
  const word = kind === "sees" ? "Sees it" : kind === "hidden" ? "Hidden" : "Never";
  return (
    <g>
      {kind === "sees" ? <Alert cx={cx - 30} cy={cy} /> : <Check cx={cx - 30} cy={cy} />}
      <text x={cx - 16} y={cy + 4.5} fontSize="12.5" fill={kind === "sees" ? CLAY : INK} fontWeight={kind === "sees" ? 700 : 400}>{word}</text>
    </g>
  );
}

/** Comparison grid: what a node, a remote node, Tor and a light wallet server can each see. */
export function WhoSeesWhatArt() {
  const heads = ["YOUR IP ADDRESS", "PAYMENTS TO YOU", "CAN IT SPEND?"];
  const cx = [285, 405, 525];
  return (
    <svg viewBox="0 0 600 305" role="img" aria-label={WHO_SEES_LABEL} style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="580" height="258" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      {heads.map((h, i) => (
        <text key={h} x={cx[i]} y="42" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1" fill={MUTED}>{h}</text>
      ))}
      {SETUPS.map((s, r) => {
        const y = 58 + r * 52;
        return (
          <g key={s.name}>
            <rect x="11" y={y} width="578" height="52" fill={r % 2 ? CARD : PAPER} />
            <text x="26" y={y + 24} fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={INK}>{s.name}</text>
            <text x="26" y={y + 42} fontSize="11" fill={MUTED}>{s.sub}</text>
            {s.cells.map((c, i) => <CellMark key={i} kind={c} cx={cx[i]!} cy={y + 26} />)}
          </g>
        );
      })}
      <text x="24" y="292" fontSize="11.5" fill={MUTED}>Any node you use also sees the transactions you broadcast through it.</text>
    </svg>
  );
}

export const DECISION_ROWS: { q: [string, string]; a: string; sub: string }[] = [
  { q: ["Are new, or hold small amounts,", "and want to start today"], a: "A remote node (default)", sub: "nothing to install" },
  { q: ["Want the node not to see your IP,", "with no hardware to run"], a: "A remote node over Tor", sub: "slower, but hides your IP" },
  { q: ["Hold larger amounts, or want", "no third party at all"], a: "Your own pruned node", sub: "about 95 GB of disk today" },
  { q: ["Want to mine on P2Pool, or", "run a node for others"], a: "Your own node, always on", sub: "P2Pool needs a synced node" },
];
export const DECISION_LABEL =
  "Which node setup fits you. If you are new or hold small amounts and want to start today, use a remote node, the default in most wallets. If you want the node not to see your IP address and have no hardware to run, use a remote node over Tor. If you hold larger amounts or want no third party at all, run your own pruned node, about 95 GB of disk today. If you want to mine on P2Pool or run a node for others, run your own node and keep it on.";

/** Decision rows: your situation on the left, the setup that fits on the right. */
export function NodeDecisionArt() {
  return (
    <svg viewBox="0 0 600 330" role="img" aria-label={DECISION_LABEL} style={{ width: "100%", height: "auto" }}>
      <text x="14" y="18" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>IF YOU...</text>
      <text x="354" y="18" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={MUTED}>A GOOD FIT</text>
      {DECISION_ROWS.map((r, i) => {
        const y = 30 + i * 74;
        return (
          <g key={r.a}>
            <rect x="10" y={y} width="300" height="62" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
            <text x="26" y={y + 27} fontSize="13.5" fill={INK}>{r.q[0]}</text>
            <text x="26" y={y + 46} fontSize="13.5" fill={INK}>{r.q[1]}</text>
            <Arrow x1={314} x2={346} y={y + 31} color={CLAY} />
            <rect x="350" y={y} width="240" height="62" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
            <text x="366" y={y + 27} fontSize="14" fontWeight="700" fill={FOREST}>{r.a}</text>
            <text x="366" y={y + 47} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{r.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

export const MINING_PATHS: { name: string; rows: [string, string][]; strong: boolean }[] = [
  { name: "Solo", strong: false, rows: [["YOUR OWN NODE", "Required"], ["FEE", "None"], ["PAYOUTS", "Rare, whole blocks"], ["WHO HOLDS REWARDS", "You"]] },
  { name: "A mining pool", strong: false, rows: [["YOUR OWN NODE", "Not needed"], ["FEE", "Set by the operator"], ["PAYOUTS", "Paid by the operator"], ["WHO HOLDS REWARDS", "The operator, first"]] },
  { name: "P2Pool", strong: true, rows: [["YOUR OWN NODE", "Required"], ["FEE", "0%"], ["PAYOUTS", "Straight from blocks"], ["WHO HOLDS REWARDS", "Nobody: paid directly"]] },
];
export const MINING_LABEL =
  "Three ways to mine Monero. Solo: needs your own node, no fee, rare payouts of whole blocks, and you hold the rewards. A mining pool: no node needed, a fee set by the operator, payouts made by the operator, who holds rewards first. P2Pool: needs your own node, 0% fee, payouts straight from the blocks found, and nobody holds the rewards in between. XMRig works with all three, and the official GUI and CLI wallets can solo mine on a CPU.";

/** Three ways to mine, compared on node, fee, payouts and custody. */
export function MiningPathsArt() {
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={MINING_LABEL} style={{ width: "100%", height: "auto" }}>
      {MINING_PATHS.map((p, c) => {
        const x = 10 + c * 197;
        return (
          <g key={p.name}>
            <rect x={x} y="10" width="186" height="250" rx="4" fill={p.strong ? PAPER : CARD} stroke={p.strong ? FOREST : INK} strokeWidth={p.strong ? 1.6 : 1.2} />
            <text x={x + 16} y="44" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={p.strong ? FOREST : INK}>{p.name}</text>
            {p.rows.map(([k, v], i) => (
              <g key={k}>
                <text x={x + 16} y={74 + i * 48} fontSize="11" fontWeight="700" letterSpacing="1" fill={MUTED}>{k}</text>
                <text x={x + 16} y={93 + i * 48} fontSize="12.5" fill={INK}>{v}</text>
              </g>
            ))}
          </g>
        );
      })}
      <text x="14" y="288" fontSize="11.5" fill={MUTED}>XMRig works with all three. The official GUI and CLI wallets can solo mine on a CPU.</text>
    </svg>
  );
}
