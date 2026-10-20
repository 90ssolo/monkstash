const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

/** What a block explorer shows for a Monero transaction, and what it cannot. */
export function ExplorerSeesFigure() {
  const shows = ["Transaction ID", "Block height", "Confirmations", "Fee", "Size and time", "Ring members (decoys)"];
  const hides = ["Sender address", "Receiver address", "Amount sent"];
  return (
    <svg viewBox="0 0 640 260" role="img" aria-label="Two lists. A Monero block explorer shows the transaction ID, block height, confirmations, fee, size and time, and the ring members. It cannot show the sender address, the receiver address or the amount sent." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="10" width="300" height="230" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="30" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>An explorer can show</text>
      {shows.map((s, i) => (
        <g key={s}>
          <path d={`M32 ${66 + i * 28} l5 5 l9 -11`} stroke={FOREST} strokeWidth="1.6" fill="none" />
          <text x="60" y={70 + i * 28} fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>{s}</text>
        </g>
      ))}
      <rect x="330" y="10" width="300" height="230" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="350" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>It cannot show</text>
      {hides.map((s, i) => (
        <g key={s}>
          <path d={`M352 ${60 + i * 28} l12 12 m0 -12 l-12 12`} stroke={CLAY} strokeWidth="1.6" fill="none" />
          <text x="380" y={70 + i * 28} fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>{s}</text>
        </g>
      ))}
      <text x="350" y="190" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>Only the people involved can</text>
      <text x="350" y="206" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>prove what a payment was.</text>
      <text x="320" y="256" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>An explorer confirms that a transaction happened. It does not say who or how much.</text>
    </svg>
  );
}

/** How a payment proof moves from the sender to a verifier. */
export function PaymentProofFigure() {
  return (
    <svg viewBox="0 0 640 220" role="img" aria-label="The sender gives a verifier three things: the transaction ID, the receiving address, and the transaction key. The verifier checks them in a wallet and sees the amount sent to that address and how many confirmations it has." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="60" width="120" height="70" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="70" y="92" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Sender</text>
      <text x="70" y="112" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>made the payment</text>

      <g fill={PAPER} stroke={CLAY} strokeWidth="1.3">
        <rect x="200" y="30" width="180" height="32" rx="3" />
        <rect x="200" y="94" width="180" height="32" rx="3" />
        <rect x="200" y="158" width="180" height="32" rx="3" />
      </g>
      <text x="290" y="51" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>transaction ID</text>
      <text x="290" y="115" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>receiving address</text>
      <text x="290" y="179" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>transaction key</text>

      <path d="M130 95 H196" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M188 89 L196 95 L188 101" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M380 110 H446" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <path d="M438 104 L446 110 L438 116" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <rect x="450" y="60" width="180" height="100" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="540" y="92" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Verifier</text>
      <text x="540" y="114" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>checks in a wallet and sees</text>
      <text x="540" y="132" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>the amount sent to that address</text>
    </svg>
  );
}
