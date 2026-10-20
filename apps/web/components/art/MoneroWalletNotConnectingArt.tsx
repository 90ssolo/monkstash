const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y1} V${y2 - 2}`} stroke={color} strokeWidth="1.4" fill="none" />
      <path d={`M${x - 6} ${y2 - 8} L${x} ${y2} L${x + 6} ${y2 - 8}`} stroke={color} strokeWidth="1.4" fill="none" />
    </g>
  );
}

function HArrow({ x1, y, x2, color }: { x1: number; y: number; x2: number; color: string }) {
  return (
    <g>
      <path d={`M${x1} ${y} H${x2 - 2}`} stroke={color} strokeWidth="1.4" fill="none" />
      <path d={`M${x2 - 8} ${y - 6} L${x2} ${y} L${x2 - 8} ${y + 6}`} stroke={color} strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Box({ x, y, w, h, lines, color = FOREST }: { x: number; y: number; w: number; h: number; lines: string[]; color?: string }) {
  const startY = y + h / 2 - ((lines.length - 1) * 8) + 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={PAPER} stroke={color} strokeWidth="1.2" />
      {lines.map((t, i) => (
        <text key={t} x={x + w / 2} y={startY + i * 17} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={color}>{t}</text>
      ))}
    </g>
  );
}

/** First-pass diagnosis for "wallet cannot connect": separate your internet from the node from your settings. */
export function ConnectDiagnosisFigure() {
  return (
    <svg viewBox="0 0 640 290" role="img" aria-label="Diagnostic flow. Start with the wallet reporting it cannot connect. Ask whether other websites load; if not, fix your internet, VPN or firewall. If they do, switch to a different public node. If that node connects, the first node was the problem. If it still fails, check the network, port, SSL setting and wallet version." style={{ width: "100%", height: "auto" }}>
      <Box x={10} y={20} w={170} h={64} lines={["Wallet says it", "cannot connect"]} />
      <HArrow x1={180} y={52} x2={233} color={FOREST} />
      <Box x={235} y={20} w={170} h={64} lines={["Do other websites", "load on this device?"]} />
      <HArrow x1={405} y={52} x2={458} color={FOREST} />
      <text x="432" y="44" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>yes</text>
      <Box x={460} y={20} w={170} h={64} lines={["Switch to a", "different public node"]} />

      <Arrow x={320} y1={84} y2={150} color={CLAY} />
      <text x="332" y="122" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>no</text>
      <Box x={235} y={152} w={170} h={80} lines={["Fix the basics", "internet, VPN, Tor,", "firewall, clock"]} color={CLAY} />

      <Arrow x={545} y1={84} y2={150} color={CLAY} />
      <text x="557" y="122" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>still fails</text>
      <Box x={460} y={152} w={170} h={80} lines={["Check network, port,", "SSL setting, wallet", "version, local sync"]} color={CLAY} />

      <text x="10" y="260" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>If a different node connects, stop there. The first node was down or busy,</text>
      <text x="10" y="278" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>and nothing is wrong with your wallet or your funds.</text>
    </svg>
  );
}
