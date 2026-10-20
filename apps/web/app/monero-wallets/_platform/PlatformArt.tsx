import type { SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
import type { PlatformKey } from "./types";

type P = SVGProps<SVGSVGElement>;

const F = "#1f4733";
const C = "#b4532a";
const CD = "#e9a07a";
const PAPER = "#fbfbf7";
const SOFT = "#edeee6";
const GREY = "#c7c8bb";
const MUTE = "#6b7a70";
const sans = { fontFamily: "var(--font-sans)" } as const;
const serif = { fontFamily: "var(--font-display)" } as const;

/* ---------- Neutral, generic device drawings, centred on the origin ---------- */

function Device({ kind }: { kind: PlatformKey }) {
  if (kind === "desktop") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect x="-46" y="-44" width="92" height="62" rx="4" fill={PAPER} stroke={F} strokeWidth="2" />
        <path d="M-8 18V34M-24 34H24" stroke={F} strokeWidth="2" fill="none" />
        <g stroke={F} strokeWidth="2" opacity=".5" fill="none"><path d="M-34 -30H-6M-34 -20H10" /></g>
        <circle cx="16" cy="-4" r="10" fill="none" stroke={C} strokeWidth="1.8" />
        <path d="M11 -4h10M18 -8l4 4-4 4" stroke={C} strokeWidth="1.8" fill="none" />
      </g>
    );
  }
  if (kind === "hardware") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect x="-24" y="-52" width="48" height="94" rx="8" fill={PAPER} stroke={F} strokeWidth="2" />
        <rect x="-16" y="-42" width="32" height="26" rx="3" fill={SOFT} stroke={GREY} />
        <rect x="-5" y="-30" width="10" height="8" rx="1.5" fill={F} />
        <path d="M-3 -30v-3a3 3 0 016 0v3" fill="none" stroke={F} strokeWidth="1.6" />
        <circle cx="-9" cy="6" r="5" fill="none" stroke={C} strokeWidth="1.8" />
        <circle cx="9" cy="6" r="5" fill="none" stroke={C} strokeWidth="1.8" />
        <path d="M-14 26H14" stroke={F} strokeWidth="1.4" opacity=".5" />
        <rect x="-9" y="42" width="18" height="10" rx="2" fill={SOFT} stroke={F} strokeWidth="1.6" />
      </g>
    );
  }
  const isIphone = kind === "iphone";
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="-28" y="-52" width="56" height="104" rx={isIphone ? 12 : 8} fill={PAPER} stroke={F} strokeWidth="2" />
      {isIphone ? <rect x="-9" y="-46" width="18" height="5" rx="2.5" fill={F} /> : <circle cx="0" cy="-45" r="2.4" fill={F} />}
      <g stroke={F} strokeWidth="2" opacity=".5" fill="none"><path d="M-18 -26H8M-18 -16H18" /></g>
      <circle cx="0" cy="12" r="15" fill="none" stroke={C} strokeWidth="1.8" />
      <path d="M-5 12h10M2 8l4 4-4 4" stroke={C} strokeWidth="1.8" fill="none" />
      {isIphone ? <path d="M-10 44H10" stroke={F} strokeWidth="2.4" opacity=".55" /> : <path d="M-12 44h.01M0 44h.01M12 44h.01" stroke={F} strokeWidth="3" opacity=".55" />}
    </g>
  );
}

/** A small stack of Monero coins in the line-art palette. */
function Coins({ x, y, n, color = C, size = 22 }: { x: number; y: number; n: number; color?: string; size?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const cx = x + (i % 3) * (size * 0.95) - ((n > 1 ? Math.min(n, 3) - 1 : 0) * size * 0.95) / 2;
        const cy = y - Math.floor(i / 3) * (size * 0.8);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={size * 0.62} fill={PAPER} stroke={color} strokeWidth="1.6" />
            <MoneroSymbol x={cx - size / 2} y={cy - size / 2} size={size} variant="mono" style={{ color }} />
          </g>
        );
      })}
    </g>
  );
}

/* ---------- Figure 1: where your keys live, and what the wallet asks the network ---------- */

export function HeroArt({
  kind, deviceLabel, deviceTag, keysTag, banner, companion, ...p
}: P & { kind: PlatformKey; deviceLabel: string; deviceTag: string; keysTag: string; banner: string; companion?: boolean }) {
  const dx = companion ? 95 : 130;
  const nodeX = 468;
  return (
    <svg viewBox="0 0 570 292" role="img" aria-labelledby={`pHeroT-${kind} pHeroD-${kind}`} {...p}>
      <title id={`pHeroT-${kind}`}>{deviceLabel} keeping keys on the device and asking a Monero node about the network</title>
      <desc id={`pHeroD-${kind}`}>A {deviceLabel.toLowerCase()} on the left holds your keys. A dashed line runs to a small cluster of Monero nodes on the right. Only questions about the network travel along the line, not your keys.</desc>
      <rect width="570" height="292" fill={PAPER} />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 48H570M0 108H570M0 168H570M0 228H570" /></g>

      <g transform={`translate(${dx} 36)`}>
        <rect x="-70" y="-12" width="140" height="22" rx="3" fill={C} />
        <text x="0" y="3" style={sans} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={PAPER} textAnchor="middle">{keysTag}</text>
        <path d="M0 10V20" stroke={C} strokeWidth="1.6" />
      </g>
      <g transform={`translate(${dx} 118) scale(1.35)`}><Device kind={kind} /></g>
      <text x={dx} y="206" style={serif} fontStyle="italic" fontSize="19" fill={F} textAnchor="middle">{deviceLabel}</text>
      <text x={dx} y="224" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">{deviceTag}</text>

      {companion && (
        <g transform="translate(265 118)">
          <g strokeLinecap="round" strokeLinejoin="round">
            <rect x="-34" y="-26" width="68" height="46" rx="4" fill={PAPER} stroke={F} strokeWidth="2" />
            <path d="M-6 20V30M-20 30H20" stroke={F} strokeWidth="2" fill="none" />
            <g stroke={F} strokeWidth="2" opacity=".5" fill="none"><path d="M-24 -14H8M-24 -4H18" /></g>
          </g>
          <text x="0" y="88" style={serif} fontStyle="italic" fontSize="16" fill={F} textAnchor="middle">Companion wallet</text>
          <text x="0" y="104" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">SHOWS, DOES NOT SIGN</text>
        </g>
      )}

      <path d={companion ? `M${dx + 40} 118H220M312 118H${nodeX - 70}` : `M${dx + 62} 118H${nodeX - 70}`} stroke={C} strokeWidth="1.6" strokeDasharray="5 6" fill="none" strokeLinecap="round" />
      <path d={`M${nodeX - 76} 112l8 6-8 6`} stroke={C} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {!companion && (
        <>
          <text x={(dx + 62 + nodeX - 70) / 2} y="104" style={serif} fontStyle="italic" fontSize="15" fill={C} textAnchor="middle">asks about the network</text>
          <text x={(dx + 62 + nodeX - 70) / 2} y="140" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">NO KEYS SENT</text>
        </>
      )}

      <g transform={`translate(${nodeX} 118)`}>
        <g stroke={F} strokeWidth="1.4" fill="none"><path d="M0 0L-44 -40M0 0L46 -34M0 0L-40 40M0 0L44 42" /></g>
        <g fill={PAPER} stroke={F} strokeWidth="1.8"><circle cx="-44" cy="-40" r="9" /><circle cx="46" cy="-34" r="9" /><circle cx="-40" cy="40" r="9" /><circle cx="44" cy="42" r="9" /></g>
        <circle r="26" fill={PAPER} stroke={C} strokeWidth="2" />
        <MoneroSymbol x={-16} y={-16} size={32} variant="color" />
      </g>
      <text x={nodeX} y="206" style={serif} fontStyle="italic" fontSize="19" fill={F} textAnchor="middle">The Monero network</text>
      <text x={nodeX} y="224" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">NODES ANSWER QUESTIONS</text>

      <g transform="translate(24 252)">
        <rect width="522" height="26" rx="3" fill={F} />
        <text x="261" y="17.5" style={sans} fontSize="10.5" fontWeight="600" letterSpacing="1.4" fill={PAPER} textAnchor="middle">{banner}</text>
      </g>
    </svg>
  );
}

/* ---------- Figure 2: small amounts here, savings there ---------- */

export function FitArt({
  kind, leftDevice, leftLabel, leftTag, ...p
}: P & { kind: PlatformKey; leftDevice: PlatformKey; leftLabel: string; leftTag: string }) {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-labelledby={`pFitT-${kind} pFitD-${kind}`} {...p}>
      <title id={`pFitT-${kind}`}>Small amounts in an everyday wallet, savings on a hardware wallet</title>
      <desc id={`pFitD-${kind}`}>Two panels. The left panel shows {leftLabel.toLowerCase()} holding a few Monero coins for everyday spending. The right panel shows a hardware wallet holding a larger pile. An arrow between them reads: move the surplus over.</desc>
      <rect width="560" height="300" fill={PAPER} />

      <rect x="20" y="20" width="238" height="226" rx="6" fill={SOFT} stroke={GREY} />
      <rect x="302" y="20" width="238" height="226" rx="6" fill={SOFT} stroke={F} strokeWidth="1.6" />

      <text x="139" y="46" style={sans} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={C} textAnchor="middle">EVERYDAY</text>
      <text x="421" y="46" style={sans} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={C} textAnchor="middle">SAVINGS</text>

      <g transform="translate(139 126) scale(0.95)"><Device kind={leftDevice} /></g>
      <Coins x={139} y={218} n={2} />
      <g transform="translate(421 126) scale(0.95)"><Device kind="hardware" /></g>
      <Coins x={421} y={226} n={6} />

      <path d="M262 133H298M290 125l8 8-8 8" stroke={C} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="280" y="116" style={serif} fontStyle="italic" fontSize="12" fill={C} textAnchor="middle">move</text>
      <text x="280" y="160" style={serif} fontStyle="italic" fontSize="12" fill={C} textAnchor="middle">surplus</text>

      <text x="139" y="272" style={serif} fontStyle="italic" fontSize="17" fill={F} textAnchor="middle">{leftLabel}</text>
      <text x="139" y="289" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">{leftTag}</text>
      <text x="421" y="272" style={serif} fontStyle="italic" fontSize="17" fill={F} textAnchor="middle">A hardware wallet</text>
      <text x="421" y="289" style={sans} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">KEYS STAY OFF THE COMPUTER</text>
    </svg>
  );
}

/* ---------- Figure 3 (dark band): read the publisher, not the app name ---------- */

export function StoreArt({
  kind, store, good, bad, foot, ...p
}: P & { kind: PlatformKey; store: string; good: string; bad: string; foot: string }) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-labelledby={`pStoreT-${kind} pStoreD-${kind}`} {...p}>
      <title id={`pStoreT-${kind}`}>Two listings with the same name, only one from the right source</title>
      <desc id={`pStoreD-${kind}`}>The top listing is marked with a check because its source matches the official website. The bottom listing has the same name but a source you do not recognise, and is marked as a trap.</desc>
      <rect width="520" height="300" rx="8" fill="#22342a" />

      <text x="28" y="40" style={sans} fontSize="10" fontWeight="600" letterSpacing="1.6" fill="#9fb0a2">{store}</text>

      <rect x="28" y="52" width="464" height="86" rx="10" fill="#1b2a22" stroke="#cfd8cb" strokeWidth="1.6" />
      <rect x="46" y="70" width="48" height="48" rx="11" fill="none" stroke="#cfd8cb" strokeWidth="1.6" />
      <MoneroSymbol x={56} y={80} size={28} variant="mono" style={{ color: "#cfd8cb" }} />
      <text x="110" y="88" style={sans} fontSize="16" fontWeight="600" fill="#f6f5ec">Wallet name</text>
      <text x="110" y="110" style={sans} fontSize="13" fill="#cfd8cb">{good}</text>
      <g transform="translate(462 95)"><circle r="12" fill="none" stroke="#cfd8cb" strokeWidth="1.8" /><path d="M-5.5 0.5l3.8 3.8 7.4-8" fill="none" stroke="#cfd8cb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></g>

      <path d="M28 160H492" stroke="#38503f" strokeDasharray="3 6" />

      <rect x="28" y="176" width="464" height="86" rx="10" fill="#1b2a22" stroke={CD} strokeWidth="1.6" strokeDasharray="5 4" />
      <rect x="46" y="194" width="48" height="48" rx="11" fill="none" stroke={CD} strokeWidth="1.6" strokeDasharray="4 3" />
      <MoneroSymbol x={56} y={204} size={28} variant="mono" style={{ color: CD }} />
      <text x="110" y="212" style={sans} fontSize="16" fontWeight="600" fill="#f6f5ec">Wallet name</text>
      <text x="110" y="234" style={sans} fontSize="13" fill={CD}>{bad}</text>
      <g transform="translate(462 219)"><circle r="12" fill="none" stroke={CD} strokeWidth="1.8" /><path d="M-5 -5L5 5M5 -5L-5 5" stroke={CD} strokeWidth="2.2" strokeLinecap="round" /></g>

      <text x="260" y="286" style={serif} fontStyle="italic" fontSize="16" fill="#cfd8cb" textAnchor="middle">{foot}</text>
    </svg>
  );
}

/* ---------- Small icons ---------- */

export function ArrowIcon(p: P) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" {...p}><path d="M3 9h11M10 4.5L14.5 9 10 13.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
