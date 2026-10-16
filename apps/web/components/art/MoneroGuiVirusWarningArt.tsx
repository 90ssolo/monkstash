const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";
const MONO = "ui-monospace, Menlo, Consolas, monospace";

/** Verify the file, not the alarm. */
export function VerifyFlowFigure() {
  const boxes = [
    { x: 10, t1: "1. Download", t2: "from getmonero.org", t3: "and hashes.txt" },
    { x: 172, t1: "2. Check the list", t2: "signature on hashes.txt", t3: "must be a good one" },
    { x: 334, t1: "3. Hash your file", t2: "SHA-256 of the", t3: "file you downloaded" },
    { x: 496, t1: "4. Compare", t2: "your hash vs the", t3: "line for your file" },
  ];
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Four steps to verify a Monero download. Download the file and hashes.txt from getmonero.org. Check the signature on hashes.txt. Compute the SHA-256 hash of your file. Compare it with the matching line. Match means keep it. No match means delete it and download again." style={{ width: "100%", height: "auto" }}>
      {boxes.map((b, i) => (
        <g key={b.t1}>
          <rect x={b.x} y="20" width="134" height="100" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
          <text x={b.x + 67} y="48" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>{b.t1}</text>
          <text x={b.x + 67} y="76" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>{b.t2}</text>
          <text x={b.x + 67} y="94" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>{b.t3}</text>
          {i < 3 ? <path d={`M${b.x + 138} 70 L${b.x + 158} 70 M${b.x + 152} 65 L${b.x + 158} 70 L${b.x + 152} 75`} fill="none" stroke={FOREST} strokeWidth="1.2" /> : null}
        </g>
      ))}
      <line x1="563" y1="122" x2="563" y2="150" stroke={FOREST} strokeWidth="1.2" />
      <line x1="563" y1="150" x2="150" y2="150" stroke={FOREST} strokeWidth="1.2" />
      <rect x="20" y="150" width="260" height="70" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="150" y="178" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>Match: the file is the real one</text>
      <text x="150" y="200" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Any alert on it is a false positive</text>
      <rect x="340" y="150" width="280" height="70" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="480" y="178" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>No match: delete it</text>
      <text x="480" y="200" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>Download again from the official site</text>
      <text x="320" y="242" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={FOREST}>certUtil -hashfile  FILENAME  SHA256</text>
    </svg>
  );
}

/** Where the file came from decides how worried to be. */
export function SourceDecisionFigure() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="Decision guide by source. File from getmonero.org with matching hash: keep it, the alert is likely a false positive. File from getmonero.org with mismatched hash: delete and re-download. File from anywhere else: treat as malware, and if you ever typed a seed into it, move funds to a new wallet." style={{ width: "100%", height: "auto" }}>
      {[
        { x: 10, c: FOREST, t1: "Official site", t2: "hash matches", t3: "Keep it.", t4: "Likely a false positive." },
        { x: 224, c: CLAY, t1: "Official site", t2: "hash does not match", t3: "Delete it.", t4: "Download again." },
        { x: 438, c: CLAY, t1: "Anywhere else", t2: "ad, link, forum, mirror", t3: "Treat as malware.", t4: "Seed typed in? Move funds." },
      ].map((b) => (
        <g key={b.t1 + b.t2}>
          <rect x={b.x} y="20" width="192" height="150" rx="4" fill={PAPER} stroke={b.c} strokeWidth="1.3" />
          <text x={b.x + 96} y="50" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={b.c}>{b.t1}</text>
          <text x={b.x + 96} y="76" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={b.c}>{b.t2}</text>
          <text x={b.x + 96} y="116" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={b.c}>{b.t3}</text>
          <text x={b.x + 96} y="138" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={b.c}>{b.t4}</text>
        </g>
      ))}
      <text x="320" y="196" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>Where the file came from matters more than what the alert says.</text>
    </svg>
  );
}
