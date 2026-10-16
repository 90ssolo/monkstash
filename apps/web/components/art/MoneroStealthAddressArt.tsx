/** Figures for the "Monero stealth address" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Arrow({ x1, y1, x2, y2, color = FOREST, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean }) {
  return <path d={`M ${x1} ${y1} L ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={dashed ? "4 3" : undefined} />;
}

/** One public address in, three unrelated-looking one-time outputs on chain, only the owner can recognise them. */
export function OneAddressManyOutputsArt() {
  const payers = ["Payer A", "Payer B", "Payer C"];
  const outs = ["output 9f3a...", "output 41c8...", "output e07d..."];
  return (
    <svg viewBox="0 0 720 320" width="100%" role="img" aria-label="One public address receives payments from three payers. Each payer's wallet creates a different one-time address on the blockchain. To outsiders the three outputs look unrelated. Only the owner's wallet, using the private view key, recognises all three as theirs.">
      <rect x="24" y="110" width="150" height="70" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.5" />
      <text x="99" y="138" textAnchor="middle" fontSize="16" fill={FOREST} style={LABEL}>Your public</text>
      <text x="99" y="158" textAnchor="middle" fontSize="16" fill={FOREST} style={LABEL}>address</text>
      <text x="99" y="98" textAnchor="middle" fontSize="12" fill={FOREST} opacity="0.7" style={LABEL}>shared with everyone</text>

      {payers.map((p, i) => {
        const y = 40 + i * 86;
        return (
          <g key={p}>
            <rect x="236" y={y} width="104" height="46" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
            <text x="288" y={y + 28} textAnchor="middle" fontSize="15" fill={FOREST} style={LABEL}>{p}</text>
            <Arrow x1={174} y1={145} x2={236} y2={y + 23} dashed />
            <Arrow x1={340} y1={y + 23} x2={440} y2={y + 23} color={CLAY} />
            <rect x="440" y={y} width="160" height="46" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="1.5" />
            <text x="520" y={y + 28} textAnchor="middle" fontSize="14" fill={CLAY} style={LABEL}>{outs[i]}</text>
            <text x="390" y={y + 16} textAnchor="middle" fontSize="11" fill={CLAY} style={LABEL}>fresh one-time address</text>
          </g>
        );
      })}

      <path d="M 612 40 C 640 40 640 252 612 252" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <text x="632" y="148" fontSize="13" fill={FOREST} style={LABEL}>on the</text>
      <text x="632" y="166" fontSize="13" fill={FOREST} style={LABEL}>chain</text>

      <text x="360" y="292" textAnchor="middle" fontSize="14" fill={FOREST} style={LABEL}>To an outsider the three outputs look unrelated. Your wallet, using your view key, recognises all three.</text>
      <text x="360" y="310" textAnchor="middle" fontSize="12" fill={FOREST} opacity="0.7" style={LABEL}>Labels are illustrative. Real one-time addresses are long random-looking keys.</text>
    </svg>
  );
}

/** Where the sender gets the ingredients and where each ingredient comes from. */
export function StealthRecipeArt() {
  const steps = [
    { n: "1", t: "Sender takes your public address", s: "It holds two public keys: spend and view." },
    { n: "2", t: "Sender adds fresh randomness", s: "A new secret, used for this payment only." },
    { n: "3", t: "One-time key is calculated", s: "Written on the chain as the payment's destination." },
    { n: "4", t: "Your wallet checks each output", s: "Your private view key spots the ones made for you." },
  ];
  return (
    <svg viewBox="0 0 720 220" width="100%" role="img" aria-label="Four steps. One: the sender takes your public address. Two: the sender adds fresh randomness. Three: a one-time key is calculated and written on the chain. Four: your wallet checks each output with your private view key and spots the ones made for you.">
      {steps.map((s, i) => {
        const x = 18 + i * 176;
        return (
          <g key={s.n}>
            <rect x={x} y="24" width="162" height="150" rx="4" fill={PAPER} stroke={i === 3 ? CLAY : FOREST} strokeWidth="1.4" />
            <circle cx={x + 24} cy="52" r="14" fill="none" stroke={i === 3 ? CLAY : FOREST} strokeWidth="1.5" />
            <text x={x + 24} y="57" textAnchor="middle" fontSize="15" fill={i === 3 ? CLAY : FOREST} style={LABEL}>{s.n}</text>
            <foreignObject x={x + 10} y="76" width="142" height="92">
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: i === 3 ? CLAY : FOREST, fontSize: 14, lineHeight: 1.25 }}>
                <div style={{ fontWeight: 600 }}>{s.t}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: FOREST, opacity: 0.8 }}>{s.s}</div>
              </div>
            </foreignObject>
            {i < 3 ? <path d={`M ${x + 164} 99 l 8 0 m -4 -4 l 4 4 l -4 4`} fill="none" stroke={FOREST} strokeWidth="1.4" strokeLinecap="round" /> : null}
          </g>
        );
      })}
      <text x="360" y="204" textAnchor="middle" fontSize="13" fill={FOREST} style={LABEL}>Everything you share stays public. Everything that lands on the chain is single use.</text>
    </svg>
  );
}
