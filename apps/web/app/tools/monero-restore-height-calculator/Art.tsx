/* Figure for the restore height calculator page: the two block-time eras. Not to scale. */
const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SERIF = "var(--font-display)";

const LABEL = "Timeline of Monero block times. From April 2014 to March 2016 (block 1,009,827) a block arrived about every 60 seconds, roughly 1,440 a day. After that a block arrives about every 120 seconds, roughly 720 a day. The diagram is not to scale.";

function ticks(x0: number, x1: number, step: number, y0: number, y1: number, color: string) {
  const out = [];
  for (let x = x0; x <= x1; x += step) out.push(<line key={x} x1={x} x2={x} y1={y0} y2={y1} stroke={color} strokeWidth="1.5" />);
  return out;
}

/** Wide version (viewBox about 640 wide). */
export function BlockTimeWide() {
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label={LABEL} style={{ width: "100%", height: "auto" }}>
      <rect x="1" y="1" width="638" height="228" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />
      <text x="24" y="34" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={INK}>How fast blocks arrived</text>

      <rect x="24" y="52" width="196" height="44" fill={CLAY} />
      <text x="122" y="80" textAnchor="middle" fontFamily={SERIF} fontWeight="600" fontSize="15" fill="#fff">60 second blocks</text>
      <rect x="220" y="52" width="396" height="44" fill={FOREST} />
      <text x="418" y="80" textAnchor="middle" fontFamily={SERIF} fontWeight="600" fontSize="15" fill="#fff">120 second blocks</text>

      {ticks(28, 216, 8, 106, 128, CLAY)}
      {ticks(224, 612, 16, 106, 128, FOREST)}

      <text x="24" y="156" fontSize="12" fontWeight="700" fill={INK}>April 2014</text>
      <text x="24" y="173" fontSize="12" fill={MUTED}>Block 0</text>
      <text x="220" y="156" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>March 2016</text>
      <text x="220" y="173" textAnchor="middle" fontSize="12" fill={MUTED}>Block 1,009,827</text>
      <text x="616" y="156" textAnchor="end" fontSize="12" fontWeight="700" fill={INK}>Today</text>
      <text x="616" y="173" textAnchor="end" fontSize="12" fill={MUTED}>720 a day</text>

      <rect x="24" y="190" width="592" height="26" rx="2" fill={PAPER} />
      <text x="36" y="208" fontSize="12" fill={INK}>Not to scale. Early blocks came twice as fast, so a date maps to twice as many blocks.</text>
    </svg>
  );
}

/** Phone version (viewBox 360 wide, stacked). */
export function BlockTimeNarrow() {
  return (
    <svg viewBox="0 0 360 300" role="img" aria-label={LABEL} style={{ width: "100%", height: "auto" }}>
      <rect x="2" y="2" width="356" height="296" rx="4" fill={CARD} stroke={INK} strokeWidth="1.2" />

      <rect x="14" y="14" width="332" height="108" fill={PAPER} stroke={CLAY} strokeWidth="1.5" />
      <text x="26" y="40" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={CLAY}>APRIL 2014 TO MARCH 2016</text>
      <text x="26" y="66" fontFamily={SERIF} fontWeight="600" fontSize="19" fill={INK}>60 second blocks</text>
      <text x="26" y="86" fontSize="12" fill={MUTED}>About 1,440 blocks a day</text>
      {ticks(26, 334, 7, 98, 112, CLAY)}

      <text x="180" y="146" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>Block 1,009,827, March 2016</text>
      <path d="M180 152 v18 m-6 -6 l6 6 l6 -6" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="14" y="178" width="332" height="86" fill={PAPER} stroke={FOREST} strokeWidth="1.5" />
      <text x="26" y="202" fontSize="11" fontWeight="700" letterSpacing="1.2" fill={FOREST}>MARCH 2016 TO TODAY</text>
      <text x="26" y="226" fontFamily={SERIF} fontWeight="600" fontSize="19" fill={INK}>120 second blocks</text>
      <text x="26" y="244" fontSize="12" fill={MUTED}>About 720 blocks a day</text>
      {ticks(26, 334, 14, 250, 258, FOREST)}

      <text x="180" y="286" textAnchor="middle" fontSize="12" fill={MUTED}>Not to scale</text>
    </svg>
  );
}
