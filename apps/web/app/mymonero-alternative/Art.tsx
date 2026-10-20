import type { SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";

type P = SVGProps<SVGSVGElement>;
const D = { fontFamily: "var(--font-display)" } as const;
const S = { fontFamily: "var(--font-sans)" } as const;

/** Hero: the old app's door closes, the coins stay safe on the network. */
export function HeroArt(p: P) {
  return (
    <svg viewBox="0 0 560 420" role="img" aria-labelledby="mmHeroT mmHeroD" {...p}>
      <title id="mmHeroT">The old app closes, your Monero stays on the network</title>
      <desc id="mmHeroD">On the left, an app window with a closed door and the label closed. On the right, a vault of network blocks holds your coins, and a key made of recovery words opens it.</desc>
      <rect width="560" height="420" fill="#fbfbf7" />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 60H560M0 120H560M0 180H560M0 240H560M0 300H560M0 360H560" /></g>
      {/* old app window */}
      <g opacity=".95">
        <rect x="28" y="70" width="170" height="150" rx="8" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="2" strokeDasharray="7 6" />
        <path d="M28 98H198" stroke="#c7c8bb" strokeWidth="1.5" />
        <circle cx="44" cy="84" r="4" fill="none" stroke="#c7c8bb" strokeWidth="1.5" />
        <circle cx="58" cy="84" r="4" fill="none" stroke="#c7c8bb" strokeWidth="1.5" />
        <rect x="76" y="116" width="70" height="92" rx="3" fill="#edeee6" stroke="#6b7a70" strokeWidth="2" />
        <path d="M111 116V208M76 162H146" stroke="#c7c8bb" strokeWidth="1.2" />
        <circle cx="132" cy="164" r="3" fill="#6b7a70" />
      </g>
      <g transform="translate(113 52) rotate(-8)">
        <rect x="-44" y="-14" width="88" height="28" rx="3" fill="#b4532a" />
        <text x="0" y="5" style={S} fontSize="12" fontWeight="600" letterSpacing="2" fill="#fbfbf7" textAnchor="middle">CLOSED</text>
      </g>
      <text x="113" y="248" style={D} fontStyle="italic" fontSize="16" fill="#6b7a70" textAnchor="middle">the old app</text>
      {/* arrow across */}
      <path d="M210 150C248 128 282 128 316 148" fill="none" stroke="#b4532a" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
      <path d="M306 138l12 10-14 4" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="262" y="112" style={D} fontStyle="italic" fontSize="15" fill="#b4532a" textAnchor="middle">nothing moves</text>
      {/* network vault */}
      <g stroke="#1f4733" strokeWidth="2.2" fill="#fbfbf7" strokeLinejoin="round">
        <rect x="328" y="92" width="76" height="46" rx="4" />
        <rect x="412" y="92" width="76" height="46" rx="4" />
        <rect x="328" y="146" width="76" height="46" rx="4" />
        <rect x="412" y="146" width="76" height="46" rx="4" />
        <rect x="328" y="200" width="76" height="46" rx="4" />
        <rect x="412" y="200" width="76" height="46" rx="4" />
      </g>
      <path d="M404 115h8M404 169h8M404 223h8M366 138v8M450 138v8M366 192v8M450 192v8" stroke="#c7c8bb" strokeWidth="2" strokeLinecap="round" />
      <MoneroSymbol x={432} y={151} size={36} variant="color" />
      <g transform="translate(366 169)">
        <circle r="17" fill="#fbfbf7" stroke="#b4532a" strokeWidth="2.4" />
        <MoneroSymbol x={-10} y={-10} size={20} variant="mono" style={{ color: "#b4532a" }} />
      </g>
      <text x="408" y="276" style={D} fontStyle="italic" fontSize="16" fill="#1f4733" textAnchor="middle">the Monero network</text>
      {/* key + words */}
      <g transform="translate(300 330)">
        <rect x="-20" y="-24" width="250" height="52" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.8" />
        <text x="-8" y="-6" style={S} fontSize="8" fontWeight="600" letterSpacing="1.4" fill="#b4532a">YOUR 25 RECOVERY WORDS</text>
        <g stroke="#1f4733" strokeWidth="2" strokeLinecap="round" opacity=".55"><path d="M-8 10h36M34 10h28M68 10h40M114 10h26M146 10h36M188 10h30" /></g>
      </g>
      <g transform="translate(250 330) rotate(-12)" fill="none" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round">
        <circle r="14" fill="#fbfbf7" /><circle r="5" />
        <path d="M-14 0h-40M-40 0v10M-30 0v8" />
      </g>
      <path d="M400 306V284" stroke="#1f4733" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      <text x="40" y="384" style={D} fontStyle="italic" fontSize="15" fill="#6b7a70">the words are the key</text>
    </svg>
  );
}

/** Figure: real vs look-alike address bar. */
export function AddressBarArt(p: P) {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-labelledby="mmAddrT mmAddrD" {...p}>
      <title id="mmAddrT">A real address bar next to a look-alike</title>
      <desc id="mmAddrD">Two browser address bars. The first shows the address you bookmarked and is marked correct. The second swaps the letter l for the number one and is marked fake.</desc>
      <rect width="560" height="300" fill="#fbfbf7" />
      {/* real */}
      <text x="24" y="34" style={S} fontSize="10" fontWeight="600" letterSpacing="1.6" fill="#1f4733">THE ONE YOU BOOKMARKED</text>
      <rect x="24" y="46" width="512" height="48" rx="24" fill="#edeee6" stroke="#1f4733" strokeWidth="2" />
      <g transform="translate(50 70)" fill="none" stroke="#1f4733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="-7" y="-2" width="14" height="10" rx="2" /><path d="M-4 -2v-3a4 4 0 018 0v3" />
      </g>
      <text x="76" y="76" style={S} fontSize="18" fill="#1b2a22">yourwallet.com</text>
      <g transform="translate(500 70)">
        <circle r="12" fill="#1f4733" /><path d="M-5 0l3.5 3.5L5.5 -3.5" fill="none" stroke="#fbfbf7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="24" y="116" style={D} fontStyle="italic" fontSize="14" fill="#1f4733">Same letters, every time you open it.</text>
      {/* fake */}
      <text x="24" y="166" style={S} fontSize="10" fontWeight="600" letterSpacing="1.6" fill="#b4532a">THE LOOK-ALIKE</text>
      <rect x="24" y="178" width="512" height="48" rx="24" fill="#fbf1ea" stroke="#b4532a" strokeWidth="2" strokeDasharray="7 5" />
      <g transform="translate(50 202)" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle r="8" /><path d="M0 -4v5M0 4.5v.5" />
      </g>
      <text x="76" y="208" style={S} fontSize="18" fill="#1b2a22">yourwal<tspan fill="#b4532a" fontWeight="700">1</tspan>et-login.com</text>
      <g transform="translate(500 202)">
        <circle r="12" fill="#b4532a" /><path d="M-4.5 -4.5l9 9M4.5 -4.5l-9 9" stroke="#fbfbf7" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <path d="M170 220v22" stroke="#b4532a" strokeWidth="1.6" strokeLinecap="round" />
      <text x="24" y="262" style={D} fontStyle="italic" fontSize="14" fill="#b4532a">One swapped character, or extra words tacked on.</text>
      <text x="24" y="284" style={S} fontSize="10" fill="#6b7a70" letterSpacing=".5">Example addresses for illustration only.</text>
    </svg>
  );
}

/** Figure: a wallet app is a window; the money is in the vault; the words are the key. */
export function WindowVaultArt(p: P) {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-labelledby="mmWvT mmWvD" {...p}>
      <title id="mmWvT">A wallet app is a window, not the vault</title>
      <desc id="mmWvD">A window on the left looks onto a vault on the right. The vault is the Monero network and holds the coins. A key labelled recovery words opens a new window onto the same vault.</desc>
      <rect width="560" height="300" fill="#fbfbf7" />
      {/* vault */}
      <g transform="translate(382 128)">
        <rect x="-110" y="-96" width="220" height="192" rx="10" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.6" />
        <rect x="-96" y="-82" width="192" height="164" rx="6" fill="none" stroke="#1f4733" strokeWidth="1.2" strokeDasharray="2 5" />
        <circle r="38" fill="#edeee6" stroke="#1f4733" strokeWidth="2.4" />
        <circle r="8" fill="none" stroke="#1f4733" strokeWidth="2" />
        <path d="M0 -8v-22M0 8v22M-8 0h-22M8 0h22M-6 -6l-16 -16M6 -6l16 -16M-6 6l-16 16M6 6l16 16" stroke="#1f4733" strokeWidth="2" strokeLinecap="round" />
        <g fill="#fbfbf7" stroke="#b4532a" strokeWidth="2">
          <circle cx="-74" cy="62" r="9" /><circle cx="-54" cy="66" r="9" /><circle cx="-64" cy="48" r="9" />
        </g>
      </g>
      <text x="382" y="258" style={D} fontStyle="italic" fontSize="16" fill="#1f4733" textAnchor="middle">the money lives here</text>
      {/* windows */}
      <g>
        <rect x="26" y="52" width="130" height="104" rx="8" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="2" strokeDasharray="7 6" />
        <path d="M26 76H156" stroke="#c7c8bb" strokeWidth="1.5" />
        <path d="M40 100h60M40 116h82M40 132h44" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round" />
        <path d="M26 198 L66 178" stroke="none" />
        <text x="91" y="40" style={D} fontStyle="italic" fontSize="15" fill="#6b7a70" textAnchor="middle">old window (gone)</text>
      </g>
      <g>
        <rect x="26" y="182" width="130" height="86" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" />
        <path d="M26 204H156" stroke="#1f4733" strokeWidth="1.5" />
        <path d="M40 224h60M40 240h82" stroke="#1f4733" strokeWidth="3" strokeLinecap="round" opacity=".55" />
        <text x="91" y="288" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">new window</text>
      </g>
      <path d="M160 108C200 108 230 120 264 128" fill="none" stroke="#c7c8bb" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      <path d="M160 226C206 226 240 186 268 150" fill="none" stroke="#b4532a" strokeWidth="2.2" strokeLinecap="round" />
      {/* key */}
      <g transform="translate(206 168) rotate(-22)" fill="none" stroke="#b4532a" strokeWidth="2.4" strokeLinecap="round">
        <circle r="11" fill="#fbfbf7" /><circle r="4" /><path d="M11 0h34M34 0v8M42 0v6" />
      </g>
      <text x="200" y="258" style={S} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#b4532a" textAnchor="middle">RECOVERY WORDS</text>
    </svg>
  );
}

/* ---------- Step illustrations (viewBox 220 x 130) ---------- */
export function StepOpen(p: P) {
  return (
    <svg viewBox="0 0 220 130" role="img" aria-label="A browser window with the wallet page open" {...p}>
      <rect x="20" y="14" width="180" height="102" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <path d="M20 38H200" stroke="#1f4733" strokeWidth="1.4" />
      <rect x="62" y="21" width="96" height="11" rx="5.5" fill="#edeee6" stroke="#c7c8bb" />
      <text x="110" y="30" style={S} fontSize="7.5" fill="#1b2a22" textAnchor="middle">/wallet</text>
      <rect x="72" y="58" width="76" height="32" rx="6" fill="#1f4733" />
      <text x="110" y="78" style={S} fontSize="10" fontWeight="600" fill="#fbfbf7" textAnchor="middle">Open wallet</text>
      <path d="M154 90l10 18-6-3-4 6z" fill="#fbfbf7" stroke="#b4532a" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
export function StepRestore(p: P) {
  return (
    <svg viewBox="0 0 220 130" role="img" aria-label="Two choices, create new or restore, with restore highlighted" {...p}>
      <rect x="22" y="26" width="82" height="78" rx="8" fill="#fbfbf7" stroke="#c7c8bb" strokeWidth="2" />
      <path d="M63 54v22M52 65h22" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round" />
      <text x="63" y="94" style={D} fontStyle="italic" fontSize="11" fill="#6b7a70" textAnchor="middle">Create new</text>
      <rect x="116" y="26" width="82" height="78" rx="8" fill="#fbfbf7" stroke="#b4532a" strokeWidth="2.4" />
      <g fill="none" stroke="#b4532a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M172 56a14 14 0 11-3 17" /><path d="M164 52l8 4-3 8" transform="translate(-4 -2)" /></g>
      <text x="157" y="94" style={D} fontStyle="italic" fontSize="11" fill="#b4532a" textAnchor="middle">Restore</text>
    </svg>
  );
}
export function StepWords(p: P) {
  return (
    <svg viewBox="0 0 220 130" role="img" aria-label="A grid of numbered recovery word boxes being filled in" {...p}>
      <g fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6">
        {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
          <rect key={`${c}${r}`} x={22 + c * 46} y={22 + r * 28} width="40" height="22" rx="4" />
        )))}
      </g>
      <g stroke="#1f4733" strokeWidth="2" strokeLinecap="round" opacity=".55"><path d="M28 33h22M74 33h24M120 33h20M166 33h22M28 61h26M74 61h18M120 61h24M28 89h20" /></g>
      <text x="110" y="120" style={D} fontStyle="italic" fontSize="12" fill="#b4532a" textAnchor="middle">25 words, in order</text>
    </svg>
  );
}
export function StepSync(p: P) {
  return (
    <svg viewBox="0 0 220 130" role="img" aria-label="A padlock and a progress bar filling as the wallet syncs" {...p}>
      <rect x="28" y="22" width="40" height="32" rx="6" fill="#1f4733" />
      <path d="M36 22v-8a12 12 0 0124 0v8" fill="none" stroke="#1f4733" strokeWidth="4.5" />
      <circle cx="48" cy="36" r="4" fill="#edeee6" />
      <text x="84" y="34" style={S} fontSize="9" fontWeight="600" letterSpacing="1.2" fill="#1f4733">PASSWORD SET</text>
      <text x="84" y="48" style={D} fontStyle="italic" fontSize="11" fill="#6b7a70">locks it on this browser</text>
      <rect x="28" y="80" width="164" height="14" rx="7" fill="#edeee6" stroke="#1f4733" strokeWidth="1.6" />
      <rect x="28" y="80" width="104" height="14" rx="7" fill="#1f4733" />
      <text x="110" y="116" style={D} fontStyle="italic" fontSize="12" fill="#b4532a" textAnchor="middle">syncing, then your balance appears</text>
    </svg>
  );
}

/** Tiny icons for outcomes. */
export function OutNoDownload(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="9" width="36" height="26" rx="4" stroke="#1f4733" strokeWidth="2" />
      <path d="M17 41h14M24 35v6" stroke="#1f4733" strokeWidth="2" />
      <path d="M15 33L33 11" stroke="#b4532a" strokeWidth="2.4" />
    </svg>
  );
}
export function OutAnyBrowser(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="24" cy="24" r="16" stroke="#1f4733" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="6.5" ry="16" stroke="#1f4733" strokeWidth="2" />
      <path d="M8 24h32" stroke="#1f4733" strokeWidth="2" />
      <path d="M36 8l4 4-4 4" stroke="#b4532a" strokeWidth="2.4" />
    </svg>
  );
}
export function OutNoAccount(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="22" cy="16" r="7" stroke="#1f4733" strokeWidth="2" />
      <path d="M8 40c1-8 6-12 14-12s13 4 14 12" stroke="#1f4733" strokeWidth="2" />
      <path d="M32 8l10 10M42 8L32 18" stroke="#b4532a" strokeWidth="2.4" />
    </svg>
  );
}
export function OutKeys(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" stroke="#1f4733" strokeWidth="2" />
      <circle cx="24" cy="22" r="4" stroke="#b4532a" strokeWidth="2.4" />
      <path d="M24 26v7" stroke="#b4532a" strokeWidth="2.4" />
    </svg>
  );
}

/** Closing seal. */
export function SealArt(p: P) {
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" fill="none" {...p}>
      <circle cx="120" cy="120" r="104" stroke="#e9a07a" strokeWidth="1.4" />
      <circle cx="120" cy="120" r="90" stroke="#cfdacf" strokeWidth="1" strokeDasharray="2 6" strokeLinecap="round" />
      <g stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 66l36 14v28c0 24-16 40-36 48-20-8-36-24-36-48V80z" />
        <path d="M102 116l13 13 24-26" stroke="#e9a07a" />
      </g>
    </svg>
  );
}
