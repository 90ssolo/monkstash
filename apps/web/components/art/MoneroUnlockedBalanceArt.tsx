import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figures for the "Monero unlocked balance" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

const ARIA =
  "Why a send can lock part of your balance. Before: the wallet holds two payments, 3 XMR and 2 XMR, all 5 spendable. You send 1 XMR. The wallet spends the whole 2 XMR payment, 1 XMR goes to the recipient and about 1 XMR comes back to you as change, minus a small fee. After: the total is about 4 XMR, but only 3 XMR is spendable now. The change is locked for 10 blocks, about 20 minutes. Trying to send 3.5 XMR in that window gives the error: amount is more than unlocked balance.";

function Coin({ x, y, w, label, locked }: { x: number; y: number; w: number; label: string; locked?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="34" rx="4" fill={locked ? "none" : PAPER} stroke={locked ? CLAY : FOREST} strokeWidth="1.4" strokeDasharray={locked ? "4 4" : undefined} />
      <text x={x + w / 2} y={y + 22} fontSize="14" fill={locked ? CLAY : FOREST} textAnchor="middle" style={LABEL}>{label}</text>
    </g>
  );
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={CLAY} strokeWidth="1.5" strokeLinecap="round">
      <rect x="-7" y="-1" width="14" height="11" rx="2" fill={PAPER} />
      <path d="M-4 -1 v-3 a4 4 0 0 1 8 0 v3" />
    </g>
  );
}

function Wide() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label={ARIA}>
      <text x="20" y="28" fontSize="15" fill={FOREST} style={LABEL}>Before: 5 XMR, all spendable</text>
      <Coin x={20} y={44} w={150} label="3 XMR payment" />
      <Coin x={180} y={44} w={110} label="2 XMR payment" />

      <path d="M235 84 V128" stroke={CLAY} strokeWidth="1.5" fill="none" />
      <path d="M229 120 L235 128 L241 120" stroke={CLAY} strokeWidth="1.5" fill="none" />
      <text x="250" y="110" fontSize="13" fill={CLAY} style={LABEL}>send 1 XMR: the whole 2 XMR payment is spent</text>

      <Coin x={180} y={136} w={110} label="1 XMR to them" />
      <Coin x={300} y={136} w={170} label="about 1 XMR change" locked />
      <Lock x={484} y={150} />
      <text x="500" y="158" fontSize="13" fill={CLAY} style={LABEL}>locked 10 blocks, about 20 min</text>

      <line x1="20" y1="196" x2="700" y2="196" stroke={GREY} strokeWidth="0.8" strokeDasharray="3 5" />

      <text x="20" y="226" fontSize="15" fill={FOREST} style={LABEL}>After: total about 4 XMR</text>
      <text x="20" y="250" fontSize="15" fill={FOREST} style={LABEL}>spendable now: 3 XMR</text>
      <text x="300" y="226" fontSize="14" fill={CLAY} style={LABEL}>Try to send 3.5 XMR now and the wallet says:</text>
      <rect x="300" y="236" width="380" height="34" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="490" y="258" fontSize="14" fill={CLAY} textAnchor="middle" style={{ fontFamily: "var(--font-mono)" }}>Amount is more than unlocked balance.</text>
      <text x="20" y="290" fontSize="12.5" fill={GREY} style={LABEL}>Fee left out to keep the numbers simple. Nothing is lost: wait for the lock to pass.</text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg viewBox="0 0 360 480" width="100%" role="img" aria-label={ARIA}>
      <text x="14" y="26" fontSize="16" fill={FOREST} style={LABEL}>Before: 5 XMR, all spendable</text>
      <Coin x={14} y={40} w={160} label="3 XMR payment" />
      <Coin x={186} y={40} w={160} label="2 XMR payment" />

      <path d="M266 80 V132" stroke={CLAY} strokeWidth="1.5" fill="none" />
      <path d="M260 124 L266 132 L272 124" stroke={CLAY} strokeWidth="1.5" fill="none" />
      <text x="14" y="102" fontSize="13.5" fill={CLAY} style={LABEL}>send 1 XMR: the whole</text>
      <text x="14" y="120" fontSize="13.5" fill={CLAY} style={LABEL}>2 XMR payment is spent</text>

      <Coin x={14} y={140} w={160} label="1 XMR to them" />
      <Coin x={186} y={140} w={160} label="about 1 XMR change" locked />
      <Lock x={200} y={196} />
      <text x="214" y="204" fontSize="13" fill={CLAY} style={LABEL}>locked 10 blocks</text>
      <text x="214" y="222" fontSize="13" fill={CLAY} style={LABEL}>about 20 minutes</text>

      <line x1="14" y1="246" x2="346" y2="246" stroke={GREY} strokeWidth="0.8" strokeDasharray="3 5" />

      <text x="14" y="278" fontSize="16" fill={FOREST} style={LABEL}>After: total about 4 XMR</text>
      <text x="14" y="302" fontSize="16" fill={FOREST} style={LABEL}>spendable now: 3 XMR</text>
      <text x="14" y="344" fontSize="14" fill={CLAY} style={LABEL}>Send 3.5 XMR now and the wallet says:</text>
      <rect x="14" y="356" width="332" height="58" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="180" y="381" fontSize="13.5" fill={CLAY} textAnchor="middle" style={{ fontFamily: "var(--font-mono)" }}>Amount is more than</text>
      <text x="180" y="401" fontSize="13.5" fill={CLAY} textAnchor="middle" style={{ fontFamily: "var(--font-mono)" }}>unlocked balance.</text>
      <text x="14" y="446" fontSize="13" fill={GREY} style={LABEL}>Fee left out to keep the numbers simple.</text>
      <text x="14" y="466" fontSize="13" fill={GREY} style={LABEL}>Nothing is lost: wait for the lock to pass.</text>
    </svg>
  );
}

/** The change-output surprise that triggers the unlocked balance error. */
export function ChangeLockArt() {
  return <Adaptive wide={<Wide />} narrow={<Narrow />} />;
}
