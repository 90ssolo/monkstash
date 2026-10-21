import type { SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
import { donate, type MilestoneStatus } from "@/lib/donate";

type P = SVGProps<SVGSVGElement>;
const D = { fontFamily: "var(--font-display)" } as const;
const S = { fontFamily: "var(--font-sans)" } as const;

/** A Monero coin. `hero` uses the official coloured symbol (one per figure); others are a ring with the mono symbol. */
function Coin({ x, y, r = 15, stroke = "#b4532a", fill = "#fbfbf7", hero = false }: { x: number; y: number; r?: number; stroke?: string; fill?: string; hero?: boolean }) {
  if (hero) return <MoneroSymbol x={x - r} y={y - r} size={r * 2} variant="color" />;
  const s = r * 1.15;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
      <MoneroSymbol x={x - s / 2} y={y - s / 2} size={s} variant="mono" style={{ color: stroke }} />
    </g>
  );
}

/** Hero: a glass jar of XMR coins, with a lens held up to it. */
export function HeroArt(p: P) {
  return (
    <svg viewBox="0 0 560 420" role="img" aria-labelledby="dnHeroT dnHeroD" {...p}>
      <title id="dnHeroT">A glass jar of Monero coins with a magnifying glass</title>
      <desc id="dnHeroD">A clear jar holds a stack of coins. A magnifying glass held beside it reads view key, showing that anyone can look in and count what is there.</desc>
      <rect width="560" height="420" fill="#fbfbf7" />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 60H560M0 120H560M0 180H560M0 240H560M0 300H560M0 360H560" /></g>
      {/* jar */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x="150" y="62" width="150" height="26" rx="5" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.4" />
        <path d="M162 88C162 100 138 106 138 134V326C138 346 152 358 172 358H278C298 358 312 346 312 326V134C312 106 288 100 288 88" fill="#fbfbf7" fillOpacity=".6" stroke="#1f4733" strokeWidth="2.4" />
        <path d="M156 140V320" stroke="#1f4733" strokeOpacity=".25" strokeWidth="5" />
      </g>
      {/* coins in the jar */}
      <Coin x={190} y={330} /><Coin x={226} y={334} /><Coin x={262} y={330} />
      <Coin x={208} y={304} /><Coin x={244} y={306} /><Coin x={280} y={302} r={13} />
      <Coin x={226} y={278} /><Coin x={262} y={276} r={13} />
      <Coin x={240} y={250} r={13} />
      <text x="225" y="396" style={D} fontStyle="italic" fontSize="17" fill="#1f4733" textAnchor="middle">the donation wallet</text>
      {/* coin dropping in */}
      <g opacity=".9"><Coin x={225} y={30} r={14} hero /></g>
      <path d="M225 50V68" stroke="#b4532a" strokeWidth="1.8" strokeDasharray="3 5" strokeLinecap="round" />
      {/* lens */}
      <g>
        <circle cx="412" cy="196" r="64" fill="#fbfbf7" fillOpacity=".75" stroke="#b4532a" strokeWidth="3.2" />
        <circle cx="412" cy="196" r="54" fill="none" stroke="#b4532a" strokeWidth="1" strokeOpacity=".5" />
        <path d="M458 242L508 292" stroke="#b4532a" strokeWidth="9" strokeLinecap="round" />
        <path d="M380 178C392 164 412 160 430 168" fill="none" stroke="#1f4733" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(412 204)">
          <circle r="22" fill="#fbfbf7" stroke="#b4532a" strokeWidth="2.4" />
          <path d="M-8 -3a8 8 0 1 1 6 8L8 16 12 12 9 9 12 6" fill="none" stroke="#b4532a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="412" y="156" style={S} fontSize="9" fontWeight="600" letterSpacing="1.6" fill="#b4532a" textAnchor="middle">VIEW KEY</text>
      </g>
      <path d="M350 214C336 226 322 238 312 248" fill="none" stroke="#b4532a" strokeWidth="1.6" strokeDasharray="5 5" strokeLinecap="round" />
      <text x="470" y="352" style={D} fontStyle="italic" fontSize="16" fill="#b4532a" textAnchor="middle">anyone can look in</text>
    </svg>
  );
}

/** The gap: a closed door where MyMonero was, an empty toolbar slot where an extension should be. */
export function GapArt(p: P) {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-labelledby="dnGapT dnGapD" {...p}>
      <title id="dnGapT">Two gaps in the Monero wallet landscape</title>
      <desc id="dnGapD">On the left, a closed web wallet window labelled January 2026. On the right, a browser toolbar with an empty dashed slot where a Monero extension would sit.</desc>
      <rect width="560" height="300" fill="#fbfbf7" />
      {/* closed window */}
      <g>
        <rect x="26" y="40" width="210" height="170" rx="8" fill="#fbfbf7" stroke="#6b7a70" strokeWidth="2" strokeDasharray="7 6" />
        <path d="M26 70H236" stroke="#c7c8bb" strokeWidth="1.5" />
        <circle cx="42" cy="55" r="4" fill="none" stroke="#c7c8bb" strokeWidth="1.5" />
        <circle cx="56" cy="55" r="4" fill="none" stroke="#c7c8bb" strokeWidth="1.5" />
        <rect x="96" y="92" width="70" height="100" rx="3" fill="#edeee6" stroke="#6b7a70" strokeWidth="2" />
        <circle cx="152" cy="144" r="3" fill="#6b7a70" />
        <g transform="translate(131 34) rotate(-6)">
          <rect x="-50" y="-13" width="100" height="26" rx="3" fill="#b4532a" />
          <text x="0" y="5" style={S} fontSize="11" fontWeight="600" letterSpacing="1.6" fill="#fbfbf7" textAnchor="middle">CLOSED 2026</text>
        </g>
      </g>
      <text x="131" y="240" style={D} fontStyle="italic" fontSize="16" fill="#6b7a70" textAnchor="middle">a web wallet, gone</text>
      {/* toolbar */}
      <g>
        <rect x="290" y="40" width="244" height="44" rx="22" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
        <rect x="308" y="52" width="104" height="20" rx="10" fill="#edeee6" />
        <g stroke="#1f4733" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <rect x="432" y="50" width="24" height="24" rx="5" />
          <rect x="464" y="50" width="24" height="24" rx="5" />
        </g>
        <rect x="496" y="50" width="24" height="24" rx="5" fill="none" stroke="#b4532a" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M508 56v12M502 62h12" stroke="#b4532a" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M508 96V122" stroke="#b4532a" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" />
      </g>
      <text x="412" y="150" style={D} fontStyle="italic" fontSize="16" fill="#b4532a" textAnchor="middle">an empty slot for Monero</text>
      <text x="412" y="240" style={D} fontStyle="italic" fontSize="16" fill="#1f4733" textAnchor="middle">still no good extension</text>
      <path d="M262 126h-6M262 126l-8-5M262 126l-8 5" fill="none" stroke="#c7c8bb" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Roadmap ladder: one step per milestone, coloured by status, drawn from lib/donate.ts so it never drifts. */
export function LadderArt(p: P) {
  const list = donate.milestones;
  const n = list.length;
  const step = Math.min(64, 456 / n);
  const w = Math.min(48, step - 8);
  const live = list.filter((m) => m.status === "live").length;
  const style = (s: MilestoneStatus) =>
    s === "live" ? { fill: "#1f4733", stroke: "#1f4733", dash: undefined, ink: "#1f4733" }
    : s === "building" ? { fill: "#f1e3da", stroke: "#b4532a", dash: undefined, ink: "#b4532a" }
    : s === "next" ? { fill: "none", stroke: "#b4532a", dash: undefined, ink: "#b4532a" }
    : { fill: "none", stroke: "#1f4733", dash: "6 5", ink: "#6b7a70" };
  return (
    <svg viewBox="0 0 480 300" role="img" aria-labelledby="dnLadT dnLadD" {...p}>
      <title id="dnLadT">{`The roadmap as a staircase of ${n} steps`}</title>
      <desc id="dnLadD">{`${n} steps rise from left to right, one per feature, in build order. ${live} are filled in because they are live; the rest are being built, up next, or waiting to be funded.`}</desc>
      <rect width="480" height="300" fill="#fbfbf7" />
      {list.map((m, i) => {
        const h = 30 + (i * 172) / Math.max(1, n - 1);
        const x = 12 + i * step;
        const y = 236 - h;
        const st = style(m.status);
        return (
          <g key={m.id}>
            <rect x={x} y={y} width={w} height={h} fill={st.fill} stroke={st.stroke} strokeWidth="2" strokeDasharray={st.dash} rx="3" />
            <text x={x + w / 2} y={y - 8} style={D} fontStyle="italic" fontSize="15" fill={st.ink} textAnchor="middle">{i}</text>
            {m.status === "live" ? <path d={`M${x + w / 2 - 6} ${y + h - 16}l4 4 8-8`} fill="none" stroke="#fbfbf7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </g>
        );
      })}
      <path d="M0 236H480" stroke="#1f4733" strokeWidth="2" />
      {([["live", "Live"], ["building", "Building"], ["next", "Next"], ["later", "Later"]] as [MilestoneStatus, string][]).map(([s, label], i) => {
        const st = style(s);
        return (
          <g key={s} transform={`translate(${16 + i * 110} 262)`}>
            <rect width="16" height="16" rx="2" fill={st.fill} stroke={st.stroke} strokeWidth="1.6" strokeDasharray={st.dash ? "4 3" : undefined} />
            <text x="24" y="13" style={S} fontSize="11" fontWeight="600" letterSpacing="1" fill={st.ink}>{label.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Dark band: a safe you cannot see into, versus a jar you can see into but not reach into. */
export function JarCompareArt(p: P) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-labelledby="dnJarT dnJarD" {...p}>
      <title id="dnJarT">A glass jar you can see into but not reach into</title>
      <desc id="dnJarD">On the left, a closed box where nobody can see what is inside. On the right, a glass jar with an eye looking in and a hand held back by the glass: anyone can see the coins, nobody can take them.</desc>
      <rect width="520" height="300" fill="#1b2a22" />
      {/* box */}
      <g stroke="#9fb0a2" strokeWidth="2" fill="none" strokeLinejoin="round">
        <rect x="40" y="96" width="140" height="130" rx="6" fill="#22342a" />
        <path d="M40 130H180" />
        <circle cx="110" cy="178" r="10" />
      </g>
      <text x="110" y="256" style={D} fontStyle="italic" fontSize="16" fill="#9fb0a2" textAnchor="middle">a closed box</text>
      <text x="110" y="278" style={D} fontStyle="italic" fontSize="13" fill="#9fb0a2" textAnchor="middle">trust us</text>
      {/* jar */}
      <g strokeLinejoin="round" strokeLinecap="round" fill="none">
        <rect x="318" y="68" width="100" height="18" rx="4" fill="#22342a" stroke="#e9a07a" strokeWidth="2" />
        <path d="M326 86C326 96 306 100 306 122V214C306 228 316 236 330 236H406C420 236 430 228 430 214V122C430 100 410 96 410 86" fill="#e9a07a" fillOpacity=".06" stroke="#e9a07a" strokeWidth="2" />
      </g>
      <Coin x={334} y={216} r={12} stroke="#e9a07a" fill="#22342a" />
      <Coin x={368} y={218} r={12} stroke="#e9a07a" fill="#22342a" />
      <Coin x={402} y={216} r={12} stroke="#e9a07a" fill="#22342a" />
      <Coin x={350} y={192} r={12} stroke="#e9a07a" fill="#22342a" />
      <Coin x={386} y={192} r={12} stroke="#e9a07a" fill="#22342a" />
      <Coin x={368} y={168} r={12} stroke="#e9a07a" fill="#22342a" />
      {/* eye */}
      <g transform="translate(240 150)" fill="none" stroke="#f6f5ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-24 0C-14 -14 14 -14 24 0C14 14 -14 14 -24 0Z" />
        <circle r="6" fill="#f6f5ec" />
      </g>
      <path d="M268 150H300" stroke="#f6f5ec" strokeWidth="1.6" strokeDasharray="4 5" strokeLinecap="round" />
      {/* hand held back */}
      <g stroke="#9fb0a2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M470 120H444" />
        <path d="M444 120l-4 -6M444 120l-5 0M444 120l-4 6" />
      </g>
      <path d="M430 120H440" stroke="#e9a07a" strokeWidth="2" />
      <text x="470" y="146" style={S} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#9fb0a2" textAnchor="middle">GLASS</text>
      <text x="368" y="278" style={D} fontStyle="italic" fontSize="16" fill="#e9a07a" textAnchor="middle">see in, cannot reach in</text>
      <text x="240" y="196" style={D} fontStyle="italic" fontSize="14" fill="#f6f5ec" textAnchor="middle">you</text>
    </svg>
  );
}

/** Payment proof: the donor proves they sent it, nothing else is revealed. */
export function ProofArt(p: P) {
  return (
    <svg viewBox="0 0 520 220" role="img" aria-labelledby="dnPrfT dnPrfD" {...p}>
      <title id="dnPrfT">How to get listed with a payment proof</title>
      <desc id="dnPrfD">Three steps from left to right: you donate, your wallet creates a payment proof, and you share only that proof so a supporter name can be added to the wall.</desc>
      <rect width="520" height="220" fill="#fbfbf7" />
      <g stroke="#1f4733" strokeWidth="2" fill="#fbfbf7" strokeLinejoin="round" strokeLinecap="round">
        <rect x="24" y="52" width="120" height="96" rx="8" />
        <rect x="200" y="52" width="120" height="96" rx="8" />
        <rect x="376" y="52" width="120" height="96" rx="8" />
      </g>
      <Coin x={84} y={100} r={22} hero />
      <g transform="translate(260 100)" stroke="#b4532a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-22 -28h30l14 14v42H-22z" fill="#fbfbf7" />
        <path d="M8 -28v14h14" />
        <path d="M-12 4h22M-12 14h14" />
        <path d="M-6 -6l4 4 8-8" />
      </g>
      <g transform="translate(436 100)" stroke="#1f4733" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cy="-10" r="10" />
        <path d="M-22 26c0-14 10-22 22-22s22 8 22 22" />
      </g>
      <path d="M150 100H194M326 100H370" stroke="#b4532a" strokeWidth="1.8" strokeDasharray="5 5" strokeLinecap="round" />
      <path d="M188 94l8 6-8 6M364 94l8 6-8 6" fill="none" stroke="#b4532a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <text x="84" y="40" style={D} fontStyle="italic" fontSize="22" fill="#b4532a" textAnchor="middle">i</text>
      <text x="260" y="40" style={D} fontStyle="italic" fontSize="22" fill="#b4532a" textAnchor="middle">ii</text>
      <text x="436" y="40" style={D} fontStyle="italic" fontSize="22" fill="#b4532a" textAnchor="middle">iii</text>
      <text x="84" y="178" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">you donate</text>
      <text x="260" y="178" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">your wallet makes a proof</text>
      <text x="436" y="178" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">you share only the proof</text>
    </svg>
  );
}

/**
 * Final band seal: the Monero symbol inside a lettered band, like the edge of a coin. The words
 * follow arcs inside the band (MONKSTASH over the top, "built in the open" under the bottom), so
 * nothing crosses a ring at any size. One instance per page, so fixed path ids are safe.
 */
export function SealArt(p: P) {
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="A seal: the Monero symbol in the centre, with MonkStash and built in the open lettered around the edge" {...p}>
      <defs>
        {/* Baselines inside the band (rings at 96 and 136). Top letters stand outward from r 108;
            bottom letters stand inward from r 127. Both paths run left to right, so both read upright. */}
        <path id="seal-top" d="M 42 150 A 108 108 0 0 1 258 150" />
        <path id="seal-bottom" d="M 23 150 A 127 127 0 0 0 277 150" />
      </defs>
      <circle cx="150" cy="150" r="136" fill="none" stroke="#e9a07a" strokeWidth="2" />
      <circle cx="150" cy="150" r="96" fill="none" stroke="#e9a07a" strokeOpacity=".55" strokeWidth="1.2" />
      <text style={D} fontSize="15" fontWeight="600" letterSpacing="5" fill="#fbfbf7">
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">MONKSTASH</textPath>
      </text>
      <text style={D} fontStyle="italic" fontSize="17" fill="#cfdacf">
        <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">built in the open</textPath>
      </text>
      <circle cx="150" cy="150" r="62" fill="none" stroke="#fbfbf7" strokeWidth="2.4" />
      <MoneroSymbol x={112} y={112} size={76} variant="mono" style={{ color: "#e9a07a" }} />
    </svg>
  );
}
