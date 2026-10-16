import type { SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";

type P = SVGProps<SVGSVGElement>;

export function ArrowIcon(p: P) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" {...p}><path d="M3 9h11M10 4.5L14.5 9 10 13.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function HeroArt(p: P) {
  return (
    <svg viewBox="0 0 560 440" role="img" aria-labelledby="heroT heroD" {...p}>
    <title id="heroT">Your keys stay on your device</title>
    <desc id="heroD">A laptop holds a locked recovery phrase and a key. A dashed line toward a server on the right is stopped by a closed gate, showing the keys never leave the device.</desc>
    <rect x="0" y="0" width="560" height="440" fill="#fbfbf7"/>
    <g stroke="#e3e4da" strokeWidth="1">
    <path d="M0 60H560M0 120H560M0 180H560M0 240H560M0 300H560M0 360H560M0 420H560"/>
    </g>
    <g transform="translate(110 85)" opacity=".9">
    <circle r="44" fill="none" stroke="#b4532a" strokeWidth="1.2"/>
    <circle r="36" fill="none" stroke="#b4532a" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round"/>
    <g stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M0 15V-5"/><path d="M0 1 q10 -1 14 -13 q-12 0 -14 11 z"/><path d="M0 7 q10 2 16 -8 q-12 -3 -16 6 z"/></g>
    </g>
    <text x="110" y="153" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="15" fill="#b4532a" textAnchor="middle">your side</text>
    <g>
    <path d="M58 330V190q0-12 12-12h240q12 0 12 12v140z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4"/>
    <rect x="72" y="192" width="236" height="124" fill="#edeee6" stroke="#1f4733" strokeWidth="1.2"/>
    <path d="M34 330h312l-14 24q-3 6-10 6H58q-7 0-10-6z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="M160 340h60" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/>
    <rect x="88" y="206" width="136" height="96" rx="4" fill="#fbfbf7" stroke="#c7c8bb"/>
    <text x="98" y="224" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.4" fill="#b4532a">RECOVERY PHRASE</text>
    <g stroke="#1f4733" strokeWidth="2" strokeLinecap="round" opacity=".55">
    <path d="M98 238h34M138 238h26M170 238h40M98 250h28M132 250h44M182 250h24M98 262h40M144 262h30M180 262h28M98 274h24M128 274h36M170 274h38M98 286h32M136 286h26"/>
    </g>
    <rect x="238" y="232" width="52" height="42" rx="6" fill="#1f4733"/>
    <path d="M247 232v-10a17 17 0 0134 0v10" fill="none" stroke="#1f4733" strokeWidth="5"/>
    <circle cx="264" cy="250" r="5" fill="#edeee6"/>
    <path d="M264 254v10" stroke="#edeee6" strokeWidth="3" strokeLinecap="round"/>
    <text x="264" y="296" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.2" fill="#1f4733" textAnchor="middle">PASSWORD</text>
    </g>
    <g transform="translate(180 120) rotate(-18)">
    <circle cx="0" cy="0" r="16" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4"/>
    <circle cx="0" cy="0" r="6" fill="none" stroke="#1f4733" strokeWidth="1.6"/>
    <path d="M16 0h54M52 0v12M64 0v9" fill="none" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round"/>
    </g>
    <path d="M290 150C340 130 370 150 392 196" fill="none" stroke="#b4532a" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round"/>
    <path d="M268 160l-12 4 8-12" fill="none" stroke="none"/>
    <g transform="translate(404 200)">
    <circle r="26" fill="#fbfbf7" stroke="#b4532a" strokeWidth="2.4"/>
    <path d="M-12 -12L12 12M12 -12L-12 12" stroke="#b4532a" strokeWidth="3.4" strokeLinecap="round"/>
    </g>
    <text x="404" y="248" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="15" fill="#b4532a" textAnchor="middle">never sent</text>
    <g transform="translate(436 268)">
    <rect x="0" y="0" width="96" height="30" rx="4" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="1.8"/>
    <rect x="0" y="38" width="96" height="30" rx="4" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="1.8"/>
    <rect x="0" y="76" width="96" height="30" rx="4" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="1.8"/>
    <path d="M12 15h28M12 53h28M12 91h28" stroke="#6b7a70" strokeWidth="2" strokeLinecap="round"/>
    <path d="M70 15h14M70 53h14M70 91h14" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round"/>
    </g>
    <text x="484" y="396" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="15" fill="#6b7a70" textAnchor="middle">servers see nothing</text>
    <path d="M346 345H436" stroke="#c7c8bb" strokeWidth="2" strokeDasharray="3 5"/>
    <g transform="translate(40 392)">
    <rect width="244" height="30" rx="3" fill="#1f4733"/>
    <text x="122" y="20" style={{fontFamily:"var(--font-sans)"}} fontSize="11" fontWeight="600" letterSpacing="1.4" fill="#fbfbf7" textAnchor="middle">KEYS MADE AND LOCKED HERE</text>
    </g>
    </svg>
  );
}

export function TensionArt(p: P) {
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="A payment receipt sprouting small watching eyes" {...p}>
    <path d="M90 40H210V190l-10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8 -10 8 -10 -8z" fill="none" stroke="#cfd8cb" strokeWidth="2" strokeLinejoin="round"/>
    <g stroke="#9fb0a2" strokeWidth="2" strokeLinecap="round" fill="none"><path d="M106 64h50M106 84h88M106 102h66M106 120h78"/></g>
    <path d="M106 148h88" stroke="#38503f" strokeWidth="1.4"/>
    <path d="M106 166h30M172 166h22" stroke="#e9a07a" strokeWidth="2" strokeLinecap="round"/>
    <g stroke="#e9a07a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M112 40V28"/><path d="M150 40V24"/><path d="M188 40V28"/>
    <path d="M210 100h10"/><path d="M90 130h-10"/>
    <ellipse cx="112" cy="20" rx="12" ry="8"/><ellipse cx="150" cy="16" rx="12" ry="8"/><ellipse cx="188" cy="20" rx="12" ry="8"/>
    <ellipse cx="232" cy="100" rx="12" ry="8"/><ellipse cx="68" cy="130" rx="12" ry="8"/>
    </g>
    <g fill="#e9a07a"><circle cx="114" cy="20" r="3.5"/><circle cx="152" cy="16" r="3.5"/><circle cx="190" cy="20" r="3.5"/><circle cx="234" cy="100" r="3.5"/><circle cx="66" cy="130" r="3.5"/></g>
    </svg>
  );
}

export function DefArt(p: P) {
  return (
    <svg viewBox="0 0 360 110" role="img" aria-label="A banknote travelling to anywhere in the world" {...p}>
    <rect x="10" y="26" width="112" height="58" rx="4" fill="none" stroke="#1f4733" strokeWidth="1.8"/>
    <rect x="18" y="33" width="96" height="44" rx="2" fill="none" stroke="#1f4733" strokeWidth="1" strokeDasharray="2 4"/>
    <circle cx="66" cy="55" r="12" fill="none" stroke="#b4532a" strokeWidth="1.8"/>
    <path d="M66 49v12M60 55h12" stroke="#b4532a" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M134 55h86" stroke="#c7c8bb" strokeWidth="2" strokeDasharray="3 5"/>
    <path d="M212 49l8 6-8 6" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="177" y="44" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="13" fill="#6b7a70" textAnchor="middle">no trail</text>
    <g transform="translate(290 55)" fill="none" stroke="#1f4733" strokeWidth="1.8">
    <circle r="34"/><ellipse rx="14" ry="34"/><path d="M-34 0H34M-30 -16H30M-30 16H30" strokeWidth="1.2"/>
    </g>
    </svg>
  );
}

export function UseGlobe(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><g stroke="#1f4733" strokeWidth="2"><circle cx="22" cy="26" r="15"/><ellipse cx="22" cy="26" rx="6.5" ry="15"/><path d="M7 26h30"/></g><path d="M32 16L43 5M35 5h8v8" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function UseHeart(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M24 40C10 31 7 20 13 15c4-3 9-1 11 3c2-4 7-6 11-3c6 5 3 16-11 25z" stroke="#1f4733" strokeWidth="2"/><path d="M39 5v8M35 9h8" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function UseShield(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" stroke="#1f4733" strokeWidth="2"/><circle cx="24" cy="22" r="4" stroke="#b4532a" strokeWidth="2.4"/><path d="M24 26v7" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function UseCart(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><g stroke="#1f4733" strokeWidth="2"><path d="M5 8h6l5 22h20l4-16H13"/><circle cx="18" cy="38" r="3"/><circle cx="34" cy="38" r="3"/></g><path d="M20 22l4 4 8-9" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function UseInbox(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><g stroke="#1f4733" strokeWidth="2"><rect x="7" y="24" width="34" height="18" rx="3"/><path d="M18 24v-4a2 2 0 012-2h8a2 2 0 012 2v4M7 33h34"/></g><path d="M24 3v11M19 10l5 5 5-5" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function UseHome(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}><g stroke="#1f4733" strokeWidth="2"><path d="M6 24L24 8l18 16M11 21v20h26V21"/></g><path d="M16 34h16M27 29l5 5-5 5" stroke="#b4532a" strokeWidth="2.4"/></svg>
  );
}

export function CompareBitArt(p: P) {
  return (
    <svg viewBox="0 0 420 110" role="img" aria-label="Open public ledger versus a sealed Monero ledger" {...p}>
    <rect x="6" y="10" width="190" height="90" rx="5" fill="none" stroke="#9fb0a2" strokeWidth="1.6"/>
    <g stroke="#9fb0a2" strokeWidth="1.6" strokeLinecap="round"><path d="M20 34h46M80 34h30M122 34h60M20 54h38M72 54h44M130 54h52M20 74h52M86 74h34M134 74h48"/></g>
    <text x="101" y="26" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">TYPICAL COIN: ALL VISIBLE</text>
    <rect x="224" y="10" width="190" height="90" rx="5" fill="none" stroke="#e9a07a" strokeWidth="1.6"/>
    <g stroke="#e9a07a" strokeWidth="7" strokeLinecap="round" opacity=".55"><path d="M238 40h46M296 40h30M338 40h60M238 60h38M288 60h44M344 60h54M238 80h52M302 80h34M348 80h50"/></g>
    <text x="319" y="26" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">MONERO: DETAILS HIDDEN</text>
    </svg>
  );
}

export function RingDiagram(p: P) {
  return (
    <svg viewBox="0 0 300 170" role="img" aria-label="One real signature hidden among several identical decoys in a ring" {...p}>
    <circle cx="150" cy="86" r="62" fill="none" stroke="#38503f" strokeWidth="1.4" strokeDasharray="3 5"/>
    <g style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="20" fill="#cfd8cb" textAnchor="middle">
    <g transform="translate(150 24)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    <g transform="translate(205 54)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    <g transform="translate(205 118)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    <g transform="translate(150 148)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    <g transform="translate(95 118)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    <g transform="translate(95 54)"><circle r="19" fill="#22342a" stroke="#9fb0a2" strokeWidth="1.6"/><text y="6">Ann</text></g>
    </g>
    <text x="150" y="82" style={{fontFamily:"var(--font-sans)"}} fontSize="30" fontWeight="600" fill="#e9a07a" textAnchor="middle">?</text>
    <text x="150" y="100" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">WHICH ONE?</text>
    </svg>
  );
}

export function StealthDiagram(p: P) {
  return (
    <svg viewBox="0 0 300 170" role="img" aria-label="One real address that produces a new one-time address for every payment" {...p}>
    <rect x="8" y="62" width="82" height="46" rx="5" fill="#22342a" stroke="#e9a07a" strokeWidth="1.8"/>
    <text x="49" y="82" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">YOUR ADDRESS</text>
    <text x="49" y="98" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="13" fill="#cfd8cb" textAnchor="middle">stays private</text>
    <g stroke="#9fb0a2" strokeWidth="1.6" fill="none"><path d="M92 85C130 85 130 28 176 28"/><path d="M92 85H176"/><path d="M92 85C130 85 130 142 176 142"/></g>
    <g style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1" fill="#cfd8cb">
    <rect x="176" y="12" width="116" height="32" rx="4" fill="#1b2a22" stroke="#9fb0a2" strokeDasharray="3 3"/><text x="186" y="26" fill="#e9a07a">PAYMENT 1</text><text x="185" y="38" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="10.5" letterSpacing="0">one-time address A</text>
    <rect x="176" y="69" width="116" height="32" rx="4" fill="#1b2a22" stroke="#9fb0a2" strokeDasharray="3 3"/><text x="186" y="83" fill="#e9a07a">PAYMENT 2</text><text x="185" y="95" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="10.5" letterSpacing="0">one-time address B</text>
    <rect x="176" y="126" width="116" height="32" rx="4" fill="#1b2a22" stroke="#9fb0a2" strokeDasharray="3 3"/><text x="186" y="140" fill="#e9a07a">PAYMENT 3</text><text x="185" y="152" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="10.5" letterSpacing="0">one-time address C</text>
    </g>
    </svg>
  );
}

export function RingctDiagram(p: P) {
  return (
    <svg viewBox="0 0 300 170" role="img" aria-label="A sealed envelope: the network confirms the payment is valid without seeing the amount" {...p}>
    <rect x="20" y="40" width="130" height="90" rx="5" fill="#22342a" stroke="#e9a07a" strokeWidth="1.8"/>
    <path d="M20 44l65 46 65-46" fill="none" stroke="#e9a07a" strokeWidth="1.8" strokeLinejoin="round"/>
    <text x="85" y="26" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">AMOUNT, SEALED</text>
    <g stroke="#9fb0a2" strokeWidth="7" strokeLinecap="round" opacity=".6"><path d="M50 112h70"/></g>
    <path d="M158 85h40" stroke="#9fb0a2" strokeWidth="1.8" strokeDasharray="4 4"/>
    <g transform="translate(236 85)">
    <circle r="38" fill="#1b2a22" stroke="#9fb0a2" strokeWidth="1.8"/>
    <path d="M-16 0l11 12 21-26" fill="none" stroke="#e9a07a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <text x="236" y="140" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="14" fill="#cfd8cb" textAnchor="middle">valid, number unseen</text>
    <text x="236" y="26" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#e9a07a" textAnchor="middle">THE NETWORK</text>
    </svg>
  );
}

export function PersonaSeedling(p: P) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Seedling" {...p}><path d="M32 56V30" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round"/><path d="M32 34C32 20 22 14 10 14c0 14 8 22 22 20z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinejoin="round"/><path d="M32 28c0-10 8-16 20-16 0 12-8 18-20 16z" fill="#fbfbf7" stroke="#b4532a" strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 56h24" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round"/></svg>
  );
}

export function PersonaDoor(p: P) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Arrow from an old door to a new one" {...p}><rect x="6" y="12" width="20" height="40" rx="2" fill="none" stroke="#6b7a70" strokeWidth="2.2" strokeDasharray="4 3"/><rect x="38" y="12" width="20" height="40" rx="2" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2"/><circle cx="53" cy="33" r="1.8" fill="#b4532a"/><path d="M14 32h20M28 26l6 6-6 6" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function PersonaShield(p: P) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Shield with a keyhole" {...p}><path d="M32 6l22 8v16c0 14-10 23-22 28C20 53 10 44 10 30V14z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinejoin="round"/><circle cx="32" cy="29" r="6" fill="none" stroke="#b4532a" strokeWidth="2.2"/><path d="M32 35v10" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round"/></svg>
  );
}

export function PersonaDevices(p: P) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Phone and laptop" {...p}><rect x="6" y="20" width="18" height="32" rx="3" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2"/><path d="M12 47h6" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/><rect x="30" y="16" width="28" height="20" rx="2" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2"/><path d="M26 42h36l-3 6H29z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinejoin="round"/><path d="M26 11c6-5 14-5 20 0M44 7l3 4-5 1" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function StepChoose(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="Choose between creating a new wallet or restoring one" {...p}>
    <rect x="12" y="20" width="126" height="150" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2"/>
    <circle cx="75" cy="76" r="24" fill="none" stroke="#1f4733" strokeWidth="2"/>
    <path d="M75 64v24M63 76h24" stroke="#b4532a" strokeWidth="3" strokeLinecap="round"/>
    <text x="75" y="130" style={{fontFamily:"var(--font-display)"}} fontSize="17" fontWeight="600" fill="#1b2a22" textAnchor="middle">Create new</text>
    <path d="M44 146h62" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round"/>
    <rect x="162" y="20" width="126" height="150" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" strokeDasharray="5 4"/>
    <path d="M200 84a24 24 0 1 1 8 18" fill="none" stroke="#1f4733" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M198 72l2 14 14-3" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="225" y="130" style={{fontFamily:"var(--font-display)"}} fontSize="17" fontWeight="600" fill="#1b2a22" textAnchor="middle">Restore</text>
    <path d="M194 146h62" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round"/>
    <text x="150" y="102" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="middle">or</text>
    </svg>
  );
}

export function StepBackup(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="A notepad of recovery words and a password lock" {...p}>
    <g transform="rotate(-4 90 100)">
    <rect x="26" y="16" width="130" height="160" rx="4" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2"/>
    <path d="M26 40h130" stroke="#1f4733" strokeWidth="1.4"/>
    <g stroke="#c7c8bb" strokeWidth="1.3"><path d="M26 62h130M26 82h130M26 102h130M26 122h130M26 142h130"/></g>
    <g stroke="#1f4733" strokeWidth="2" strokeLinecap="round" opacity=".7"><path d="M38 62h22M70 62h30M110 62h26M38 82h30M78 82h20M108 82h30M38 102h18M66 102h34M110 102h24M38 122h26M74 122h22M106 122h28M38 142h20M68 142h34"/></g>
    <text x="40" y="32" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#b4532a">25 WORDS</text>
    </g>
    <path d="M172 100h26" stroke="#b4532a" strokeWidth="2" strokeDasharray="4 4"/>
    <path d="M194 94l8 6-8 6" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="214" y="86" width="64" height="54" rx="7" fill="#1f4733"/>
    <path d="M226 86V72a20 20 0 0140 0v14" fill="none" stroke="#1f4733" strokeWidth="6"/>
    <circle cx="246" cy="108" r="6" fill="#edeee6"/><path d="M246 112v12" stroke="#edeee6" strokeWidth="3" strokeLinecap="round"/>
    <text x="246" y="162" style={{fontFamily:"var(--font-sans)"}} fontSize="9" fontWeight="600" letterSpacing="1.2" fill="#1f4733" textAnchor="middle">PASSWORD</text>
    <text x="246" y="176" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="12" fill="#6b7a70" textAnchor="middle">optional 2FA</text>
    </svg>
  );
}

export function StepSendReceive(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="A QR code with arrows for sending and receiving" {...p}>
    <rect x="24" y="22" width="112" height="112" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2"/>
    <g fill="#1f4733">
    <rect x="36" y="34" width="30" height="30"/><rect x="42" y="40" width="18" height="18" fill="#fbfbf7"/><rect x="47" y="45" width="8" height="8"/>
    <rect x="94" y="34" width="30" height="30"/><rect x="100" y="40" width="18" height="18" fill="#fbfbf7"/><rect x="105" y="45" width="8" height="8"/>
    <rect x="36" y="92" width="30" height="30"/><rect x="42" y="98" width="18" height="18" fill="#fbfbf7"/><rect x="47" y="103" width="8" height="8"/>
    <rect x="74" y="36" width="8" height="8"/><rect x="74" y="52" width="8" height="8"/><rect x="76" y="70" width="12" height="8" fill="#b4532a"/><rect x="94" y="72" width="8" height="8"/><rect x="108" y="76" width="16" height="8"/><rect x="74" y="88" width="8" height="16"/><rect x="90" y="96" width="14" height="8" fill="#b4532a"/><rect x="110" y="94" width="14" height="14"/><rect x="76" y="112" width="20" height="8"/><rect x="104" y="114" width="8" height="8"/><rect x="36" y="72" width="8" height="8"/><rect x="52" y="72" width="14" height="8"/>
    </g>
    <text x="80" y="156" style={{fontFamily:"var(--font-sans)"}} fontSize="9" fontWeight="600" letterSpacing="1.3" fill="#6b7a70" textAnchor="middle">YOUR ADDRESS</text>
    <path d="M166 58h92M246 48l12 10-12 10" fill="none" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="166" y="42" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="14" fill="#1f4733">send</text>
    <path d="M258 112h-92M178 102l-12 10 12 10" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="258" y="98" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="end">receive</text>
    <rect x="166" y="140" width="112" height="34" rx="4" fill="none" stroke="#c7c8bb"/>
    <text x="176" y="154" style={{fontFamily:"var(--font-sans)"}} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#6b7a70">BALANCE</text>
    <text x="176" y="168" style={{fontFamily:"var(--font-display)"}} fontSize="13" fontWeight="600" fill="#1f4733">syncs, then shows</text>
    </svg>
  );
}

export function ClockIcon(p: P) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" {...p}><circle cx="17" cy="17" r="14" fill="none" stroke="#1f4733" strokeWidth="1.8"/><path d="M17 8v9l6 4" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function ShieldCheckIcon(p: P) {
  return (
    <svg viewBox="0 0 46 46" aria-hidden="true" {...p}><path d="M23 3l17 6v13c0 11-8 18-17 21C14 40 6 33 6 22V9z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" strokeLinejoin="round"/><path d="M15 23l6 6 11-13" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function ProofNonCustodial(p: P) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" {...p}>
    <rect x="14" y="12" width="46" height="72" rx="7" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2"/>
    <path d="M30 20h14" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="37" cy="48" r="10" fill="none" stroke="#b4532a" strokeWidth="2.2"/>
    <path d="M47 48h8M52 48v6" stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M70 34a18 18 0 010 36" fill="none" stroke="#1f4733" strokeWidth="1.6" strokeDasharray="2 5" strokeLinecap="round"/>
    <path d="M70 62l5 5 9-12" fill="none" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2 -6)"/>
    </svg>
  );
}

export function ProofOpenSource(p: P) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" {...p}>
    <path d="M48 24c-8-7-24-9-36-6v54c12-3 28-1 36 6 8-7 24-9 36-6V18c-12-3-28-1-36 6z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinejoin="round"/>
    <path d="M48 24v54" stroke="#1f4733" strokeWidth="1.6"/>
    <path d="M32 40l-9 9 9 9M64 40l9 9-9 9" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(-4 -2)"/>
    <path d="M44 62l8-26" stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round" transform="translate(0 -2)"/>
    </svg>
  );
}

export function ProofNoAccounts(p: P) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" {...p}>
    <circle cx="44" cy="32" r="14" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2"/>
    <path d="M16 80c0-16 12-26 28-26s28 10 28 26" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="72" cy="30" r="14" fill="#edeee6" stroke="#b4532a" strokeWidth="2.2"/>
    <path d="M64 38l16-16" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M64 26h10M70 22v8" stroke="#b4532a" strokeWidth="0" />
    </svg>
  );
}

export function ProofNoTracking(p: P) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" {...p}>
    <path d="M8 48c10-18 24-26 40-26s30 8 40 26c-10 18-24 26-40 26S18 66 8 48z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" strokeLinejoin="round"/>
    <circle cx="48" cy="48" r="12" fill="none" stroke="#1f4733" strokeWidth="2"/>
    <circle cx="48" cy="48" r="4.5" fill="#1f4733"/>
    <path d="M20 82L76 14" stroke="#b4532a" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function LearnWhat(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><circle cx="29" cy="29" r="20" fill="none" stroke="#1f4733" strokeWidth="2"/><MoneroSymbol x={15} y={15} size={28} variant="mono" style={{ color: "#b4532a" }}/></svg>
  );
}

export function LearnCreate(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><rect x="10" y="14" width="38" height="32" rx="4" fill="none" stroke="#1f4733" strokeWidth="2"/><path d="M10 24h38" stroke="#1f4733" strokeWidth="2"/><path d="M29 30v10M24 35h10" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round"/></svg>
  );
}

export function LearnSend(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><path d="M10 20h34M36 12l8 8-8 8" fill="none" stroke="#1f4733" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M48 38H14M22 30l-8 8 8 8" fill="none" stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function LearnHeight(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><path d="M8 44h42" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/><path d="M14 44V30M22 44V24M30 44V18M38 44V26M46 44V32" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/><path d="M30 12v-4M26 10l4-4 4 4" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function LearnCompare(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><rect x="8" y="16" width="20" height="26" rx="3" fill="none" stroke="#1f4733" strokeWidth="2"/><rect x="32" y="12" width="18" height="30" rx="3" fill="none" stroke="#b4532a" strokeWidth="2"/><path d="M14 36h8M37 36h8" stroke="#1f4733" strokeWidth="2" strokeLinecap="round"/></svg>
  );
}

export function LearnMove(p: P) {
  return (
    <svg viewBox="0 0 58 58" aria-hidden="true" {...p}><rect x="8" y="20" width="16" height="22" rx="2" fill="none" stroke="#6b7a70" strokeWidth="2" strokeDasharray="4 3"/><rect x="34" y="20" width="16" height="22" rx="2" fill="none" stroke="#1f4733" strokeWidth="2"/><path d="M26 31h6M29 27l4 4-4 4" fill="none" stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function FaqArt(p: P) {
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="Speech bubbles with a question mark and an answer" {...p}>
    <path d="M20 20h150a8 8 0 018 8v66a8 8 0 01-8 8H70l-26 22V102H20a8 8 0 01-8-8V28a8 8 0 018-8z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" strokeLinejoin="round"/>
    <text x="95" y="82" style={{fontFamily:"var(--font-display)"}} fontSize="56" fontStyle="italic" fill="#b4532a" textAnchor="middle">?</text>
    <path d="M280 90H150a8 8 0 00-8 8v56a8 8 0 008 8h60l24 20v-20h46a8 8 0 008-8V98a8 8 0 00-8-8z" transform="translate(-30 20) translate(10 -8)" fill="#1f4733" stroke="#1f4733" strokeWidth="2" strokeLinejoin="round"/>
    <g stroke="#edeee6" strokeWidth="3" strokeLinecap="round" transform="translate(-20 12)"><path d="M150 130h82M150 148h56"/></g>
    </svg>
  );
}

export function SealArt(p: P) {
  return (
    <svg viewBox="0 0 300 260" role="img" aria-label="A large mint seal with a key" {...p}>
    <g transform="translate(150 130)" fill="none" stroke="#f2f4ea">
    <circle r="110" strokeWidth="1.6" opacity=".5"/>
    <circle r="98" strokeWidth="1" strokeDasharray="2 7" strokeLinecap="round" opacity=".7"/>
    <circle r="78" strokeWidth="2"/>
    <g stroke="#e9a07a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M0 44V-8"/><path d="M0 4 q24 -2 38 -30 q-30 2 -38 26 z"/><path d="M0 19 q24 6 42 -16 q-30 -6 -42 14 z"/></g>
    </g>
    <text x="150" y="250" style={{fontFamily:"var(--font-display)"}} fontStyle="italic" fontSize="16" fill="#cfdacf" textAnchor="middle">Your keys, your coins.</text>
    </svg>
  );
}

