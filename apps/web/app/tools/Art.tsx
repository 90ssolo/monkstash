import { MoneroSymbol } from "@/components/art/MoneroSymbol";

const F = "#1f4733";
const C = "#b4532a";
const CD = "#e9a07a";
const PAPER = "#fbfbf7";
const BG = "#edeee6";
const serif = "var(--font-display)";

/** Figure 1: a paste, a check, then send. The tool is the gate in the middle. */
export function GateArt() {
  return (
    <svg viewBox="0 0 520 330" role="img" aria-label="Three steps: paste an address, the validator checks its format and network, then you send. A wrong address is stopped at the gate." xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="518" height="328" rx="6" fill={PAPER} stroke="#c7c8bb" />
      {/* paste */}
      <rect x="24" y="48" width="132" height="76" rx="5" fill={BG} stroke={F} strokeWidth="1.4" />
      <path d="M38 72h104M38 86h84M38 100h96" stroke={F} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 5" />
      <text x="90" y="150" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="15" fill={F}>1. you paste</text>
      {/* gate */}
      <path d="M156 86h60" stroke={F} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M210 80l8 6-8 6" fill="none" stroke={F} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="226" y="40" width="68" height="92" rx="5" fill={F} />
      <circle cx="260" cy="78" r="17" fill="none" stroke={CD} strokeWidth="1.6" />
      <path d="M252 79l6 6 11-12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M240 108h40" stroke={CD} strokeWidth="1.4" strokeLinecap="round" />
      <text x="260" y="150" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="15" fill={F}>2. it checks</text>
      {/* send */}
      <path d="M294 86h60" stroke={F} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M348 80l8 6-8 6" fill="none" stroke={F} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="420" cy="86" r="42" fill={BG} stroke={F} strokeWidth="1.4" />
      <MoneroSymbol x={398} y={64} size={44} variant="color" />
      <text x="420" y="150" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="15" fill={F}>3. you send</text>
      {/* rejected branch */}
      <path d="M260 132v60" stroke={C} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
      <rect x="150" y="196" width="220" height="84" rx="5" fill="#f3e1de" stroke="#a8332a" strokeWidth="1.3" />
      <path d="M176 224l16 16M192 224l-16 16" stroke="#a8332a" strokeWidth="2" strokeLinecap="round" />
      <text x="206" y="233" fontFamily={serif} fontSize="16" fill="#a8332a" fontWeight="600">Stopped here</text>
      <text x="206" y="253" fontFamily={serif} fontStyle="italic" fontSize="13" fill="#415249">Wrong network, missing</text>
      <text x="206" y="269" fontFamily={serif} fontStyle="italic" fontSize="13" fill="#415249">character, odd symbol.</text>
      <text x="24" y="304" fontFamily={serif} fontStyle="italic" fontSize="13" fill="#6b7a70">Nothing is lost when a typo is caught before the send.</text>
    </svg>
  );
}

/** Figure 2: the check happens inside the page; nothing leaves for a server. */
export function LocalArt() {
  return (
    <svg viewBox="0 0 520 250" role="img" aria-label="The address check runs inside your browser. A line to a server is crossed out because nothing is sent." xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="518" height="248" rx="6" fill="#22342a" stroke="#38503f" />
      <rect x="28" y="36" width="250" height="160" rx="6" fill="#1b2a22" stroke={CD} strokeWidth="1.3" />
      <path d="M28 62h250" stroke="#38503f" />
      <circle cx="44" cy="49" r="4" fill="#38503f" /><circle cx="58" cy="49" r="4" fill="#38503f" /><circle cx="72" cy="49" r="4" fill="#38503f" />
      <rect x="48" y="82" width="210" height="34" rx="4" fill="#22342a" stroke="#38503f" />
      <path d="M58 99h120" stroke="#9fb0a2" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 5" />
      <rect x="48" y="130" width="96" height="26" rx="13" fill={CD} />
      <text x="96" y="148" textAnchor="middle" fontFamily={serif} fontSize="14" fontWeight="600" fill="#1b2a22">Valid format</text>
      <text x="153" y="218" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="15" fill="#c3cdc2">your browser</text>
      <path d="M278 116h120" stroke="#9fb0a2" strokeWidth="1.3" strokeDasharray="4 6" strokeLinecap="round" />
      <path d="M326 98l24 36M350 98l-24 36" stroke={CD} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="406" y="76" width="86" height="80" rx="5" fill="#1b2a22" stroke="#38503f" strokeWidth="1.3" />
      <path d="M418 100h62M418 118h62M418 136h62" stroke="#38503f" strokeWidth="1.6" strokeLinecap="round" />
      <text x="449" y="182" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="15" fill="#c3cdc2">no server</text>
    </svg>
  );
}

/** Small icon: fee coin with a tiny ruler, for the planned fee explainer. */
export function FeeIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="A coin beside a small clock" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="32" r="20" fill={PAPER} stroke={F} strokeWidth="1.5" />
      <MoneroSymbol x={12} y={18} size={28} variant="mono" style={{ color: F }} />
      <circle cx="47" cy="45" r="12" fill={BG} stroke={C} strokeWidth="1.5" />
      <path d="M47 38v7l5 3" fill="none" stroke={C} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small icon: calendar turning into a block, for the planned restore height finder. */
export function HeightIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="A calendar page next to a stack of blocks" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="28" height="30" rx="3" fill={PAPER} stroke={F} strokeWidth="1.5" />
      <path d="M6 22h28M14 8v8M26 8v8" stroke={F} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 30h4M21 30h4M13 36h4" stroke={C} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 28h10M36 28l5-4M36 28l5 4" fill="none" stroke={F} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 0)" />
      <rect x="40" y="38" width="18" height="10" rx="2" fill={BG} stroke={C} strokeWidth="1.4" />
      <rect x="40" y="49" width="18" height="10" rx="2" fill={BG} stroke={F} strokeWidth="1.4" />
    </svg>
  );
}
