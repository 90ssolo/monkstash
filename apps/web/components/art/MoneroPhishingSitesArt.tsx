const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

function Arrow({ x1, y, x2, color }: { x1: number; y: number; x2: number; color: string }) {
  return (
    <g>
      <path d={`M${x1} ${y} H${x2 - 2}`} stroke={color} strokeWidth="1.4" fill="none" />
      <path d={`M${x2 - 8} ${y - 6} L${x2} ${y} L${x2 - 8} ${y + 6}`} stroke={color} strokeWidth="1.4" fill="none" />
    </g>
  );
}

/** A real address bar next to a look-alike. Uses a made-up example domain on purpose. */
export function AddressBarFigure() {
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Two browser address bars. The first reads wallet.example.com, the correct address. The second reads wallet-example.com.co, a look-alike where the real name has been bent or extended." style={{ width: "100%", height: "auto" }}>
      <text x="20" y="26" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>The address you expected</text>
      <rect x="20" y="40" width="600" height="46" rx="23" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <path d="M48 54 v-4 a6 6 0 0 1 12 0 v4 M44 54 h20 v14 h-20 Z" fill="none" stroke={FOREST} strokeWidth="1.2" />
      <text x="82" y="69" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="17" fill={FOREST}>https://wallet.example.com</text>

      <text x="20" y="130" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>A look-alike (illustrative, not a real site)</text>
      <rect x="20" y="144" width="600" height="46" rx="23" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <path d="M48 158 v-4 a6 6 0 0 1 12 0 v4 M44 158 h20 v14 h-20 Z" fill="none" stroke={CLAY} strokeWidth="1.2" />
      <text x="82" y="173" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="17" fill={CLAY}>https://wallet-example.com.co</text>
      <path d="M290 180 q30 12 60 0" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <text x="320" y="214" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>A padlock only means the connection is encrypted. It does not mean the site is honest.</text>
      <text x="320" y="236" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>Read the name, right to left, up to the first single slash.</text>
    </svg>
  );
}

/** The seed never leaves the wallet screen: where it may be shown, and where it must never go. */
export function SeedStaysFigure() {
  const blocked = [
    { y: 28, t: "A website form" },
    { y: 96, t: "A chat or DM" },
    { y: 164, t: "An email or a photo" },
  ];
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Your recovery words stay on the wallet's own screen on your device. Arrows from the words to a website form, a chat message, and an email are crossed out." style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="20" width="190" height="190" rx="6" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="115" y="106" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Your wallet screen</text>
      <text x="115" y="128" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>on your own device</text>
      <text x="115" y="156" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="12" fill={CLAY}>word1 word2 word3 ...</text>

      {blocked.map((b) => (
        <g key={b.y}>
          <Arrow x1={210} y={b.y + 22} x2={400} color={CLAY} />
          <rect x="410" y={b.y} width="210" height="44" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
          <text x="515" y={b.y + 27} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>{b.t}</text>
          <line x1="296" y1={b.y + 10} x2="316" y2={b.y + 34} stroke={CLAY} strokeWidth="2.2" />
          <line x1="316" y1={b.y + 10} x2="296" y2={b.y + 34} stroke={CLAY} strokeWidth="2.2" />
        </g>
      ))}
      <text x="320" y="238" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>The words are for you, on paper, and for restoring inside a wallet you trust. Nowhere else.</text>
    </svg>
  );
}

/** The if-you-were-phished emergency flow. */
export function EmergencyFlowFigure() {
  const steps = [
    { t1: "1. Stop", t2: "Do not enter", t3: "anything else" },
    { t1: "2. New wallet", t2: "Fresh words,", t3: "clean device" },
    { t1: "3. Send it all", t2: "Move every coin", t3: "to the new address" },
    { t1: "4. Retire", t2: "Never use the", t3: "old words again" },
  ];
  return (
    <svg viewBox="0 0 640 170" role="img" aria-label="Four steps if you entered your words on a fake site: stop, create a new wallet with fresh words, move all funds to it, and retire the old words." style={{ width: "100%", height: "auto" }}>
      {steps.map((s, i) => {
        const x = 10 + i * 160;
        return (
          <g key={s.t1}>
            <rect x={x} y="30" width="138" height="104" rx="4" fill={PAPER} stroke={i === 2 ? CLAY : FOREST} strokeWidth="1.2" />
            <text x={x + 69} y="62" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={i === 2 ? CLAY : FOREST}>{s.t1}</text>
            <text x={x + 69} y="92" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>{s.t2}</text>
            <text x={x + 69} y="110" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>{s.t3}</text>
            {i < 3 ? <Arrow x1={x + 140} y={82} x2={x + 158} color={FOREST} /> : null}
          </g>
        );
      })}
      <text x="320" y="158" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={CLAY}>Speed matters. A leaked seed cannot be made safe again.</text>
    </svg>
  );
}
