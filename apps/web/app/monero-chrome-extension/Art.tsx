import { MoneroSymbol } from "@/components/art/MoneroSymbol";

type P = React.SVGProps<SVGSVGElement>;
const D = { fontFamily: "var(--font-display)" } as const;
const S = { fontFamily: "var(--font-sans)" } as const;

/** Hero: a generic browser window running the wallet, with a dashed slot where a toolbar icon would go. */
export function HeroBrowser(p: P) {
  return (
    <svg viewBox="0 0 560 410" role="img" aria-labelledby="exHeroT exHeroD" {...p}>
      <title id="exHeroT">The MonkStash wallet running in a browser tab</title>
      <desc id="exHeroD">A generic browser window shows the wallet with a balance, an address, a QR code and Send and Receive buttons. In the toolbar, a dashed outline marks the spot where a future extension icon would go, labelled planned.</desc>
      <rect width="560" height="410" fill="#fbfbf7" />
      <g stroke="#e3e4da" strokeWidth="1"><path d="M0 60H560M0 120H560M0 180H560M0 240H560M0 300H560M0 360H560" /></g>
      <rect x="20" y="20" width="520" height="372" rx="10" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2.2" />
      <path d="M20 30a10 10 0 0110-10h500a10 10 0 0110 10v34H20z" fill="#edeee6" stroke="#1f4733" strokeWidth="2.2" />
      <g fill="none" stroke="#1f4733" strokeWidth="1.4"><circle cx="40" cy="42" r="5" /><circle cx="58" cy="42" r="5" /><circle cx="76" cy="42" r="5" /></g>
      <path d="M98 64V40q0-6 6-6h132q6 0 6 6v24z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6" />
      <text x="116" y="54" style={S} fontSize="11" fontWeight="600" fill="#1b2a22">Wallet</text>
      <path d="M20 104H540" stroke="#1f4733" strokeWidth="1.6" />
      <rect x="20" y="64" width="520" height="40" fill="#fbfbf7" />
      <g fill="none" stroke="#1f4733" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M44 84h-14M36 78l-6 6 6 6" /><path d="M64 78l6 6-6 6M70 84H56" opacity=".45" /></g>
      <rect x="90" y="72" width="290" height="24" rx="12" fill="#edeee6" stroke="#c7c8bb" />
      <g fill="none" stroke="#1f4733" strokeWidth="1.6"><rect x="104" y="83" width="9" height="7" rx="1.5" /><path d="M106 83v-3a2.5 2.5 0 015 0v3" /></g>
      <path d="M124 84h120" stroke="#1f4733" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <path d="M362 78l2.6 5.4 5.8.8-4.2 4 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4 5.8-.8z" fill="#b4532a" stroke="#b4532a" strokeWidth="1" strokeLinejoin="round" />
      <g fill="none" stroke="#c7c8bb" strokeWidth="1.6"><circle cx="410" cy="84" r="9" /><circle cx="440" cy="84" r="9" /></g>
      <rect x="470" y="70" width="28" height="28" rx="6" fill="none" stroke="#b4532a" strokeWidth="1.8" strokeDasharray="4 4" />
      <g fill="#1f4733" opacity=".6"><circle cx="522" cy="76" r="1.8" /><circle cx="522" cy="84" r="1.8" /><circle cx="522" cy="92" r="1.8" /></g>
      <path d="M484 124v-16m-5 5l5-6 5 6" fill="none" stroke="#b4532a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="484" y="142" style={D} fontStyle="italic" fontSize="15" fill="#b4532a" textAnchor="middle">planned</text>
      <rect x="64" y="130" width="340" height="236" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <text x="86" y="158" style={S} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#b4532a">BALANCE</text>
      <path d="M86 182h108" stroke="#1f4733" strokeWidth="11" strokeLinecap="round" opacity=".55" />
      <MoneroSymbol x={344} y={142} size={34} variant="color" />
      <path d="M86 204H382" stroke="#e3e4da" />
      <text x="86" y="226" style={S} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#b4532a">YOUR ADDRESS</text>
      <g stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round" opacity=".5"><path d="M86 244h150M86 258h120M86 272h138" /></g>
      <rect x="296" y="218" width="86" height="86" rx="4" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.4" />
      <g fill="#1f4733"><rect x="304" y="226" width="22" height="22" /><rect x="352" y="226" width="22" height="22" /><rect x="304" y="274" width="22" height="22" /><rect x="334" y="256" width="8" height="8" /><rect x="346" y="272" width="12" height="8" /><rect x="334" y="284" width="8" height="12" /><rect x="360" y="284" width="14" height="12" /></g>
      <g fill="#fbfbf7"><rect x="309" y="231" width="12" height="12" /><rect x="357" y="231" width="12" height="12" /><rect x="309" y="279" width="12" height="12" /></g>
      <rect x="86" y="318" width="88" height="32" rx="6" fill="#1f4733" />
      <text x="130" y="338" style={S} fontSize="12" fontWeight="600" fill="#fbfbf7" textAnchor="middle">Send</text>
      <rect x="186" y="318" width="96" height="32" rx="6" fill="none" stroke="#1f4733" strokeWidth="1.6" />
      <text x="234" y="338" style={S} fontSize="12" fontWeight="600" fill="#1f4733" textAnchor="middle">Receive</text>
      <text x="470" y="262" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">just a tab,</text>
      <text x="470" y="282" style={D} fontStyle="italic" fontSize="15" fill="#1f4733" textAnchor="middle">no install</text>
      <path d="M418 268h-4" stroke="#1f4733" strokeWidth="1.2" />
    </svg>
  );
}

/** Risk icon 1: an extension asking for broad permissions. */
export function RiskPermissions(p: P) {
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label="A permission list with every toggle switched on" {...p}>
      <rect x="14" y="8" width="92" height="74" rx="6" fill="#22342a" stroke="#e9a07a" strokeWidth="1.6" />
      <path d="M26 22h40" stroke="#f6f5ec" strokeWidth="2.4" strokeLinecap="round" />
      <g stroke="#9fb0a2" strokeWidth="2" strokeLinecap="round"><path d="M26 38h34M26 52h46M26 66h28" /></g>
      <g fill="#e9a07a"><rect x="80" y="33" width="16" height="9" rx="4.5" /><rect x="80" y="47" width="16" height="9" rx="4.5" /><rect x="80" y="61" width="16" height="9" rx="4.5" /></g>
      <g fill="#22342a"><circle cx="91.5" cy="37.5" r="3" /><circle cx="91.5" cy="51.5" r="3" /><circle cx="91.5" cy="65.5" r="3" /></g>
    </svg>
  );
}

/** Risk icon 2: a copy next to the real thing. */
export function RiskFake(p: P) {
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label="A real listing next to an identical dashed copy" {...p}>
      <rect x="10" y="16" width="44" height="58" rx="6" fill="#22342a" stroke="#f6f5ec" strokeWidth="1.6" />
      <circle cx="32" cy="38" r="9" fill="none" stroke="#f6f5ec" strokeWidth="1.6" />
      <path d="M20 58h24M24 66h16" stroke="#9fb0a2" strokeWidth="2" strokeLinecap="round" />
      <rect x="66" y="16" width="44" height="58" rx="6" fill="#22342a" stroke="#e9a07a" strokeWidth="1.6" strokeDasharray="4 3" />
      <circle cx="88" cy="38" r="9" fill="none" stroke="#e9a07a" strokeWidth="1.6" />
      <path d="M76 58h24M80 66h16" stroke="#e9a07a" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <text x="60" y="48" style={D} fontStyle="italic" fontSize="14" fill="#e9a07a" textAnchor="middle">=</text>
    </svg>
  );
}

/** Risk icon 3: an update that changes what a tool does. */
export function RiskUpdate(p: P) {
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label="A tool with an arrow of updates turning it into something different" {...p}>
      <rect x="10" y="26" width="38" height="38" rx="6" fill="#22342a" stroke="#f6f5ec" strokeWidth="1.6" />
      <path d="M20 40h18M20 50h12" stroke="#9fb0a2" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 45h14m-5-5l5 5-5 5" fill="none" stroke="#e9a07a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="74" y="26" width="38" height="38" rx="6" fill="#22342a" stroke="#e9a07a" strokeWidth="1.6" />
      <path d="M84 40h18M84 50h18" stroke="#e9a07a" strokeWidth="2" strokeLinecap="round" />
      <path d="M93 18l3 6h-6z" fill="#e9a07a" />
      <text x="29" y="80" style={D} fontStyle="italic" fontSize="11" fill="#9fb0a2" textAnchor="middle">v1</text>
      <text x="93" y="80" style={D} fontStyle="italic" fontSize="11" fill="#e9a07a" textAnchor="middle">v2</text>
    </svg>
  );
}

/** Risk icon 4: a pop-up asking for recovery words. */
export function RiskSeed(p: P) {
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label="A pop-up asking you to type your recovery words" {...p}>
      <rect x="14" y="10" width="92" height="70" rx="6" fill="#22342a" stroke="#f6f5ec" strokeWidth="1.6" />
      <path d="M14 26h92" stroke="#f6f5ec" strokeWidth="1.2" opacity=".6" />
      <g fill="#9fb0a2"><circle cx="24" cy="18" r="2.4" /><circle cx="33" cy="18" r="2.4" /></g>
      <path d="M26 40h46M26 50h34" stroke="#9fb0a2" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="58" width="68" height="14" rx="3" fill="none" stroke="#e9a07a" strokeWidth="1.4" strokeDasharray="3 3" />
      <text x="60" y="68.5" style={S} fontSize="6.5" fontWeight="600" letterSpacing="0.4" fill="#e9a07a" textAnchor="middle">TYPE 25 WORDS</text>
      <path d="M92 30l9 16H83z" fill="#22342a" stroke="#e9a07a" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M92 36v5" stroke="#e9a07a" strokeWidth="1.6" strokeLinecap="round" /><circle cx="92" cy="44" r=".9" fill="#e9a07a" />
    </svg>
  );
}

/** Step i: open the wallet in a tab. */
export function StepOpenTab(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="A browser tab opening the wallet page" {...p}>
      <rect x="24" y="18" width="252" height="154" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <path d="M24 26a8 8 0 018-8h236a8 8 0 018 8v26H24z" fill="#edeee6" stroke="#1f4733" strokeWidth="2" />
      <path d="M40 52V32q0-5 5-5h70q5 0 5 5v20z" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6" />
      <text x="80" y="43" style={S} fontSize="9" fontWeight="600" fill="#1b2a22" textAnchor="middle">Wallet</text>
      <rect x="40" y="62" width="182" height="18" rx="9" fill="#edeee6" stroke="#c7c8bb" />
      <path d="M54 71h70" stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round" opacity=".5" />
      <rect x="64" y="96" width="172" height="60" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6" />
      <path d="M78 114h60M78 128h90" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round" />
      <rect x="182" y="106" width="42" height="18" rx="4" fill="#1f4733" />
      <text x="203" y="119" style={S} fontSize="8" fontWeight="600" fill="#fbfbf7" textAnchor="middle">Open</text>
      <text x="266" y="44" style={D} fontStyle="italic" fontSize="13" fill="#b4532a" textAnchor="end">no install</text>
    </svg>
  );
}

/** Step ii: create or restore, then protect with a password. */
export function StepSetUp(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="A grid of recovery words beside a password lock" {...p}>
      <rect x="20" y="20" width="156" height="150" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <text x="34" y="40" style={S} fontSize="8" fontWeight="600" letterSpacing="1.3" fill="#b4532a">25 WORDS</text>
      <g stroke="#1f4733" strokeWidth="2.4" strokeLinecap="round" opacity=".55">
        <path d="M34 58h22M64 58h22M94 58h22M124 58h24M34 76h22M64 76h22M94 76h22M124 76h24M34 94h22M64 94h22M94 94h22M124 94h24M34 112h22M64 112h22M94 112h22M124 112h24M34 130h22M64 130h22" />
      </g>
      <path d="M34 150h112" stroke="#c7c8bb" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d="M186 96h22m-6-5l6 5-6 5" fill="none" stroke="#b4532a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="218" y="82" width="62" height="54" rx="8" fill="#1f4733" />
      <path d="M232 82V70a17 17 0 0134 0v12" fill="none" stroke="#1f4733" strokeWidth="5" />
      <circle cx="249" cy="104" r="5" fill="#edeee6" />
      <path d="M249 108v10" stroke="#edeee6" strokeWidth="3" strokeLinecap="round" />
      <text x="249" y="154" style={D} fontStyle="italic" fontSize="13" fill="#1f4733" textAnchor="middle">your password</text>
    </svg>
  );
}

/** Step iii: bookmark the wallet address. */
export function StepBookmark(p: P) {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="A browser address bar with a starred bookmark and a bookmarks bar entry" {...p}>
      <rect x="20" y="20" width="260" height="150" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <path d="M20 28a8 8 0 018-8h244a8 8 0 018 8v30H20z" fill="#edeee6" stroke="#1f4733" strokeWidth="2" />
      <rect x="36" y="32" width="186" height="20" rx="10" fill="#fbfbf7" stroke="#c7c8bb" />
      <path d="M50 42h74" stroke="#1f4733" strokeWidth="2.6" strokeLinecap="round" opacity=".5" />
      <path d="M208 36l2.6 5.2 5.6.8-4 3.9.9 5.6-5.1-2.7-5.1 2.7.9-5.6-4-3.9 5.6-.8z" fill="#b4532a" stroke="#b4532a" strokeLinejoin="round" />
      <rect x="20" y="58" width="260" height="26" fill="#fbfbf7" stroke="#1f4733" strokeWidth="0" />
      <path d="M20 84H280" stroke="#1f4733" strokeWidth="1.4" />
      <rect x="34" y="63" width="82" height="16" rx="4" fill="none" stroke="#b4532a" strokeWidth="1.5" />
      <path d="M43 66v10l4-3 4 3V66z" fill="#b4532a" />
      <text x="58" y="75" style={S} fontSize="9" fontWeight="600" fill="#1b2a22">Wallet</text>
      <g stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round"><path d="M132 71h34M178 71h26" /></g>
      <path d="M75 82v24" stroke="#b4532a" strokeWidth="1.6" strokeDasharray="3 3" />
      <rect x="50" y="108" width="200" height="46" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6" />
      <path d="M66 126h72M66 140h110" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round" />
      <text x="240" y="132" style={D} fontStyle="italic" fontSize="12" fill="#b4532a" textAnchor="end">one tap</text>
    </svg>
  );
}

/** Future: toolbar popup on top of the same wallet core. On the dark band. */
export function FutureStack(p: P) {
  return (
    <svg viewBox="0 0 560 330" role="img" aria-labelledby="exFutT exFutD" {...p}>
      <title id="exFutT">How a future MonkStash extension would be built</title>
      <desc id="exFutD">A planned toolbar popup sits on top of the same wallet core as the web wallet. Below it, the keys stay encrypted on your own device.</desc>
      <rect width="560" height="330" fill="#1b2a22" />
      <g stroke="#2d4437" strokeWidth="1"><path d="M0 55H560M0 110H560M0 165H560M0 220H560M0 275H560" /></g>
      <rect x="30" y="22" width="500" height="34" rx="6" fill="#22342a" stroke="#38503f" />
      <g fill="none" stroke="#9fb0a2" strokeWidth="1.4"><circle cx="440" cy="39" r="8" /><circle cx="468" cy="39" r="8" /></g>
      <rect x="486" y="27" width="24" height="24" rx="5" fill="none" stroke="#e9a07a" strokeWidth="1.6" strokeDasharray="4 3" />
      <text x="50" y="43" style={D} fontStyle="italic" fontSize="13" fill="#9fb0a2">browser toolbar</text>
      <path d="M498 60v14" stroke="#e9a07a" strokeWidth="1.5" />
      <rect x="318" y="74" width="196" height="64" rx="8" fill="#22342a" stroke="#e9a07a" strokeWidth="1.8" strokeDasharray="5 4" />
      <text x="334" y="96" style={S} fontSize="9" fontWeight="600" letterSpacing="1.4" fill="#e9a07a">POPUP, PLANNED</text>
      <g stroke="#9fb0a2" strokeWidth="2.4" strokeLinecap="round"><path d="M334 112h96M334 126h66" /></g>
      <rect x="60" y="164" width="440" height="58" rx="8" fill="#22342a" stroke="#f6f5ec" strokeWidth="1.8" />
      <text x="280" y="188" style={D} fontSize="19" fontWeight="500" fill="#f6f5ec" textAnchor="middle">The same wallet core as the web wallet</text>
      <text x="280" y="208" style={S} fontSize="11" fill="#c3cdc2" textAnchor="middle">monero-ts, running in your browser</text>
      <path d="M498 138v20m-5-5l5 6 5-6" fill="none" stroke="#e9a07a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M280 222v26m-5-5l5 6 5-6" fill="none" stroke="#e9a07a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="150" y="256" width="260" height="50" rx="8" fill="#22342a" stroke="#e9a07a" strokeWidth="1.6" />
      <g fill="none" stroke="#e9a07a" strokeWidth="1.8"><rect x="170" y="274" width="18" height="14" rx="3" /><path d="M174 274v-4a5 5 0 0110 0v4" /></g>
      <text x="204" y="277" style={S} fontSize="9" fontWeight="600" letterSpacing="1.3" fill="#e9a07a">YOUR DEVICE</text>
      <text x="204" y="294" style={D} fontStyle="italic" fontSize="14" fill="#f6f5ec">keys stay encrypted here</text>
    </svg>
  );
}

/** Honest-state figure: an empty store shelf. */
export function EmptyShelf(p: P) {
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A store shelf with one faded old item and an empty dashed slot" {...p}>
      <rect x="16" y="16" width="268" height="168" rx="8" fill="#fbfbf7" stroke="#1f4733" strokeWidth="2" />
      <path d="M16 46H284" stroke="#1f4733" strokeWidth="1.4" />
      <rect x="30" y="26" width="120" height="12" rx="6" fill="#edeee6" stroke="#c7c8bb" />
      <path d="M40 32h50" stroke="#1f4733" strokeWidth="2.2" strokeLinecap="round" opacity=".5" />
      <g opacity=".5"><rect x="34" y="66" width="70" height="86" rx="6" fill="#fbfbf7" stroke="#1f4733" strokeWidth="1.6" /><circle cx="69" cy="92" r="11" fill="none" stroke="#1f4733" strokeWidth="1.6" /><path d="M46 124h46M52 136h34" stroke="#c7c8bb" strokeWidth="3" strokeLinecap="round" /></g>
      <rect x="120" y="66" width="70" height="86" rx="6" fill="none" stroke="#b4532a" strokeWidth="1.6" strokeDasharray="5 4" />
      <rect x="206" y="66" width="62" height="86" rx="6" fill="none" stroke="#b4532a" strokeWidth="1.6" strokeDasharray="5 4" />
      <text x="155" y="114" style={D} fontStyle="italic" fontSize="22" fill="#b4532a" textAnchor="middle">?</text>
      <text x="237" y="114" style={D} fontStyle="italic" fontSize="22" fill="#b4532a" textAnchor="middle">?</text>
      <text x="69" y="168" style={D} fontStyle="italic" fontSize="11" fill="#6c7a70" textAnchor="middle">old, needs CLI</text>
    </svg>
  );
}

export function ArrowIcon(p: P) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...p}>
      <path d="M3 9h11m-4-4.5L14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChkSymbols() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="exChk" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4.6 8.3l2.3 2.3 4.5-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="exNo" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
      </defs>
    </svg>
  );
}
