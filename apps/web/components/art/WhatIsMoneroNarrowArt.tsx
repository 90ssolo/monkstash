import type { ReactNode } from "react";
import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Phone layouts for the What Is Monero diagrams. Drawn about 360 units wide and stacked
 * vertically, so on a 375px screen every label renders at 11px or larger with no sideways
 * scrolling. The wide versions live in WhatIsMoneroArt.tsx; <Adaptive> shows one or the other.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";
const MONO = "var(--font-mono)";

/** Renders the wide diagram on larger screens and the stacked one on phones (see globals.css). */
export function Adaptive({ wide, narrow }: { wide: ReactNode; narrow: ReactNode }) {
  return (
    <>
      <div className="only-wide">{wide}</div>
      <div className="only-narrow">{narrow}</div>
    </>
  );
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={FOREST} strokeWidth="1.8" strokeLinecap="round">
      <rect x="-9" y="-2" width="18" height="14" rx="2.5" fill={CARD} />
      <path d="M-5.5 -2 v-4 a5.5 5.5 0 0 1 11 0 v4" />
      <circle cx="0" cy="5" r="1.4" fill={FOREST} stroke="none" />
    </g>
  );
}

/** Phone hero: the two ledgers with narrower columns. */
export function LedgerContrastNarrow() {
  const rows = [
    { from: "bc1q8f…7k2", to: "bc1qa2…m9x", amt: "0.84 BTC" },
    { from: "bc1qa2…m9x", to: "bc1q3t…v0e", amt: "0.21 BTC" },
    { from: "bc1q8f…7k2", to: "bc1qz7…p4c", amt: "1.50 BTC" },
  ];
  const cols = [16, 128, 262];
  return (
    <svg viewBox="0 0 360 470" role="img" aria-label="Two ledgers recording the same three payments. On a public ledger, every sender address, receiver address and amount can be read, and repeated addresses link payments together. On Monero's ledger, each sender is one of 16 possible signers, each receiver is a fresh one-time address, and every amount is hidden." style={{ width: "100%", height: "auto" }}>
      <rect x="4" y="4" width="352" height="214" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="16" y="32" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={INK}>A public ledger</text>
      <text x="16" y="52" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>anyone can read this</text>
      {["From", "To", "Amount"].map((h, i) => (
        <text key={h} x={cols[i]} y="80" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{h.toUpperCase()}</text>
      ))}
      {rows.map((r, i) => {
        const y = 92 + i * 32;
        const linked = r.from === "bc1q8f…7k2";
        return (
          <g key={i}>
            <rect x="10" y={y} width="340" height="25" rx="2" fill={i % 2 ? PAPER : CARD} />
            <text x={cols[0]} y={y + 17} fontFamily={MONO} fontSize="11.5" fill={linked ? CLAY : INK} fontWeight={linked ? 700 : 400}>{r.from}</text>
            <text x={cols[1]} y={y + 17} fontFamily={MONO} fontSize="11.5" fill={INK}>{r.to}</text>
            <text x={cols[2]} y={y + 17} fontFamily={MONO} fontSize="11.5" fill={INK}>{r.amt}</text>
          </g>
        );
      })}
      <text x="16" y="206" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={CLAY}>Same sender twice: anyone can link them.</text>

      <rect x="4" y="236" width="352" height="230" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <MoneroSymbol variant="color" size={22} x={16} y={250} />
      <text x="46" y="267" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={FOREST}>Monero&apos;s ledger</text>
      <text x="16" y="290" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>only the people involved can read it</text>
      {["From", "To", "Amount"].map((h, i) => (
        <text key={h} x={cols[i]} y="318" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{h.toUpperCase()}</text>
      ))}
      {[0, 1, 2].map((i) => {
        const y = 330 + i * 32;
        return (
          <g key={i}>
            <rect x="10" y={y} width="340" height="25" rx="2" fill={i % 2 ? CARD : PAPER} stroke={FOREST} strokeOpacity="0.18" />
            {Array.from({ length: 16 }).map((_, d) => (
              <circle key={d} cx={cols[0]! + 4 + d * 6.4} cy={y + 12.5} r="2.2" fill={FOREST} opacity={0.3} />
            ))}
            <rect x={cols[1]} y={y + 8} width="112" height="9" rx="2" fill={FOREST} opacity="0.22" />
            <rect x={cols[2]} y={y + 8} width="80" height="9" rx="2" fill={FOREST} opacity="0.22" />
          </g>
        );
      })}
      <text x={cols[0]} y="448" fontFamily={SERIF} fontStyle="italic" fontSize="11.5" fill={FOREST}>1 of 16 signers</text>
      <text x={cols[1]} y="448" fontFamily={SERIF} fontStyle="italic" fontSize="11.5" fill={FOREST}>one-time address</text>
      <text x={cols[2]} y="448" fontFamily={SERIF} fontStyle="italic" fontSize="11.5" fill={FOREST}>hidden</text>
    </svg>
  );
}

/** Phone version of the three secrets: one row per secret. */
export function ThreeSecretsNarrow() {
  const rows = [
    { label: "Who paid", tool: "Ring signatures", note: "your signature hides among 15 decoys" },
    { label: "Who got paid", tool: "Stealth addresses", note: "a fresh address for every payment" },
    { label: "How much", tool: "RingCT", note: "amounts encrypted, totals still checked" },
  ];
  return (
    <svg viewBox="0 0 360 330" role="img" aria-label="A Monero payment has three secrets. Ring signatures hide who paid, stealth addresses hide who got paid, and RingCT hides how much was sent." style={{ width: "100%", height: "auto" }}>
      <text x="8" y="16" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ONE MONERO PAYMENT</text>
      {rows.map((r, i) => {
        const y = 28 + i * 100;
        return (
          <g key={r.label}>
            <rect x="4" y={y} width="352" height="88" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
            <text x="20" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={INK}>{r.label}</text>
            <rect x="20" y={y + 44} width="110" height="10" rx="2" fill={FOREST} opacity="0.22" />
            <Lock x={150} y={y + 46} />
            <rect x="182" y={y + 14} width="160" height="34" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
            <text x="262" y={y + 36} textAnchor="middle" fontWeight="700" fontSize="13.5" fill={FOREST}>{r.tool}</text>
            <text x="20" y={y + 76} fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={INK}>{r.note}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Panel({ y, title, sub, items, ok }: { y: number; title: string; sub: string; items: string[]; ok: boolean }) {
  return (
    <g>
      <rect x="4" y={y} width="352" height="226" rx="4" fill={ok ? PAPER : CARD} stroke={ok ? FOREST : CLAY} strokeWidth="1.4" strokeDasharray={ok ? undefined : "5 4"} />
      <text x="20" y={y + 30} fontFamily={SERIF} fontStyle="italic" fontSize="18" fill={ok ? FOREST : CLAY}>{title}</text>
      <text x="20" y={y + 50} fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>{sub}</text>
      {items.map((h, i) => {
        const cy = y + 78 + i * 30;
        return (
          <g key={h}>
            {ok ? (
              <>
                <circle cx="30" cy={cy} r="9" fill={FOREST} />
                <path d={`M25.5 ${cy} l3 3 l5.5 -6`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <circle cx="30" cy={cy} r="9" fill="none" stroke={CLAY} strokeWidth="1.6" />
                <path d={`M30 ${cy - 5} v5.5`} stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="30" cy={cy + 4} r="1.1" fill={CLAY} />
              </>
            )}
            <text x="48" y={cy + 5} fontSize="13.5" fill={INK}>{h}</text>
          </g>
        );
      })}
    </g>
  );
}

/** Phone version: what is hidden on top, what can leak below. */
export function HiddenVsLeakNarrow() {
  return (
    <svg viewBox="0 0 360 470" role="img" aria-label="What Monero hides on the blockchain: sender, receiver, amount, balance and payment history. What can still leak around it: your IP address, exchange records tied to your identity, addresses you post publicly, screenshots and chats, and timing you reveal yourself." style={{ width: "100%", height: "auto" }}>
      <Panel y={4} title="Hidden by Monero" sub="ON THE BLOCKCHAIN" items={["Sender", "Receiver", "Amount", "Your balance", "Your payment history"]} ok />
      <Panel y={240} title="Can still leak" sub="AROUND IT, SO HABITS MATTER" items={["Your IP address, seen by the node", "Exchange records tied to your ID", "Addresses you post in public", "Screenshots and chat messages", "Timing you reveal yourself"]} ok={false} />
    </svg>
  );
}

/** Phone version of the supply sketch. */
export function EmissionShapeNarrow() {
  return (
    <svg viewBox="0 0 360 300" role="img" aria-label="A sketch of Monero's supply over time, not to scale. New coins were issued quickly in the early years, the curve flattened, and from the end of May 2022 a small fixed reward of 0.6 XMR per block continues forever." style={{ width: "100%", height: "auto" }}>
      <rect x="4" y="4" width="352" height="292" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="20" y="30" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>TOTAL SUPPLY</text>
      <line x1="24" y1="200" x2="336" y2="200" stroke={INK} strokeWidth="1.2" />
      <line x1="24" y1="44" x2="24" y2="200" stroke={INK} strokeWidth="1.2" />
      {([["2014", 30], ["2022", 196], ["later", 326]] as const).map(([l, x]) => (
        <text key={l} x={x} y="218" textAnchor="middle" fontSize="11" fill={MUTED}>{l}</text>
      ))}
      <path d="M24 200 C 70 110, 120 80, 196 72" fill="none" stroke={FOREST} strokeWidth="3" />
      <path d="M196 72 L 336 56" fill="none" stroke={CLAY} strokeWidth="3" />
      <circle cx="196" cy="72" r="5" fill={CLAY} />
      <line x1="196" y1="72" x2="196" y2="200" stroke={CLAY} strokeWidth="1" strokeDasharray="3 3" />
      <text x="20" y="246" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={FOREST}>Main emission: rewards shrink over time.</text>
      <text x="20" y="268" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={CLAY}>Tail emission from May 2022: 0.6 XMR per block.</text>
      <text x="340" y="288" textAnchor="end" fontSize="10" fill={MUTED}>shape only, not to scale</text>
    </svg>
  );
}
