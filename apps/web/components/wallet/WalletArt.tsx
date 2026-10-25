/**
 * Presentational line-art for the wallet screens. Purely decorative (aria-hidden): the
 * sizzle line next to each figure carries the meaning. Colours come from CSS variables set
 * by the context panel (paper or ink), so one drawing works on both.
 */
import type { ReactNode, SVGProps } from "react";

const A = "var(--art-a)";
const B = "var(--art-b)";
const BG = "var(--art-bg)";
const sans = { fontFamily: "var(--font-sans)" } as const;
const serif = { fontFamily: "var(--font-display)" } as const;

function Svg({ children, ...p }: { children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 280 190" aria-hidden="true" focusable="false" {...p}>{children}</svg>
  );
}

/** Welcome: a seal with a key inside (your keys, kept on your device). */
export function ArtWelcome(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <g transform="translate(140 92)" fill="none">
        <circle r="80" stroke={A} strokeWidth="1.4" opacity=".45" />
        <circle r="68" stroke={A} strokeWidth="1" strokeDasharray="2 7" strokeLinecap="round" opacity=".7" />
        <circle r="50" stroke={A} strokeWidth="2" />
        <g transform="rotate(-35)" stroke={B} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="-16" cy="0" r="12" />
          <circle cx="-16" cy="0" r="4" strokeWidth="2.4" />
          <path d="M-4 0H30M20 0v9M28 0v6" />
        </g>
      </g>
      <text x="140" y="184" style={serif} fontStyle="italic" fontSize="14" fill={A} textAnchor="middle" opacity=".85">made and kept on your device</text>
    </Svg>
  );
}

/** Recovery words: a sheet being written on, with a pencil. */
export function ArtWords(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <rect x="50" y="12" width="150" height="164" rx="4" fill={BG} stroke={A} strokeWidth="2" />
      <path d="M50 38h150" stroke={A} strokeWidth="1.4" />
      <text x="64" y="29" style={sans} fontSize="8" fontWeight="600" letterSpacing="1.4" fill={B}>25 WORDS, IN ORDER</text>
      <g stroke={A} strokeWidth="1" opacity=".25"><path d="M50 62h150M50 82h150M50 102h150M50 122h150M50 142h150M50 162h150" /></g>
      <g stroke={B} strokeWidth="2" strokeLinecap="round"><path d="M64 60h6M64 80h6M64 100h6M64 120h6M64 140h6" /></g>
      <g stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity=".75">
        <path d="M82 60h34M126 60h28M82 80h24M116 80h38M82 100h40M132 100h20M82 120h30M122 120h32" />
      </g>
      <g transform="translate(196 118) rotate(38)">
        <rect x="0" y="-6" width="64" height="12" rx="2" fill={BG} stroke={B} strokeWidth="2" />
        <path d="M0 -6L-14 0L0 6z" fill={BG} stroke={B} strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 -6v12" stroke={B} strokeWidth="1.6" />
      </g>
    </Svg>
  );
}

/** Confirm backup: three words checked off. */
export function ArtConfirm(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      {[24, 78, 132].map((y, i) => (
        <g key={y}>
          <rect x="40" y={y} width="200" height="38" rx="4" fill={BG} stroke={A} strokeWidth="1.8" />
          <text x="54" y={y + 23} style={sans} fontSize="9" fontWeight="600" letterSpacing="1.3" fill={B}>{`WORD ${["#A", "#B", "#C"][i]}`}</text>
          <path d={`M112 ${y + 19}h78`} stroke={A} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" opacity=".7" />
          <circle cx="216" cy={y + 19} r="10" fill={B} />
          <path d={`M210 ${y + 19}l4 4 7-8`} fill="none" stroke={BG} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </Svg>
  );
}

/** Restore: a sheet with a circular arrow bringing it back. */
export function ArtRestore(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <rect x="100" y="50" width="80" height="90" rx="4" fill={BG} stroke={A} strokeWidth="2" />
      <g stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity=".7"><path d="M114 74h40M114 90h52M114 106h34M114 122h46" /></g>
      <g fill="none" stroke={B} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M67 68A78 78 0 0 1 167 22" />
        <path d="M156 24L167 22L160 13" />
        <path d="M213 122A78 78 0 0 1 113 168" />
        <path d="M124 166L113 168L120 177" />
      </g>
    </Svg>
  );
}

/** Watch-only: an eye. */
export function ArtWatch(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M26 92c28-42 64-62 114-62s86 20 114 62c-28 42-64 62-114 62S54 134 26 92z" fill={BG} stroke={A} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="140" cy="92" r="30" fill="none" stroke={A} strokeWidth="2" />
      <circle cx="140" cy="92" r="11" fill={B} />
      <path d="M52 168h176" stroke={A} strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" opacity=".6" />
      <text x="140" y="184" style={serif} fontStyle="italic" fontSize="13" fill={A} textAnchor="middle" opacity=".85">can look, cannot spend</text>
    </Svg>
  );
}

/** Password and unlock: a padlock and password dots. */
export function ArtLock(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M112 88V68a28 28 0 0 1 56 0v20" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" />
      <rect x="92" y="86" width="96" height="76" rx="10" fill={A} />
      <circle cx="140" cy="116" r="8" fill={BG} />
      <path d="M140 122v16" stroke={BG} strokeWidth="4" strokeLinecap="round" />
      <g fill={B}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={96 + i * 12.6} cy="180" r="3" />)}</g>
    </Svg>
  );
}

/** Authenticator: a phone showing a code. */
export function ArtAuth(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <rect x="92" y="12" width="96" height="166" rx="14" fill={BG} stroke={A} strokeWidth="2.2" />
      <path d="M126 24h28" stroke={A} strokeWidth="2.4" strokeLinecap="round" />
      <text x="140" y="62" style={sans} fontSize="8" fontWeight="600" letterSpacing="1.4" fill={B} textAnchor="middle">YOUR CODE</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={103 + i * 14} y="74" width="11" height="22" rx="2.5" fill="none" stroke={A} strokeWidth="1.6" />
          <circle cx={108.5 + i * 14} cy="85" r="2" fill={A} />
        </g>
      ))}
      <rect x="103" y="116" width="74" height="6" rx="3" fill="none" stroke={A} strokeWidth="1.4" opacity=".7" />
      <rect x="103" y="116" width="46" height="6" rx="3" fill={B} />
      <path d="M118 150h44" stroke={A} strokeWidth="2" strokeLinecap="round" opacity=".5" />
    </Svg>
  );
}

/** Opening: a browser window loading the engine. */
export function ArtEngine(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <rect x="40" y="26" width="200" height="130" rx="6" fill={BG} stroke={A} strokeWidth="2" />
      <path d="M40 48h200" stroke={A} strokeWidth="1.6" />
      <g fill={B}><circle cx="54" cy="37" r="3" /><circle cx="66" cy="37" r="3" opacity=".6" /><circle cx="78" cy="37" r="3" opacity=".35" /></g>
      <g stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity=".65"><path d="M62 74h70M62 92h110" /></g>
      <rect x="62" y="118" width="156" height="8" rx="4" fill="none" stroke={A} strokeWidth="1.6" />
      <rect x="62" y="118" width="86" height="8" rx="4" fill={B} />
    </Svg>
  );
}

/* ---- Option-card icons (theme colours: the same Ledger values on paper) ---- */

type IP = SVGProps<SVGSVGElement>;
const ink = "var(--forest-text)";
const clay = "var(--clay)";

export function IconCreate(p: IP) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="10" y="8" width="30" height="40" rx="3" stroke={ink} strokeWidth="2" />
      <path d="M17 20h16M17 28h16M17 36h9" stroke={ink} strokeWidth="2" opacity=".55" />
      <circle cx="41" cy="40" r="9" fill="var(--surface)" stroke={clay} strokeWidth="2.2" />
      <path d="M41 35v10M36 40h10" stroke={clay} strokeWidth="2.4" />
    </svg>
  );
}

export function IconRestore(p: IP) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="16" y="14" width="24" height="28" rx="3" stroke={ink} strokeWidth="2" />
      <path d="M22 24h12M22 31h12" stroke={ink} strokeWidth="2" opacity=".55" />
      <path d="M10 30a18 18 0 0 1 30-14" stroke={clay} strokeWidth="2.4" />
      <path d="M41 9l-1 8-8-1" stroke={clay} strokeWidth="2.4" />
    </svg>
  );
}

/** Two windows and a file passing from one to the other: moving a wallet between devices. */
export function IconMove(p: IP) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="5" y="12" width="20" height="16" rx="2.5" stroke={ink} strokeWidth="2" />
      <path d="M5 17h20" stroke={ink} strokeWidth="2" opacity=".55" />
      <rect x="31" y="28" width="20" height="16" rx="2.5" stroke={ink} strokeWidth="2" />
      <path d="M31 33h20" stroke={ink} strokeWidth="2" opacity=".55" />
      <path d="M17 34c0 6 4 9 10 9" stroke={clay} strokeWidth="2.4" />
      <path d="M24 39l4 4-4 4" stroke={clay} strokeWidth="2.4" />
      <path d="M36 6h7l4 4v9h-11z" stroke={clay} strokeWidth="2" />
    </svg>
  );
}

export function IconWatch(p: IP) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 28c6-10 14-15 23-15s17 5 23 15c-6 10-14 15-23 15S11 38 5 28z" stroke={ink} strokeWidth="2" />
      <circle cx="28" cy="28" r="7" stroke={ink} strokeWidth="2" />
      <circle cx="28" cy="28" r="2.6" fill={clay} stroke="none" />
    </svg>
  );
}
