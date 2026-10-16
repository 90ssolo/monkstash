import { MoneroSymbol } from "@/components/art/MoneroSymbol";

const F = "#1f4733";
const C = "#b4532a";
const PAPER = "#fbfbf7";
const BG = "#edeee6";
const serif = "var(--font-display)";

/** Figure 1: an address as labelled parts. Schematic, not to scale. */
export function AnatomyArt() {
  return (
    <svg viewBox="0 0 560 330" role="img" aria-label="A standard Monero address of 95 characters is made of a one character prefix, a public spend key, a public view key and a short checksum. An integrated address adds a payment ID and is 106 characters." xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="558" height="328" rx="6" fill={PAPER} stroke="#c7c8bb" />
      <MoneroSymbol x={22} y={18} size={26} variant="color" />
      <text x="56" y="38" fontFamily={serif} fontSize="18" fill={F} fontWeight="600">Standard address</text>
      <text x="538" y="38" textAnchor="end" fontFamily={serif} fontStyle="italic" fontSize="15" fill={C}>95 characters</text>

      {/* standard bar */}
      <rect x="22" y="92" width="22" height="44" fill={C} />
      <rect x="44" y="92" width="206" height="44" fill="#e7efe8" stroke={F} />
      <rect x="250" y="92" width="206" height="44" fill="#e7efe8" stroke={F} />
      <rect x="456" y="92" width="82" height="44" fill={BG} stroke={F} strokeDasharray="4 3" />
      <text x="147" y="119" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>public spend key</text>
      <text x="353" y="119" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>public view key</text>
      <text x="497" y="119" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>checksum</text>
      <path d="M33 92V68M33 68h-5" stroke={C} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <text x="28" y="62" fontFamily={serif} fontStyle="italic" fontSize="15" fill={C}>prefix: 4 or 8 on mainnet</text>

      <MoneroSymbol x={22} y={168} size={26} variant="mono" style={{ color: F }} />
      <text x="56" y="188" fontFamily={serif} fontSize="18" fill={F} fontWeight="600">Integrated address</text>
      <text x="538" y="188" textAnchor="end" fontFamily={serif} fontStyle="italic" fontSize="15" fill={C}>106 characters</text>

      {/* integrated bar */}
      <rect x="22" y="228" width="22" height="44" fill={C} />
      <rect x="44" y="228" width="160" height="44" fill="#e7efe8" stroke={F} />
      <rect x="204" y="228" width="160" height="44" fill="#e7efe8" stroke={F} />
      <rect x="364" y="228" width="92" height="44" fill="#f1e3da" stroke={C} />
      <rect x="456" y="228" width="82" height="44" fill={BG} stroke={F} strokeDasharray="4 3" />
      <text x="124" y="255" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>spend key</text>
      <text x="284" y="255" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>view key</text>
      <text x="410" y="255" textAnchor="middle" fontFamily={serif} fontSize="14" fill={C}>payment ID</text>
      <text x="497" y="255" textAnchor="middle" fontFamily={serif} fontSize="14" fill={F}>checksum</text>

      <text x="22" y="308" fontFamily={serif} fontStyle="italic" fontSize="13" fill="#6b7a70">Schematic, not to scale. The validator checks the prefix, length and checksum.</text>
    </svg>
  );
}

/** Icon: a primary address, one door. */
export function PrimaryIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="A single key" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="32" r="12" fill={PAPER} stroke={F} strokeWidth="1.6" />
      <circle cx="22" cy="32" r="4" fill="none" stroke={C} strokeWidth="1.5" />
      <path d="M34 32h24M50 32v8M57 32v6" stroke={F} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Icon: subaddresses branching from one wallet. */
export function SubIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="One wallet branching into three addresses" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="32" r="7" fill={PAPER} stroke={F} strokeWidth="1.6" />
      <path d="M19 32h8M27 32c8 0 8-18 18-18M27 32h18M27 32c8 0 8 18 18 18" fill="none" stroke={F} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="50" cy="14" r="5" fill={BG} stroke={C} strokeWidth="1.5" />
      <circle cx="50" cy="32" r="5" fill={BG} stroke={C} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="5" fill={BG} stroke={C} strokeWidth="1.5" />
    </svg>
  );
}

/** Icon: an address with a tag attached (payment ID). */
export function IntegratedIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="An address with a tag tied to it" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="38" height="28" rx="4" fill={PAPER} stroke={F} strokeWidth="1.6" />
      <path d="M14 28h22M14 36h16" stroke={F} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 4" />
      <path d="M44 32h6" stroke={C} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 24h8l4 8-4 8h-8z" fill="#f1e3da" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="55" cy="32" r="1.6" fill={C} />
    </svg>
  );
}

/** Figure 2 (dark band): a send, with the pause points before it. */
export function CheckpointArt() {
  return (
    <svg viewBox="0 0 520 220" role="img" aria-label="Before a send, four pauses: validate the format, compare the start and end, send a small test, then send the rest." xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="518" height="218" rx="6" fill="#22342a" stroke="#38503f" />
      <path d="M40 104h440" stroke="#38503f" strokeWidth="2" strokeLinecap="round" />
      {[70, 190, 310].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="104" r="16" fill="#1b2a22" stroke="#e9a07a" strokeWidth="1.5" />
          <text x={x} y="110" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="17" fill="#e9a07a">{["i", "ii", "iii"][i]}</text>
        </g>
      ))}
      <circle cx="440" cy="104" r="30" fill="#1b2a22" stroke="#e9a07a" strokeWidth="1.5" />
      <MoneroSymbol x={424} y={88} size={32} variant="mono" style={{ color: "#e9a07a" }} />
      <text x="70" y="148" textAnchor="middle" fontFamily={serif} fontSize="14" fill="#c3cdc2">validate</text>
      <text x="190" y="148" textAnchor="middle" fontFamily={serif} fontSize="14" fill="#c3cdc2">compare</text>
      <text x="310" y="148" textAnchor="middle" fontFamily={serif} fontSize="14" fill="#c3cdc2">test send</text>
      <text x="440" y="158" textAnchor="middle" fontFamily={serif} fontSize="14" fill="#c3cdc2">full send</text>
      <text x="40" y="52" fontFamily={serif} fontStyle="italic" fontSize="16" fill="#9fb0a2">Three quick pauses, then the real payment.</text>
    </svg>
  );
}
