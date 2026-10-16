const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";
const MONO = "ui-monospace, Menlo, Consolas, monospace";

/** Same wallet files and same network, two different front doors. */
export function TwoDoorsFigure() {
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="The Monero GUI and the command line wallet are two front ends for the same kind of wallet. Both read the same 25-word seed and both talk to a Monero node. The GUI offers Simple and Advanced modes. The command line wallet adds scripting through monero-wallet-rpc." style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="20" width="250" height="90" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="145" y="48" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={FOREST}>Monero GUI</text>
      <text x="145" y="70" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>windows and buttons</text>
      <text x="145" y="90" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Simple mode or Advanced mode</text>

      <rect x="370" y="20" width="250" height="90" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="495" y="48" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={CLAY}>monero-wallet-cli</text>
      <text x="495" y="70" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>typed commands, no windows</text>
      <text x="495" y="90" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={CLAY}>+ monero-wallet-rpc for scripts</text>

      <line x1="145" y1="112" x2="145" y2="150" stroke={FOREST} strokeWidth="1.2" />
      <line x1="495" y1="112" x2="495" y2="150" stroke={CLAY} strokeWidth="1.2" />
      <line x1="145" y1="150" x2="495" y2="150" stroke={FOREST} strokeWidth="1.2" />
      <line x1="320" y1="150" x2="320" y2="168" stroke={FOREST} strokeWidth="1.2" />

      <rect x="170" y="168" width="300" height="34" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.1" />
      <text x="320" y="190" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>Same 25-word seed, same Monero network</text>
      <text x="320" y="228" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Pick the front door you are comfortable with. The coins are the same.</text>
    </svg>
  );
}

/** Which one to start with. */
export function WhichOneFigure() {
  const rows = [
    { y: 20, q: "I want clicks, a balance screen and my own node", a: "Monero GUI", c: FOREST },
    { y: 70, q: "I want a light, quick start on a laptop", a: "Feather", c: FOREST },
    { y: 120, q: "I run a server, a script, or I live in a terminal", a: "monero-wallet-cli or wallet-rpc", c: CLAY },
    { y: 170, q: "I want to try Monero with nothing to install", a: "A browser wallet, small amount", c: FOREST },
  ];
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label="A short chooser. Want clicks and your own node: Monero GUI. Want a light quick start: Feather. Run a server or script: monero-wallet-cli or monero-wallet-rpc. Want to try with nothing to install: a browser wallet with a small amount." style={{ width: "100%", height: "auto" }}>
      {rows.map((r) => (
        <g key={r.q}>
          <rect x="20" y={r.y} width="600" height="42" rx="3" fill={PAPER} stroke={r.c} strokeWidth="1.1" />
          <text x="34" y={r.y + 26} fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>{r.q}</text>
          <text x="606" y={r.y + 26} textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={r.c}>{r.a}</text>
        </g>
      ))}
    </svg>
  );
}
