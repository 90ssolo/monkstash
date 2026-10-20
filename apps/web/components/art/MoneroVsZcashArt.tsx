import { MoneroSymbol } from "./MoneroSymbol";

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

/** Default privacy versus optional privacy: what an outsider sees on each chain. */
export function DefaultVsOptionalFigure() {
  return (
    <svg viewBox="0 0 640 270" role="img" aria-label="Two panels. On Monero, every transaction is private by default, so all transactions look alike to an outsider. On Zcash, a transaction is either transparent and public, or shielded and private, so an outsider can tell the two kinds apart." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="300" height="220" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <MoneroSymbol variant="color" size={26} x={24} y={22} />
      <text x="58" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Monero: private by default</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={30} y={64 + i * 30} width="260" height="22" rx="2" fill="none" stroke={FOREST} strokeWidth="1" />
          <rect x={38} y={71 + i * 30} width="70" height="8" fill={FOREST} opacity="0.22" />
          <rect x={120} y={71 + i * 30} width="90" height="8" fill={FOREST} opacity="0.22" />
          <rect x={222} y={71 + i * 30} width="58" height="8" fill={FOREST} opacity="0.22" />
        </g>
      ))}
      <text x="160" y="222" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>every row is hidden the same way</text>

      <rect x="330" y="10" width="300" height="220" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="350" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>Zcash: private by choice</text>
      {[0, 1, 2, 3, 4].map((i) => {
        const open = i === 0 || i === 2 || i === 3;
        return (
          <g key={i}>
            <rect x={350} y={64 + i * 30} width="260" height="22" rx="2" fill="none" stroke={CLAY} strokeWidth="1" />
            {open ? (
              <>
                <rect x={358} y={71 + i * 30} width="70" height="8" fill="none" stroke={CLAY} strokeWidth="0.8" />
                <rect x={440} y={71 + i * 30} width="90" height="8" fill="none" stroke={CLAY} strokeWidth="0.8" />
                <rect x={542} y={71 + i * 30} width="58" height="8" fill="none" stroke={CLAY} strokeWidth="0.8" />
              </>
            ) : (
              <>
                <rect x={358} y={71 + i * 30} width="70" height="8" fill={CLAY} opacity="0.3" />
                <rect x={440} y={71 + i * 30} width="90" height="8" fill={CLAY} opacity="0.3" />
                <rect x={542} y={71 + i * 30} width="58" height="8" fill={CLAY} opacity="0.3" />
              </>
            )}
          </g>
        );
      })}
      <text x="480" y="222" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>open rows are transparent, filled rows are shielded</text>

      <text x="320" y="258" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>The crowd you hide in matters. Mixed rows tell an observer which rows to look at.</text>
    </svg>
  );
}

/** Three different ways to hide a payment, side by side. */
export function HowTheyHideFigure() {
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Two columns. Monero hides the sender among decoy members of a ring, uses a one-time stealth address for the receiver, and hides the amount. Zcash shielded transactions use a zero-knowledge proof that shows the transaction is valid without revealing sender, receiver or amount." style={{ width: "100%", height: "auto" }}>
      <text x="165" y="26" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Monero: hide in a crowd</text>
      <g transform="translate(40 50)">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const real = i === 2;
          return <circle key={i} cx={80 + Math.cos(a) * 52} cy={70 + Math.sin(a) * 52} r="11" fill={PAPER} stroke={real ? CLAY : FOREST} strokeWidth={real ? 1.8 : 1.1} />;
        })}
        <text x="80" y="75" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>ring</text>
        <text x="190" y="26" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>one is real,</text>
        <text x="190" y="42" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>nobody can say which</text>
        <text x="190" y="78" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>stealth address:</text>
        <text x="190" y="94" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>one-time receiver</text>
        <text x="190" y="130" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>RingCT: amount hidden</text>
      </g>

      <path d="M330 20 V225" stroke={FOREST} strokeWidth="0.8" strokeDasharray="4 3" />

      <text x="485" y="26" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>Zcash shielded: prove it, show nothing</text>
      <g transform="translate(350 54)">
        <rect x="0" y="30" width="86" height="60" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
        <text x="43" y="56" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>private</text>
        <text x="43" y="72" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>details</text>
        <path d="M90 60 H150" stroke={CLAY} strokeWidth="1.4" />
        <path d="M142 54 L150 60 L142 66" stroke={CLAY} strokeWidth="1.4" fill="none" />
        <rect x="154" y="30" width="110" height="60" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
        <text x="209" y="56" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>zero-knowledge</text>
        <text x="209" y="72" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>proof (zk-SNARK)</text>
        <text x="132" y="122" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>nodes check the proof,</text>
        <text x="132" y="138" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>never the details</text>
      </g>
      <text x="320" y="238" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>Two different answers to the same question: how can a public chain stay private?</text>
    </svg>
  );
}
