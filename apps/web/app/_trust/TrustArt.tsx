import type { ReactNode, SVGProps } from "react";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";

type P = SVGProps<SVGSVGElement>;

const F = "var(--font-display)";
const FOREST = "#1f4733";
const CLAY = "#b4532a";
const CLAY_DIM = "#e9a07a";
const PAPER = "#fbfbf7";
const TINT = "#edeee6";
const MUTED = "#4a574e";

/* ============ ABOUT ============ */

/** Your keys live on your device; our servers hold nothing; a node only sees requests. */
export function KeysOnDeviceArt(p: P) {
  return (
    <svg viewBox="0 0 380 280" role="img" aria-label="Your device holds your keys and recovery words, locked with your password. MonkStash's servers hold nothing. A Monero node only sees requests." {...p}>
      <text x="99" y="26" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="15" fill={FOREST}>Your device</text>
      <rect x="28" y="38" width="142" height="104" rx="8" fill={PAPER} stroke={FOREST} strokeWidth="2" />
      <path d="M14 152h170" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
      <circle cx="62" cy="76" r="12" fill="none" stroke={CLAY} strokeWidth="2.2" />
      <path d="M74 76h30M96 76v9M104 76v6" fill="none" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="120" y="92" width="26" height="20" rx="3" fill={TINT} stroke={FOREST} strokeWidth="2" />
      <path d="M126 92v-6a7 7 0 0114 0v6" fill="none" stroke={FOREST} strokeWidth="2" />
      <text x="99" y="132" textAnchor="middle" fontFamily={F} fontSize="12" fill={MUTED}>25 words, locked</text>

      <text x="291" y="26" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="15" fill={MUTED}>Our servers</text>
      <rect x="226" y="38" width="130" height="104" rx="8" fill="none" stroke={MUTED} strokeWidth="1.6" strokeDasharray="4 5" />
      <text x="291" y="82" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>no keys</text>
      <text x="291" y="102" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>no recovery words</text>
      <text x="291" y="122" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>no accounts</text>

      <path d="M178 90h42" stroke={CLAY} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
      <circle cx="199" cy="90" r="9" fill={PAPER} stroke={CLAY} strokeWidth="2" />
      <path d="M195 86l8 8M203 86l-8 8" stroke={CLAY} strokeWidth="2" strokeLinecap="round" />
      <text x="199" y="116" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="12" fill={CLAY}>never sent</text>

      <path d="M99 158v34" stroke={FOREST} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M93 186l6 8 6-8" fill="none" stroke={FOREST} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="200" width="300" height="62" rx="8" fill={TINT} stroke={FOREST} strokeWidth="1.6" />
      <MoneroSymbol size={30} x={56} y={216} variant="mono" style={{ color: FOREST }} />
      <text x="102" y="226" fontFamily={F} fontWeight="600" fontSize="15" fill={FOREST}>A Monero node</text>
      <text x="102" y="246" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>sees requests, never your keys</text>
    </svg>
  );
}

/** The story: a familiar wallet closes, look-alikes appear, a calm place to land. */
export function StoryArt(p: P) {
  return (
    <svg viewBox="0 0 600 190" role="img" aria-label="Three steps: a familiar Monero wallet closes in January 2026, look-alike sites appear, and MonkStash offers a calm place to land." {...p}>
      {/* panel 1: closed door */}
      <rect x="72" y="26" width="62" height="104" rx="3" fill={TINT} stroke={FOREST} strokeWidth="2" />
      <circle cx="123" cy="80" r="3" fill={FOREST} />
      <rect x="64" y="64" width="78" height="26" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="2" />
      <text x="103" y="82" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.5" fill={CLAY}>CLOSED</text>
      <text x="103" y="156" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="15" fill={FOREST}>A favourite closes</text>
      <text x="103" y="176" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>MyMonero, January 2026</text>

      <path d="M178 80l12 8-12 8" fill="none" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* panel 2: look-alikes */}
      <rect x="232" y="30" width="96" height="58" rx="5" fill={PAPER} stroke={CLAY} strokeWidth="1.6" strokeDasharray="4 4" />
      <rect x="246" y="46" width="96" height="58" rx="5" fill={PAPER} stroke={CLAY} strokeWidth="1.6" strokeDasharray="4 4" />
      <rect x="260" y="62" width="96" height="58" rx="5" fill={PAPER} stroke={CLAY} strokeWidth="1.8" />
      <path d="M308 72l17 30h-34z" fill={CLAY_DIM} stroke={CLAY} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M308 82v10" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="308" cy="97" r="1.6" fill={CLAY} />
      <text x="300" y="156" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="15" fill={FOREST}>Look-alikes appear</text>
      <text x="300" y="176" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>built to take your words</text>

      <path d="M388 80l12 8-12 8" fill="none" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* panel 3: open door */}
      <rect x="448" y="26" width="62" height="104" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="2" />
      <path d="M448 26l-26 10v104l26-10z" fill={TINT} stroke={FOREST} strokeWidth="2" strokeLinejoin="round" />
      <path d="M479 52v66" stroke={CLAY} strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
      <circle cx="486" cy="84" r="8" fill="none" stroke={CLAY} strokeWidth="2.2" />
      <path d="M494 84h12M502 84v6" fill="none" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />
      <text x="480" y="156" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="15" fill={FOREST}>A calm place to land</text>
      <text x="480" y="176" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>MonkStash</text>
    </svg>
  );
}

/** Dark band: the four layers, and which side of your device each one sits on. */
export function BuildStackArt(p: P) {
  const row = (y: number, title: string, sub: string, key: string) => (
    <g key={key}>
      <rect x="10" y={y} width="268" height="58" rx="8" fill="#1b2a22" stroke="#4a6a55" strokeWidth="1.6" />
      <text x="26" y={y + 26} fontFamily={F} fontWeight="600" fontSize="16" fill="#f6f5ec">{title}</text>
      <text x="26" y={y + 45} fontFamily={F} fontStyle="italic" fontSize="13" fill="#b7c4b8">{sub}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 420 290" role="img" aria-label="Four layers. Your browser and the monero-ts engine stay on your device. A Monero node and the Monero network sit outside it." {...p}>
      {row(8, "Your browser", "makes and locks your keys", "a")}
      {row(78, "monero-ts engine", "open source, runs as WebAssembly", "b")}
      {row(148, "A Monero node", "answers with blockchain data", "c")}
      <g>
        <rect x="10" y="218" width="268" height="58" rx="8" fill="#1b2a22" stroke="#4a6a55" strokeWidth="1.6" />
        <MoneroSymbol size={30} x={24} y={232} variant="mono" style={{ color: CLAY_DIM }} />
        <text x="66" y="244" fontFamily={F} fontWeight="600" fontSize="16" fill="#f6f5ec">The Monero network</text>
        <text x="66" y="263" fontFamily={F} fontStyle="italic" fontSize="13" fill="#b7c4b8">where payments are recorded</text>
      </g>
      {[66, 136, 206].map((y) => (
        <path key={y} d={`M144 ${y}v10m-5-5l5 5 5-5`} fill="none" stroke="#9fb0a2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d="M294 12v128" fill="none" stroke={CLAY_DIM} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M288 12h6M288 136h6" stroke={CLAY_DIM} strokeWidth="1.8" strokeLinecap="round" />
      <text x="308" y="68" fontFamily={F} fontStyle="italic" fontSize="15" fill={CLAY_DIM}>stays on</text>
      <text x="308" y="88" fontFamily={F} fontStyle="italic" fontSize="15" fill={CLAY_DIM}>your device</text>
      <path d="M294 156v120" fill="none" stroke="#7d9283" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 6" />
      <text x="308" y="208" fontFamily={F} fontStyle="italic" fontSize="15" fill="#b7c4b8">outside</text>
      <text x="308" y="228" fontFamily={F} fontStyle="italic" fontSize="15" fill="#b7c4b8">your device</text>
    </svg>
  );
}

/** Honest status: where MonkStash is today and the donor-funded security review. */
export function StatusArt(p: P) {
  return (
    <svg viewBox="0 0 440 170" role="img" aria-label="A short path. Today MonkStash is an early preview. An independent security review, funded by donations, comes later on the roadmap." {...p}>
      <path d="M60 70h320" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" />
      <circle cx="80" cy="70" r="16" fill={CLAY} stroke={CLAY} strokeWidth="2" />
      <circle cx="80" cy="70" r="26" fill="none" stroke={CLAY} strokeWidth="1.4" opacity=".55" />
      <circle cx="360" cy="70" r="16" fill={PAPER} stroke={FOREST} strokeWidth="2.4" />
      <path d="M352 70l6 6 11-13" fill="none" stroke={FOREST} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M204 62l14 8-14 8" fill="none" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="80" y="118" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="16" fill={FOREST}>Early preview</text>
      <text x="80" y="138" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={CLAY}>you are here</text>
      <text x="360" y="118" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="16" fill={FOREST}>Security review</text>
      <text x="360" y="138" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>funded by donations</text>
      <text x="220" y="30" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="14" fill={MUTED}>until then, use small amounts</text>
    </svg>
  );
}

/* ============ FAQ ============ */

/** Hero: a question, an answer, and the guide behind it. */
export function FaqHeroArt(p: P) {
  return (
    <svg viewBox="0 0 340 240" role="img" aria-label="A question bubble, an answer bubble, and a guide page the answer links to." {...p}>
      <path d="M22 22h150a8 8 0 018 8v66a8 8 0 01-8 8H72l-26 22v-22H22a8 8 0 01-8-8V30a8 8 0 018-8z" fill={PAPER} stroke={FOREST} strokeWidth="2" strokeLinejoin="round" />
      <text x="97" y="84" fontFamily={F} fontStyle="italic" fontSize="58" fill={CLAY} textAnchor="middle">?</text>
      <path d="M318 112H168a8 8 0 00-8 8v50a8 8 0 008 8h66l22 20v-20h62a8 8 0 008-8v-50a8 8 0 00-8-8z" transform="translate(-4 -2)" fill={FOREST} stroke={FOREST} strokeWidth="2" strokeLinejoin="round" />
      <g stroke="#edeee6" strokeWidth="3" strokeLinecap="round"><path d="M178 136h108M178 154h72" /></g>
      <rect x="22" y="150" width="74" height="76" rx="5" fill={PAPER} stroke={FOREST} strokeWidth="1.8" />
      <path d="M34 168h50M34 180h50M34 192h32" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M34 208h24" stroke={CLAY} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M100 200c28 0 40-14 56-26" fill="none" stroke={CLAY} strokeWidth="1.8" strokeDasharray="2 5" strokeLinecap="round" />
      <path d="M148 168l10 5-4 10" fill="none" stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <text x="59" y="238" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="12" fill={MUTED}>the deep guide</text>
    </svg>
  );
}

/** Fees and timing: from sent to treated as final. */
export function ConfirmTimelineArt(p: P) {
  return (
    <svg viewBox="0 0 440 190" role="img" aria-label="A timeline. A payment is sent, the first confirmation arrives in about 2 minutes, and after 10 confirmations, about 20 minutes, it is treated as final." {...p}>
      <path d="M40 100h360" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
      <MoneroSymbol size={26} x={27} y={46} variant="mono" style={{ color: FOREST }} />
      <circle cx="40" cy="100" r="8" fill={CLAY} />
      <circle cx="150" cy="100" r="8" fill={PAPER} stroke={FOREST} strokeWidth="2.4" />
      {[178, 202, 226, 250, 274, 298, 322, 346].map((x) => (
        <path key={x} d={`M${x} 93v14`} stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      ))}
      <circle cx="388" cy="100" r="11" fill={FOREST} />
      <path d="M382 100l4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M150 72h238" fill="none" stroke={CLAY} strokeWidth="1.6" />
      <path d="M150 72v8M388 72v8" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" />
      <text x="269" y="62" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="14" fill={CLAY}>confirmations stack up</text>
      <text x="40" y="136" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>Sent</text>
      <text x="150" y="136" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>1st confirmation</text>
      <text x="150" y="156" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>about 2 minutes</text>
      <text x="428" y="136" textAnchor="end" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>10 confirmations</text>
      <text x="428" y="156" textAnchor="end" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>about 20 minutes, final</text>
    </svg>
  );
}

/** Recovery: 25 words bring a wallet back; the restore height says where to start scanning. */
export function RestoreFlowArt(p: P) {
  const dots: ReactNode[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    dots.push(<rect key={`${r}${c}`} x={22 + c * 17} y={44 + r * 14} width="13" height="7" rx="2" fill={TINT} stroke={FOREST} strokeWidth="1" />);
  }
  return (
    <svg viewBox="0 0 440 220" role="img" aria-label="Your 25 recovery words restore the wallet in any browser. The restore height tells the wallet where on the blockchain to start looking, so earlier is safe." {...p}>
      <rect x="12" y="18" width="104" height="110" rx="6" fill={PAPER} stroke={FOREST} strokeWidth="1.8" />
      <text x="64" y="36" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill={FOREST}>25 words</text>
      {dots}
      <path d="M126 73h56" stroke={CLAY} strokeWidth="2" strokeLinecap="round" />
      <path d="M174 65l10 8-10 8" fill="none" stroke={CLAY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="196" y="18" width="232" height="110" rx="8" fill={PAPER} stroke={FOREST} strokeWidth="1.8" />
      <path d="M196 38h232" stroke={FOREST} strokeWidth="1.4" />
      <circle cx="208" cy="28" r="3" fill={CLAY} /><circle cx="219" cy="28" r="3" fill={FOREST} opacity=".5" /><circle cx="230" cy="28" r="3" fill={FOREST} opacity=".5" />
      <MoneroSymbol size={34} x={214} y={62} variant="mono" style={{ color: FOREST }} />
      <text x="262" y="78" fontFamily={F} fontWeight="600" fontSize="15" fill={FOREST}>Wallet restored</text>
      <text x="262" y="98" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>on any device, in any browser</text>
      <text x="262" y="116" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>once it has scanned</text>

      <text x="12" y="158" fontFamily={F} fontStyle="italic" fontSize="13" fill={MUTED}>the blockchain, oldest to newest</text>
      <rect x="12" y="168" width="416" height="14" rx="3" fill={TINT} stroke={FOREST} strokeWidth="1.4" />
      <rect x="170" y="168" width="258" height="14" rx="3" fill="rgba(31,71,51,0.22)" stroke={FOREST} strokeWidth="1.4" />
      <path d="M170 160v34" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M170 194h14" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />
      <text x="190" y="206" fontFamily={F} fontWeight="600" fontSize="13" fill={CLAY}>restore height: start looking here</text>
      <text x="90" y="199" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="12" fill={MUTED}>skipped</text>
    </svg>
  );
}

/* ============ SUPPORT ============ */

/** Hero: a signpost with the problems people bring. */
export function SupportHeroArt(p: P) {
  const sign = (y: number, w: number, label: string, key: string, clay = false) => (
    <g key={key}>
      <path d={`M104 ${y}h${w}l14 14-14 14h-${w}z`} fill={clay ? "#fbeadd" : PAPER} stroke={clay ? CLAY : FOREST} strokeWidth="2" strokeLinejoin="round" />
      <text x={112} y={y + 20} fontFamily={F} fontWeight="600" fontSize="15" fill={clay ? "#8f3e1d" : FOREST}>{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 340 250" role="img" aria-label="A signpost with arrows for common problems: syncing, balance, restore, and scams." {...p}>
      <path d="M92 36v196" stroke={FOREST} strokeWidth="5" strokeLinecap="round" />
      <path d="M60 234h64" stroke={FOREST} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="92" cy="30" r="8" fill={PAPER} stroke={CLAY} strokeWidth="2.2" />
      {sign(52, 112, "Not syncing", "a")}
      {sign(100, 120, "Balance looks off", "b")}
      {sign(148, 84, "Restore", "c")}
      {sign(196, 124, "Suspected scam", "d", true)}
      <text x="226" y="22" fontFamily={F} fontStyle="italic" fontSize="14" fill={MUTED}>Which way?</text>
    </svg>
  );
}

/** Dark band: a message asking for your words is a no; the words stay offline. */
export function NeverAskArt(p: P) {
  const dots: ReactNode[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    dots.push(<rect key={`${r}${c}`} x={262 + c * 24} y={52 + r * 17} width="19" height="9" rx="2" fill="#1b2a22" stroke="#7d9283" strokeWidth="1" />);
  }
  return (
    <svg viewBox="0 0 440 230" role="img" aria-label="A message asking for your recovery words is crossed out. Your 25 words stay on paper, offline and private." {...p}>
      <path d="M16 30h172a8 8 0 018 8v62a8 8 0 01-8 8H70l-26 20v-20H16a8 8 0 01-8-8V38a8 8 0 018-8z" fill="#1b2a22" stroke={CLAY_DIM} strokeWidth="2" strokeLinejoin="round" />
      <text x="102" y="64" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="16" fill="#f6f5ec">&ldquo;Send us your</text>
      <text x="102" y="86" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="16" fill="#f6f5ec">recovery words&rdquo;</text>
      <circle cx="102" cy="76" r="62" fill="none" stroke={CLAY_DIM} strokeWidth="3" opacity=".9" />
      <path d="M58 120L146 32" stroke={CLAY_DIM} strokeWidth="3" strokeLinecap="round" />
      <text x="102" y="176" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="16" fill={CLAY_DIM}>Never. From anyone.</text>

      <rect x="244" y="22" width="180" height="128" rx="6" fill="#22342a" stroke="#7d9283" strokeWidth="1.6" />
      <text x="334" y="42" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill="#b7c4b8">your 25 words, on paper</text>
      {dots}
      <rect x="318" y="170" width="32" height="26" rx="4" fill="#22342a" stroke={CLAY_DIM} strokeWidth="2" />
      <path d="M325 170v-8a9 9 0 0118 0v8" fill="none" stroke={CLAY_DIM} strokeWidth="2" />
      <text x="334" y="216" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="13" fill="#b7c4b8">offline and private</text>
    </svg>
  );
}

/** Sync trouble lives in the connection, not in your money. */
export function PipeArt(p: P) {
  return (
    <svg viewBox="0 0 440 200" role="img" aria-label="Your wallet connects to a Monero node, which reads the Monero network where your money is recorded. Sync trouble is usually the connection to the node, not your money." {...p}>
      <rect x="8" y="40" width="112" height="78" rx="8" fill={PAPER} stroke={FOREST} strokeWidth="2" />
      <rect x="30" y="56" width="68" height="40" rx="4" fill={TINT} stroke={FOREST} strokeWidth="1.4" />
      <path d="M40 74h28" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
      <text x="64" y="138" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>Your wallet</text>

      <rect x="164" y="40" width="112" height="78" rx="8" fill={PAPER} stroke={FOREST} strokeWidth="2" />
      <circle cx="220" cy="79" r="20" fill="none" stroke={FOREST} strokeWidth="1.6" />
      <path d="M200 79h40M220 59c-9 10-9 30 0 40M220 59c9 10 9 30 0 40" fill="none" stroke={FOREST} strokeWidth="1.2" />
      <text x="220" y="138" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>A Monero node</text>

      <rect x="320" y="40" width="112" height="78" rx="8" fill={PAPER} stroke={FOREST} strokeWidth="2" />
      <MoneroSymbol size={40} x={356} y={52} variant="color" />
      <text x="376" y="110" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="12" fill={MUTED}>your money, safe</text>
      <text x="376" y="138" textAnchor="middle" fontFamily={F} fontWeight="600" fontSize="14" fill={FOREST}>The network</text>

      <path d="M124 79h36" stroke={CLAY} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
      <path d="M133 70l7 9-7 9" fill="none" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M280 79h36" stroke={FOREST} strokeWidth="2" strokeLinecap="round" />
      <path d="M308 71l8 8-8 8" fill="none" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M142 156v-22" stroke={CLAY} strokeWidth="1.6" strokeLinecap="round" />
      <text x="142" y="176" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="14" fill={CLAY}>trouble is usually here</text>
      <text x="142" y="194" textAnchor="middle" fontFamily={F} fontStyle="italic" fontSize="14" fill={CLAY}>(the connection)</text>
    </svg>
  );
}
