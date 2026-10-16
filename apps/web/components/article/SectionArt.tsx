import type { SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";

type P = SVGProps<SVGSVGElement>;
const serif = { fontFamily: "var(--font-display)" } as const;
const sans = { fontFamily: "var(--font-sans)" } as const;

/** Learn hero: an open book whose pages hold the big Monero ideas. */
export function LearnHeroArt(p: P) {
  return (
    <svg viewBox="0 0 520 380" role="img" aria-labelledby="lhT lhD" {...p}>
      <title id="lhT">An open book of Monero ideas</title>
      <desc id="lhD">An open book. The left page shows a ring of decoy signers around one real signer. The right page shows a key, a node and a coin, with a dotted line linking them.</desc>
      <rect width="520" height="380" fill="#fbfbf7" />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 60H520M0 120H520M0 180H520M0 240H520M0 300H520M0 360H520" /></g>
      <path d="M40 90Q150 70 260 100V320Q150 292 40 312z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M480 90Q370 70 260 100V320Q370 292 480 312z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M260 100V320" stroke="#1f4733" strokeWidth="2.4" />
      <path d="M52 322Q150 300 260 328Q370 300 468 322" fill="none" stroke="#c7c8bb" strokeWidth="1.5" />
      <text x="70" y="128" style={sans} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#b4532a">PRIVACY</text>
      <g transform="translate(150 212)" fill="none">
        <circle r="62" stroke="#1f4733" strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" />
        <circle cx="0" cy="-62" r="9" stroke="#6b7a70" strokeWidth="1.8" fill="#fbfbf7" />
        <circle cx="54" cy="-30" r="9" stroke="#6b7a70" strokeWidth="1.8" fill="#fbfbf7" />
        <circle cx="54" cy="32" r="9" stroke="#6b7a70" strokeWidth="1.8" fill="#fbfbf7" />
        <circle cx="-54" cy="32" r="9" stroke="#6b7a70" strokeWidth="1.8" fill="#fbfbf7" />
        <circle cx="-54" cy="-30" r="9" stroke="#6b7a70" strokeWidth="1.8" fill="#fbfbf7" />
        <circle cx="0" cy="62" r="9" stroke="#b4532a" strokeWidth="2.4" fill="#fbfbf7" />
        <path d="M-5 62l4 4 7-8" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="150" y="292" style={serif} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="middle">one real, many look-alikes</text>
      <text x="290" y="128" style={sans} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#b4532a">KEYS AND NODES</text>
      <g transform="translate(320 176)" fill="none" stroke="#1f4733" strokeWidth="2.2" strokeLinecap="round">
        <circle r="16" fill="#fbfbf7" />
        <circle r="6" strokeWidth="1.5" />
        <path d="M16 0h42M44 0v10M54 0v7" />
      </g>
      <g transform="translate(404 232)" fill="none" stroke="#1f4733" strokeWidth="1.8">
        <rect x="-30" y="-12" width="60" height="22" rx="3" fill="#fbfbf7" />
        <rect x="-30" y="16" width="60" height="22" rx="3" fill="#fbfbf7" />
        <path d="M-20 -1h16M-20 27h16" strokeLinecap="round" />
      </g>
      <MoneroSymbol size={46} variant="color" x={298} y={238} />
      <path d="M338 176Q380 190 392 214" fill="none" stroke="#b4532a" strokeWidth="1.8" strokeDasharray="5 6" strokeLinecap="round" />
      <path d="M346 258Q372 262 372 262" fill="none" stroke="#b4532a" strokeWidth="1.8" strokeDasharray="5 6" strokeLinecap="round" />
      <text x="370" y="296" style={serif} fontStyle="italic" fontSize="14" fill="#6b7a70" textAnchor="middle">who holds, who relays</text>
      <g stroke="#1f4733" strokeWidth="1.6" strokeLinecap="round" fill="none"><path d="M236 82q-8-16 6-24q-2 14 8 20" /><path d="M244 84q6-14 20-12" /></g>
      <g transform="translate(40 342)"><rect width="190" height="26" rx="3" fill="#1f4733" /><text x="95" y="17.5" style={sans} fontSize="10.5" fontWeight="600" letterSpacing="1.4" fill="#fbfbf7" textAnchor="middle">LEARN, IN PLAIN WORDS</text></g>
    </svg>
  );
}

/** Guides hero: a path with numbered stops from first wallet to first payment. */
export function GuidesHeroArt(p: P) {
  const stops = [
    { x: 70, y: 280, n: "i", t: "create" },
    { x: 190, y: 190, n: "ii", t: "back up" },
    { x: 320, y: 232, n: "iii", t: "receive" },
    { x: 440, y: 120, n: "iv", t: "send" },
  ];
  return (
    <svg viewBox="0 0 520 380" role="img" aria-labelledby="ghT ghD" {...p}>
      <title id="ghT">A step path through the guides</title>
      <desc id="ghD">A winding dotted path with four numbered stops: create a wallet, back it up, receive, then send.</desc>
      <rect width="520" height="380" fill="#fbfbf7" />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 60H520M0 120H520M0 180H520M0 240H520M0 300H520M0 360H520" /></g>
      <path d="M70 280C110 280 140 190 190 190S280 232 320 232S400 120 440 120" fill="none" stroke="#b4532a" strokeWidth="2.2" strokeDasharray="2 8" strokeLinecap="round" />
      {stops.map((s) => (
        <g key={s.n} transform={`translate(${s.x} ${s.y})`}>
          <circle r="26" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4" />
          <text y="7" style={serif} fontStyle="italic" fontSize="22" fill="#1f4733" textAnchor="middle">{s.n}</text>
          <text y="50" style={serif} fontStyle="italic" fontSize="15" fill="#6b7a70" textAnchor="middle">{s.t}</text>
        </g>
      ))}
      <g transform="translate(70 280)"><g stroke="#1f4733" strokeWidth="1.8" fill="none" strokeLinecap="round" transform="translate(-6 -78)"><rect x="-14" y="8" width="40" height="30" rx="4" fill="#fbfbf7" /><path d="M-4 8V0a10 10 0 0120 0v8" /></g></g>
      <g transform="translate(190 190)" stroke="#b4532a" strokeWidth="2" fill="none" strokeLinecap="round"><path d="M0 -62v-14M-8 -70l8-8 8 8" /></g>
      <MoneroSymbol size={52} variant="color" x={414} y={30} />
      <path d="M440 90v-8" stroke="#c7c8bb" strokeWidth="2" strokeDasharray="2 4" />
      <text x="440" y="24" style={serif} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="middle">your first payment</text>
      <g transform="translate(40 342)"><rect width="210" height="26" rx="3" fill="#1f4733" /><text x="105" y="17.5" style={sans} fontSize="10.5" fontWeight="600" letterSpacing="1.4" fill="#fbfbf7" textAnchor="middle">ONE STEP AT A TIME</text></g>
    </svg>
  );
}

/** Small accent for the featured card. */
export function FeaturedArt({ section, ...p }: P & { section: "learn" | "guides" }) {
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label={section === "learn" ? "A bookmark marking the first page" : "A signpost marking the first step"} {...p}>
      {section === "learn" ? (
        <g fill="none" stroke="#1f4733" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M34 40h64q10 0 10 10v72q0 8-8 8H34z" fill="#fbfbf7" />
          <path d="M34 40v90" />
          <path d="M50 62h42M50 76h34M50 90h38" stroke="#6b7a70" />
          <path d="M84 40v34l10-7 10 7V40" stroke="#b4532a" fill="#f5e3d8" />
          <text x="80" y="146" style={serif} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="middle" stroke="none">start here</text>
        </g>
      ) : (
        <g fill="none" stroke="#1f4733" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M80 30v100" />
          <path d="M80 40h46l10 12-10 12H80z" fill="#fbfbf7" />
          <path d="M80 78H38L28 90l10 12h42z" fill="#fbfbf7" />
          <path d="M92 52h26M46 90h26" stroke="#b4532a" />
          <path d="M66 130h28" />
          <text x="80" y="152" style={serif} fontStyle="italic" fontSize="14" fill="#b4532a" textAnchor="middle" stroke="none">step one</text>
        </g>
      )}
    </svg>
  );
}

/** Dark band figure: two hubs, one reading path. */
export function BridgeArt(p: P) {
  return (
    <svg viewBox="0 0 300 120" role="img" aria-label="Two linked stops: understand first, then do" {...p}>
      <g fill="none" stroke="#e9a07a" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="50" cy="50" r="28" />
        <circle cx="250" cy="50" r="28" />
        <path d="M82 50h136" strokeDasharray="2 7" />
        <path d="M206 42l12 8-12 8" strokeLinejoin="round" />
      </g>
      <text x="50" y="56" style={serif} fontStyle="italic" fontSize="17" fill="#fbfbf7" textAnchor="middle">why</text>
      <text x="250" y="56" style={serif} fontStyle="italic" fontSize="17" fill="#fbfbf7" textAnchor="middle">how</text>
      <text x="150" y="100" style={serif} fontStyle="italic" fontSize="14" fill="#e9a07a" textAnchor="middle">understand, then do</text>
    </svg>
  );
}
