import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const F = "#1f4733";
const C = "#b4532a";
const PAPER = "#fbfbf7";
const SOFT = "#edeee6";
const GREY = "#c7c8bb";
const MUTE = "#6b7a70";

/* ---------- The four device drawings, centred on the origin ---------- */

function BrowserDev() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="-55" y="-42" width="110" height="84" rx="5" fill={PAPER} stroke={F} strokeWidth="2" />
      <path d="M-55 -26H55" stroke={F} strokeWidth="1.4" />
      <g fill={F} opacity=".55"><circle cx="-46" cy="-34" r="2.2" /><circle cx="-39" cy="-34" r="2.2" /><circle cx="-32" cy="-34" r="2.2" /></g>
      <rect x="-20" y="-38" width="68" height="8" rx="4" fill={SOFT} stroke={GREY} />
      <g stroke={F} strokeWidth="2" opacity=".5" fill="none"><path d="M-44 -10H14M-44 4H34M-44 18H-6" /></g>
      <circle cx="33" cy="22" r="10" fill="none" stroke={C} strokeWidth="1.8" />
      <path d="M33 17v10M28 22h10" stroke={C} strokeWidth="1.8" fill="none" />
    </g>
  );
}

function PhoneDev() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="-28" y="-52" width="56" height="104" rx="10" fill={PAPER} stroke={F} strokeWidth="2" />
      <path d="M-8 -44H8" stroke={F} strokeWidth="2" />
      <g stroke={F} strokeWidth="2" opacity=".5" fill="none"><path d="M-18 -26H8M-18 -16H18" /></g>
      <circle cx="0" cy="12" r="15" fill="none" stroke={C} strokeWidth="1.8" />
      <path d="M-5 12h10M2 8l4 4-4 4" stroke={C} strokeWidth="1.8" fill="none" />
      <path d="M-10 42H10" stroke={F} strokeWidth="2" opacity=".55" />
    </g>
  );
}

function DesktopDev() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="-46" y="-44" width="92" height="62" rx="4" fill={PAPER} stroke={F} strokeWidth="2" />
      <path d="M-8 18V34M-24 34H24" stroke={F} strokeWidth="2" fill="none" />
      <g stroke={F} strokeWidth="1.4" fill="none"><path d="M-24 -14L0 2L24 -20M0 2V-14" /></g>
      <g fill={PAPER} stroke={F} strokeWidth="1.6"><circle cx="-24" cy="-14" r="5" /><circle cx="24" cy="-20" r="5" /><circle cx="0" cy="-14" r="4" /></g>
      <circle cx="0" cy="2" r="6" fill={PAPER} stroke={C} strokeWidth="2" />
    </g>
  );
}

function HardwareDev() {
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

/* ---------- Figure 1: the four types, magazine plate ---------- */

export function HeroArt(p: P) {
  const cols = [
    { x: 75, label: "Browser", tag: "NO INSTALL", Dev: BrowserDev },
    { x: 215, label: "Phone", tag: "ON THE GO", Dev: PhoneDev },
    { x: 355, label: "Desktop", tag: "MORE CONTROL", Dev: DesktopDev },
    { x: 495, label: "Hardware", tag: "COLD STORAGE", Dev: HardwareDev },
  ];
  return (
    <svg viewBox="0 0 570 292" role="img" aria-labelledby="wHeroT wHeroD" {...p}>
      <title id="wHeroT">Four kinds of Monero wallet</title>
      <desc id="wHeroD">A browser window, a phone, a desktop computer and a hardware device drawn side by side. MonkStash is marked on the browser.</desc>
      <rect width="570" height="292" fill={PAPER} />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 48H570M0 108H570M0 168H570M0 228H570" /></g>
      {cols.map(({ x, label, tag, Dev }, i) => (
        <g key={label}>
          <g transform={`translate(${x} 104)`}><Dev /></g>
          <text x={x} y="198" style={{ fontFamily: "var(--font-display)" }} fontStyle="italic" fontSize="19" fill={F} textAnchor="middle">{label}</text>
          <text x={x} y="218" style={{ fontFamily: "var(--font-sans)" }} fontSize="8.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">{tag}</text>
          {i < 3 && <path d={`M${x + 70} 70V230`} stroke={GREY} strokeWidth="1" strokeDasharray="2 5" />}
        </g>
      ))}
      <g transform="translate(75 28)">
        <rect x="-40" y="-12" width="80" height="22" rx="3" fill={C} />
        <text x="0" y="3" style={{ fontFamily: "var(--font-sans)" }} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={PAPER} textAnchor="middle">MONKSTASH</text>
        <path d="M0 10V18" stroke={C} strokeWidth="1.6" />
      </g>
      <g transform="translate(24 252)">
        <rect width="522" height="26" rx="3" fill={F} />
        <text x="261" y="17.5" style={{ fontFamily: "var(--font-sans)" }} fontSize="10.5" fontWeight="600" letterSpacing="1.4" fill={PAPER} textAnchor="middle">SAME MONERO. DIFFERENT PLACE FOR YOUR KEYS.</text>
      </g>
    </svg>
  );
}

/* ---------- Small type figures (cards) ---------- */

function TypeFrame({ title, children, ...p }: P & { title: string }) {
  return (
    <svg viewBox="-70 -62 140 124" role="img" aria-label={title} {...p}>
      {children}
    </svg>
  );
}
export function TypeWeb(p: P) { return <TypeFrame title="A browser window" {...p}><BrowserDev /></TypeFrame>; }
export function TypePhone(p: P) { return <TypeFrame title="A phone" {...p}><PhoneDev /></TypeFrame>; }
export function TypeDesktop(p: P) { return <TypeFrame title="A desktop computer" {...p}><DesktopDev /></TypeFrame>; }
export function TypeHardware(p: P) { return <TypeFrame title="A hardware wallet device" {...p}><HardwareDev /></TypeFrame>; }

/* ---------- Figure 2: effort versus protection ---------- */

export function SpectrumArt(p: P) {
  const pts = [
    { x: 118, y: 196, n: "Browser" },
    { x: 218, y: 162, n: "Phone" },
    { x: 340, y: 118, n: "Desktop" },
    { x: 468, y: 56, n: "Hardware" },
  ];
  return (
    <svg viewBox="0 0 560 300" role="img" aria-labelledby="wSpecT wSpecD" {...p}>
      <title id="wSpecT">Effort to set up versus protection for the four wallet types</title>
      <desc id="wSpecD">A rough guide. Browser wallets are quickest to set up with lighter protection. Phone and desktop wallets sit in the middle. Hardware wallets take the most effort and give the strongest protection.</desc>
      <rect width="560" height="300" fill={PAPER} />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M70 40V250M170 40V250M270 40V250M370 40V250M470 40V250M70 90H520M70 140H520M70 190H520" /></g>
      <path d="M70 250H524M70 250V30" stroke={F} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M518 244l8 6-8 6M64 38l6-8 6 8" stroke={F} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M118 196L218 162L340 118L468 56" stroke={C} strokeWidth="1.6" strokeDasharray="5 6" fill="none" strokeLinecap="round" />
      {pts.map((d, i) => (
        <g key={d.n}>
          <circle cx={d.x} cy={d.y} r="11" fill={PAPER} stroke={i === 0 ? C : F} strokeWidth="2.2" />
          <circle cx={d.x} cy={d.y} r="4" fill={i === 0 ? C : F} />
          <text x={d.x} y={d.y + 30} style={{ fontFamily: "var(--font-display)" }} fontStyle="italic" fontSize="15" fill={F} textAnchor="middle">{d.n}</text>
        </g>
      ))}
      <text x="296" y="280" style={{ fontFamily: "var(--font-sans)" }} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">MORE EFFORT TO SET UP</text>
      <text transform="translate(26 150) rotate(-90)" style={{ fontFamily: "var(--font-sans)" }} fontSize="9.5" fontWeight="600" letterSpacing="1.4" fill={MUTE} textAnchor="middle">MORE PROTECTION</text>
      <text x="520" y="22" style={{ fontFamily: "var(--font-display)" }} fontStyle="italic" fontSize="13" fill={C} textAnchor="end">a rough guide, not a test</text>
    </svg>
  );
}

/* ---------- Figure 3 (dark band): read the address bar ---------- */

export function CheckArt(p: P) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-labelledby="wChkT wChkD" {...p}>
      <title id="wChkT">Two address bars, one official and one look-alike</title>
      <desc id="wChkD">The top bar shows the official Monero site reached from a bookmark and is marked safe. The bottom bar shows a look-alike address reached from an ad and is marked as a trap.</desc>
      <rect width="520" height="300" rx="8" fill="#22342a" />
      <g>
        <text x="28" y="44" style={{ fontFamily: "var(--font-sans)" }} fontSize="10" fontWeight="600" letterSpacing="1.6" fill="#9fb0a2">FROM A BOOKMARK</text>
        <rect x="28" y="56" width="464" height="46" rx="23" fill="#1b2a22" stroke="#cfd8cb" strokeWidth="1.6" />
        <g transform="translate(52 79)" fill="none" stroke="#cfd8cb" strokeWidth="1.8" strokeLinecap="round"><rect x="-6" y="-2" width="12" height="9" rx="2" /><path d="M-3.5 -2v-3.5a3.5 3.5 0 017 0V-2" /></g>
        <text x="76" y="85" style={{ fontFamily: "var(--font-sans)" }} fontSize="17" fill="#f6f5ec">getmonero.org</text>
        <g transform="translate(458 79)"><circle r="12" fill="none" stroke="#cfd8cb" strokeWidth="1.8" /><path d="M-5.5 0.5l3.8 3.8 7.4-8" fill="none" stroke="#cfd8cb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></g>
      </g>
      <path d="M28 136H492" stroke="#38503f" strokeDasharray="3 6" />
      <g>
        <text x="28" y="172" style={{ fontFamily: "var(--font-sans)" }} fontSize="10" fontWeight="600" letterSpacing="1.6" fill="#e9a07a">FROM AN AD OR A MESSAGE</text>
        <rect x="28" y="184" width="464" height="46" rx="23" fill="#1b2a22" stroke="#e9a07a" strokeWidth="1.6" strokeDasharray="5 4" />
        <g transform="translate(52 207)" fill="none" stroke="#e9a07a" strokeWidth="1.8" strokeLinecap="round"><circle r="7" /><path d="M0 -3v4M0 4v.5" /></g>
        <text x="76" y="213" style={{ fontFamily: "var(--font-sans)" }} fontSize="17" fill="#e9a07a">free-monero-wallet.example</text>
        <g transform="translate(458 207)"><circle r="12" fill="none" stroke="#e9a07a" strokeWidth="1.8" /><path d="M-5 -5L5 5M5 -5L-5 5" stroke="#e9a07a" strokeWidth="2.2" strokeLinecap="round" /></g>
      </g>
      <text x="260" y="268" style={{ fontFamily: "var(--font-display)" }} fontStyle="italic" fontSize="17" fill="#cfd8cb" textAnchor="middle">One wrong letter is all a clone needs.</text>
    </svg>
  );
}

/* ---------- Chooser icons (48px) ---------- */

const ic = { viewBox: "0 0 48 48", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function ChTry(p: P) {
  return (
    <svg {...ic} {...p}><circle cx="22" cy="26" r="15" stroke={F} strokeWidth="2" /><path d="M22 18v16M14 26h16" stroke={F} strokeWidth="2" /><path d="M36 6v8M32 10h8" stroke={C} strokeWidth="2.4" /></svg>
  );
}
export function ChPay(p: P) {
  return (
    <svg {...ic} {...p}><rect x="12" y="5" width="22" height="38" rx="5" stroke={F} strokeWidth="2" /><path d="M20 10h6" stroke={F} strokeWidth="2" /><path d="M32 22l10 0M38 17l5 5-5 5" stroke={C} strokeWidth="2.4" /></svg>
  );
}
export function ChSave(p: P) {
  return (
    <svg {...ic} {...p}><rect x="6" y="9" width="32" height="30" rx="3" stroke={F} strokeWidth="2" /><circle cx="22" cy="24" r="7" stroke={F} strokeWidth="2" /><path d="M22 20v8" stroke={C} strokeWidth="2.4" /><path d="M12 39v4M32 39v4" stroke={F} strokeWidth="2" /></svg>
  );
}
export function ChControl(p: P) {
  return (
    <svg {...ic} {...p}><path d="M24 24L10 12M24 24L38 12M24 24L24 40" stroke={F} strokeWidth="2" /><circle cx="10" cy="12" r="5" stroke={F} strokeWidth="2" /><circle cx="38" cy="12" r="5" stroke={F} strokeWidth="2" /><circle cx="24" cy="40" r="4" stroke={F} strokeWidth="2" /><circle cx="24" cy="24" r="6" stroke={C} strokeWidth="2.4" /></svg>
  );
}
export function ChMove(p: P) {
  return (
    <svg {...ic} {...p}><path d="M6 42V8a2 2 0 012-2h14a2 2 0 012 2v34z" stroke={F} strokeWidth="2" /><circle cx="19" cy="25" r="1.6" fill={F} /><path d="M28 24h14M37 18l6 6-6 6" stroke={C} strokeWidth="2.4" /></svg>
  );
}

/* ---------- Proof icons (40px) ---------- */

export function PfKey(p: P) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><rect x="8" y="17" width="24" height="18" rx="3" stroke={F} strokeWidth="2" /><path d="M13 17v-4a7 7 0 0114 0v4" stroke={F} strokeWidth="2" /><path d="M20 24v5" stroke={C} strokeWidth="2.4" /></svg>
  );
}
export function PfCode(p: P) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M14 11L5 20l9 9M26 11l9 9-9 9" stroke={F} strokeWidth="2" /><path d="M23 8l-6 24" stroke={C} strokeWidth="2.4" /></svg>
  );
}
export function PfNoAccount(p: P) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><circle cx="20" cy="14" r="6" stroke={F} strokeWidth="2" /><path d="M8 33c1-7 6-10 12-10s11 3 12 10" stroke={F} strokeWidth="2" /><path d="M6 6l28 28" stroke={C} strokeWidth="2.4" /></svg>
  );
}

export function ArrowIcon(p: P) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" {...p}><path d="M3 9h11M10 4.5L14.5 9 10 13.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
