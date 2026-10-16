/**
 * MonkStash illustration set. Flat, editorial diagrams drawn in the brand palette
 * (paper, forest ink, Monero orange, the sprig). They use CSS variables so they
 * adapt to the theme, and they carry the meaning of each concept, not decoration.
 */
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = { xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-hidden": true as unknown as boolean };

/* ---------- Non-custodial: keys never cross the line between you and the node ---------- */
export function IlloNode() {
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="Your device holds the keys; the Monero node only serves data">
      {/* left: your device */}
      <rect x="18" y="46" width="200" height="208" rx="16" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <text x="38" y="78" fontFamily="var(--font-sans)" fontSize="13" fontWeight="650" fill="var(--ink)">Your device</text>
      <rect x="38" y="96" width="160" height="40" rx="9" fill="var(--mint-soft)" stroke="var(--mint-line)" strokeWidth="1.5" />
      <rect x="50" y="108" width="16" height="12" rx="2" fill="none" stroke="var(--mint)" strokeWidth="2" />
      <path d="M53 108v-3a5 5 0 0 1 10 0v3" fill="none" stroke="var(--mint)" strokeWidth="2" />
      <text x="76" y="117" fontFamily="var(--font-sans)" fontSize="11.5" fontWeight="600" fill="var(--ink)">Recovery words</text>
      <text x="76" y="129" fontFamily="var(--font-sans)" fontSize="10" fill="var(--ink-2)">encrypted here</text>
      {/* 25 dot grid */}
      <g fill="var(--line-strong)">
        {Array.from({ length: 25 }, (_, i) => <circle key={i} cx={46 + (i % 5) * 32} cy={162 + Math.floor(i / 5) * 18} r="3.1" />)}
      </g>
      {/* divider: keys never cross */}
      <line x1="260" y1="40" x2="260" y2="260" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 6" />
      <g transform="translate(260 150)">
        <circle r="18" fill="var(--surface)" stroke="var(--mint)" strokeWidth="2" />
        <rect x="-7" y="-4" width="14" height="11" rx="2" fill="none" stroke="var(--mint)" strokeWidth="2" />
        <path d="M-4 -4v-2a4 4 0 0 1 8 0v2" fill="none" stroke="var(--mint)" strokeWidth="2" />
      </g>
      <text x="260" y="286" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10.5" fontWeight="600" fill="var(--ink-2)">keys never cross</text>
      {/* right: node */}
      <rect x="302" y="46" width="200" height="208" rx="16" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="2" />
      <text x="322" y="78" fontFamily="var(--font-sans)" fontSize="13" fontWeight="650" fill="var(--ink)">Monero node</text>
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={322 + i * 10} y={96 + i * 10} width="150" height="34" rx="7" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
      ))}
      <text x="356" y="146" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink-2)">blockchain</text>
      {/* arrows across */}
      <g stroke="var(--ink-3)" strokeWidth="2" fill="none">
        <path d="M300 196 H232" markerEnd="url(#ar)" />
        <path d="M220 226 H300" markerEnd="url(#ar)" />
      </g>
      <text x="236" y="190" fontFamily="var(--font-sans)" fontSize="10" fill="var(--ink-2)">block data</text>
      <text x="236" y="243" fontFamily="var(--font-sans)" fontSize="10" fill="var(--ink-2)">signed payment</text>
      <defs>
        <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="var(--ink-3)" /></marker>
      </defs>
    </svg>
  );
}

/* ---------- Recovery words on paper ---------- */
export function IlloBackup() {
  const words = ["suture", "citadel", "nocturnal", "sapling", "bevel", "wetsuit"];
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="Write your 25 recovery words on paper">
      <rect x="150" y="30" width="250" height="240" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <path d="M365 30 h35 v35 z" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="2" />
      <text x="175" y="62" fontFamily="var(--font-sans)" fontSize="13" fontWeight="650" fill="var(--ink)">Recovery words</text>
      <g>
        {Array.from({ length: 10 }, (_, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = 175 + col * 110, y = 86 + row * 34;
          const filled = i < 6;
          return (
            <g key={i}>
              <text x={x} y={y + 12} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">{i + 1}</text>
              {filled
                ? <text x={x + 16} y={y + 12} fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)">{words[i]}</text>
                : <line x1={x + 16} y1={y + 10} x2={x + 92} y2={y + 10} stroke="var(--line-strong)" strokeWidth="1.5" />}
            </g>
          );
        })}
      </g>
      <text x="175" y="258" fontFamily="var(--font-sans)" fontSize="10" fill="var(--ink-3)">1 of 25 …</text>
      {/* pencil */}
      <g transform="rotate(42 430 210)">
        <rect x="415" y="150" width="14" height="96" rx="3" fill="var(--mint)" />
        <path d="M415 246 l7 16 l7 -16 z" fill="var(--ink)" />
        <rect x="415" y="150" width="14" height="12" rx="3" fill="var(--ink)" opacity="0.25" />
      </g>
    </svg>
  );
}

/* ---------- Ring signatures: the real input hidden among decoys ---------- */
export function IlloRing() {
  const n = 16, cx = 170, cy = 150, r = 104;
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="Your real input is hidden among decoy inputs">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="2 8" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        const real = i === 5;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="11" fill={real ? "var(--mint)" : "var(--surface)"} stroke={real ? "var(--mint)" : "var(--line-strong)"} strokeWidth="2" />
            {real ? <circle cx={x} cy={y} r="3.5" fill="#fff" /> : null}
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12" fontWeight="650" fill="var(--ink)">1 real</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12" fill="var(--ink-2)">15 decoys</text>
      {/* legend */}
      <g transform="translate(330 120)">
        <circle cx="10" cy="0" r="9" fill="var(--mint)" /><text x="28" y="4" fontFamily="var(--font-sans)" fontSize="12" fill="var(--ink)">Your real input</text>
        <circle cx="10" cy="34" r="9" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" /><text x="28" y="38" fontFamily="var(--font-sans)" fontSize="12" fill="var(--ink-2)">Decoys from the chain</text>
        <text x="0" y="78" fontFamily="var(--font-sans)" fontSize="11.5" fill="var(--ink-2)">An outsider cannot tell</text>
        <text x="0" y="94" fontFamily="var(--font-sans)" fontSize="11.5" fill="var(--ink-2)">which one is yours.</text>
      </g>
    </svg>
  );
}

/* ---------- Stealth addresses: one address, many one-time addresses ---------- */
export function IlloStealth() {
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="Each payment goes to a fresh one-time address">
      <rect x="24" y="118" width="150" height="64" rx="12" fill="var(--mint-soft)" stroke="var(--mint-line)" strokeWidth="2" />
      <text x="99" y="146" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12.5" fontWeight="650" fill="var(--ink)">Your address</text>
      <text x="99" y="164" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink-2)">4A…k9</text>
      {[-80, -27, 27, 80].map((dy, i) => (
        <g key={i}>
          <path d={`M174 150 C 240 150, 250 ${150 + dy}, 318 ${150 + dy}`} fill="none" stroke="var(--line-strong)" strokeWidth="2" />
          <rect x="320" y={132 + dy} width="176" height="36" rx="9" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
          <circle cx="338" cy={150 + dy} r="5" fill="var(--mint)" />
          <text x="352" y={154 + dy} fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink-2)">one-time 8{["c", "f", "a", "d"][i]}…{["2", "7", "1", "9"][i]}x</text>
        </g>
      ))}
      <text x="408" y="236" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11.5" fill="var(--ink-2)">unlinkable on the blockchain</text>
    </svg>
  );
}

/* ---------- View-only: watch incoming, cannot spend ---------- */
export function IlloViewKey() {
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="A view key can watch incoming payments but cannot spend">
      <ellipse cx="150" cy="130" rx="86" ry="56" fill="var(--mint-soft)" stroke="var(--mint-line)" strokeWidth="2" />
      <circle cx="150" cy="130" r="26" fill="var(--surface)" stroke="var(--mint)" strokeWidth="2.5" />
      <circle cx="150" cy="130" r="11" fill="var(--mint)" />
      <text x="150" y="210" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12.5" fontWeight="650" fill="var(--ink)">View key</text>
      <text x="150" y="228" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fill="var(--ink-2)">sees payments in</text>
      {/* incoming list */}
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="300" y={70 + i * 46} width="196" height="34" rx="8" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />
            <path d="M318 87 l0 10 M313 92 l5 5 l5 -5" transform={`translate(0 ${i * 46})`} stroke="var(--mint)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="334" y={91 + i * 46} fontFamily="var(--font-sans)" fontSize="11.5" fill="var(--ink)">Received +{["0.50", "3.50", "0.01"][i]}</text>
          </g>
        ))}
      </g>
      {/* cannot spend */}
      <g transform="translate(398 236)">
        <text x="0" y="0" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11.5" fontWeight="600" fill="var(--ink-2)">cannot send out</text>
      </g>
    </svg>
  );
}

/* ---------- Browser wallet: keys stay in the browser ---------- */
export function IlloBrowserKeys() {
  return (
    <svg {...base} viewBox="0 0 520 300" width="100%" aria-label="Your wallet runs in the browser and keeps your keys">
      <rect x="60" y="40" width="400" height="220" rx="16" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <line x1="60" y1="78" x2="460" y2="78" stroke="var(--line-strong)" strokeWidth="2" />
      <circle cx="82" cy="59" r="4" fill="var(--line-strong)" /><circle cx="98" cy="59" r="4" fill="var(--line-strong)" /><circle cx="114" cy="59" r="4" fill="var(--line-strong)" />
      <rect x="150" y="50" width="240" height="18" rx="9" fill="var(--surface-2)" />
      <text x="160" y="63" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">wallet.monkstash.com</text>
      {/* vault */}
      <g transform="translate(260 168)">
        <path d="M0 -54 L52 -34 V2 C52 36 28 56 0 66 C-28 56 -52 36 -52 2 V-34 Z" fill="var(--mint-soft)" stroke="var(--mint)" strokeWidth="2.5" />
        <rect x="-15" y="-10" width="30" height="24" rx="4" fill="none" stroke="var(--mint)" strokeWidth="2.5" />
        <path d="M-9 -10 v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="var(--mint)" strokeWidth="2.5" />
        <circle cx="0" cy="2" r="3.5" fill="var(--mint)" />
      </g>
      <text x="260" y="246" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12" fontWeight="600" fill="var(--ink)">Encrypted on your device</text>
    </svg>
  );
}
