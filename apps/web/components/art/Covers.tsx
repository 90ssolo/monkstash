/**
 * Card covers: one small ink-on-paper drawing per page, in the same hand as the article
 * figures. Built from a shared kit so the set stays consistent, and composed per page so no
 * two cards look alike. Decorative: the card's title and summary carry the meaning.
 */
import type { ReactNode } from "react";
import { MoneroSymbol } from "./MoneroSymbol";

const PAPER = "#fbfbf7";
const RULE = "#e3e4da";
const INK = "#1f4733";
const GREY = "#6b7a70";
const CLAY = "#b4532a";
const SOFT = "#c7c8bb";
const MINT = "#e4efe7";
const serif = { fontFamily: "var(--font-display)" } as const;
const sans = { fontFamily: "var(--font-sans)" } as const;
const mono = { fontFamily: "var(--font-mono)" } as const;

type At = { x: number; y: number; s?: number };
const at = ({ x, y, s = 1 }: At) => `translate(${x} ${y}) scale(${s})`;
const line = { fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// ---------------------------------------------------------------- kit

function Note({ x, y, children, color = CLAY, anchor = "middle" }: { x: number; y: number; children: ReactNode; color?: string; anchor?: "start" | "middle" | "end" }) {
  return <text x={x} y={y} style={serif} fontStyle="italic" fontSize="13" fill={color} textAnchor={anchor}>{children}</text>;
}
function Tag({ x, y, children, w = 96 }: { x: number; y: number; children: ReactNode; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="18" rx="2" fill={INK} />
      <text x={w / 2} y="12.5" style={sans} fontSize="8" fontWeight="600" letterSpacing="1.2" fill={PAPER} textAnchor="middle">{children}</text>
    </g>
  );
}
const Dash = ({ d, color = CLAY }: { d: string; color?: string }) => <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="2 6" strokeLinecap="round" />;
const Coin = ({ x, y, size = 40, variant = "color" }: { x: number; y: number; size?: number; variant?: "color" | "mono" }) => <g style={{ color: INK }}><MoneroSymbol size={size} variant={variant} x={x - size / 2} y={y - size / 2} /></g>;

const Lock = (p: At) => (
  <g transform={at(p)} {...line}><rect x="-16" y="-6" width="32" height="26" rx="4" fill={PAPER} /><path d="M-9 -6v-7a9 9 0 0118 0v7" /><circle cx="0" cy="6" r="2.5" fill={INK} /></g>
);
const Key = (p: At) => (
  <g transform={at(p)} {...line}><circle r="12" fill={PAPER} /><circle r="4.5" strokeWidth="1.5" /><path d="M12 0h34M36 0v8M44 0v6" /></g>
);
const Shield = ({ check = true, ...p }: At & { check?: boolean }) => (
  <g transform={at(p)}>
    <path d="M0 -30L26 -20V0C26 18 13 28 0 33C-13 28 -26 18 -26 0V-20Z" fill={MINT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    {check ? <path d="M-9 1l6 6 12-13" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
  </g>
);
function WordCard({ n = 6, title = true, ...p }: At & { n?: number; title?: boolean }) {
  const rows = Array.from({ length: n }, (_, i) => i);
  return (
    <g transform={at(p)}>
      <rect x="-44" y="-38" width="88" height="76" rx="3" fill={PAPER} stroke={INK} strokeWidth="1.8" transform="rotate(-3)" />
      <g transform="rotate(-3)">
        {title ? <text x="-34" y="-24" style={sans} fontSize="6.5" fontWeight="700" letterSpacing="1" fill={CLAY}>RECOVERY WORDS</text> : null}
        {rows.map((i) => (
          <g key={i} transform={`translate(${i % 2 ? 4 : -36} ${-12 + Math.floor(i / 2) * 14})`}>
            <text style={mono} fontSize="6.5" fill={GREY}>{i + 1}</text>
            <path d="M9 -2h22" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </g>
  );
}
const Node = (p: At) => (
  <g transform={at(p)} fill={PAPER} stroke={INK} strokeWidth="1.8">
    {[-22, 0, 22].map((dy) => <g key={dy}><rect x="-30" y={dy - 9} width="60" height="18" rx="3" /><path d={`M-20 ${dy}h14`} strokeLinecap="round" /><circle cx="20" cy={dy} r="2" fill={dy === -22 ? CLAY : INK} stroke="none" /></g>)}
  </g>
);
const Phone = ({ children, ...p }: At & { children?: ReactNode }) => (
  <g transform={at(p)}><rect x="-22" y="-40" width="44" height="80" rx="7" fill={PAPER} stroke={INK} strokeWidth="2" /><path d="M-6 -33h12" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />{children}</g>
);
const Laptop = ({ children, ...p }: At & { children?: ReactNode }) => (
  <g transform={at(p)}>
    <rect x="-46" y="-34" width="92" height="60" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
    <path d="M-58 30h116l-8 8h-100z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    {children}
  </g>
);
const Browser = ({ w = 150, h = 92, url, children, ...p }: At & { w?: number; h?: number; url?: string; children?: ReactNode }) => (
  <g transform={at(p)}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="5" fill={PAPER} stroke={INK} strokeWidth="2" />
    <path d={`M${-w / 2} ${-h / 2 + 16}h${w}`} stroke={INK} strokeWidth="1.6" />
    {[0, 1, 2].map((i) => <circle key={i} cx={-w / 2 + 10 + i * 8} cy={-h / 2 + 8} r="2.2" fill={SOFT} />)}
    {url ? <text x={-w / 2 + 38} y={-h / 2 + 11} style={mono} fontSize="7" fill={GREY}>{url}</text> : null}
    {children}
  </g>
);
const Eye = ({ crossed = false, ...p }: At & { crossed?: boolean }) => (
  <g transform={at(p)} {...line}><path d="M-22 0C-12 -14 12 -14 22 0C12 14 -12 14 -22 0Z" fill={PAPER} /><circle r="6" />{crossed ? <path d="M-20 16L20 -16" stroke={CLAY} strokeWidth="2.4" /> : null}</g>
);
const Magnifier = (p: At) => (
  <g transform={at(p)} {...line} strokeWidth="2.4"><circle r="16" fill={PAPER} /><path d="M12 12l14 14" strokeWidth="4" /></g>
);
const Clock = ({ h = -50, ...p }: At & { h?: number }) => (
  <g transform={at(p)} {...line}><circle r="20" fill={PAPER} /><path d={`M0 0V-13M0 0L${Math.cos((h * Math.PI) / 180) * 9} ${Math.sin((h * Math.PI) / 180) * 9}`} /><circle r="1.8" fill={INK} /></g>
);
function Ring({ r = 34, n = 7, real = 3, ...p }: At & { r?: number; n?: number; real?: number }) {
  return (
    <g transform={at(p)}>
      <circle r={r} fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const me = i === real;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="7" fill={PAPER} stroke={me ? CLAY : GREY} strokeWidth={me ? 2.4 : 1.6} />;
      })}
    </g>
  );
}
function Qr({ size = 52, seed = 7, ...p }: At & { size?: number; seed?: number }) {
  // A QR-like pattern (not a scannable code): three finder squares and seeded modules.
  const n = 11;
  const c = size / n;
  const finder = (x: number, y: number) => x < 3 && y < 3 ? [x, y] : x > n - 4 && y < 3 ? [x - (n - 3), y] : x < 3 && y > n - 4 ? [x, y - (n - 3)] : null;
  const cells: ReactNode[] = [];
  let v = seed;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    v = (v * 9301 + 49297) % 233280;
    const f = finder(x, y);
    // Finder squares: an ink ring around a clay centre. Elsewhere: about half the modules on.
    const fill = f ? (f[0] === 1 && f[1] === 1 ? CLAY : INK) : v / 233280 > 0.52 ? INK : null;
    if (fill) cells.push(<rect key={`${x}-${y}`} x={x * c - size / 2} y={y * c - size / 2} width={c} height={c} fill={fill} />);
  }
  return <g transform={at(p)}><rect x={-size / 2 - 5} y={-size / 2 - 5} width={size + 10} height={size + 10} rx="3" fill={PAPER} stroke={INK} strokeWidth="1.6" />{cells}</g>;
}
const Shop = (p: At) => (
  <g transform={at(p)}>
    <rect x="-44" y="-10" width="88" height="50" fill={PAPER} stroke={INK} strokeWidth="2" />
    <path d="M-50 -10l8-20h84l8 20z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    {[-36, -18, 0, 18, 36].map((x, i) => <path key={x} d={`M${x - 8} -10q8 12 16 0`} fill={i % 2 ? PAPER : "#f3d9cc"} stroke={INK} strokeWidth="1.6" />)}
    <rect x="-12" y="12" width="24" height="28" fill={PAPER} stroke={INK} strokeWidth="1.8" />
    <rect x="-36" y="10" width="18" height="14" fill={MINT} stroke={INK} strokeWidth="1.4" /><rect x="18" y="10" width="18" height="14" fill={MINT} stroke={INK} strokeWidth="1.4" />
  </g>
);
const Receipt = ({ lines = 4, ...p }: At & { lines?: number }) => (
  <g transform={at(p)}>
    <path d="M-24 -36h48v66l-6 -4l-6 4l-6 -4l-6 4l-6 -4l-6 4l-6 -4l-6 4z" fill={PAPER} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    {Array.from({ length: lines }, (_, i) => <path key={i} d={`M-14 ${-24 + i * 11}h${i === lines - 1 ? 16 : 28}`} stroke={i === lines - 1 ? CLAY : SOFT} strokeWidth="2.2" strokeLinecap="round" />)}
  </g>
);
const Chip = (p: At) => (
  <g transform={at(p)} fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round">
    <rect x="-22" y="-22" width="44" height="44" rx="4" fill={PAPER} /><rect x="-11" y="-11" width="22" height="22" rx="2" fill={MINT} />
    {[-12, 0, 12].map((d) => <g key={d}><path d={`M${d} -22v-8M${d} 22v8M-22 ${d}h-8M22 ${d}h8`} /></g>)}
  </g>
);
const Pick = (p: At) => (
  <g transform={at(p)} {...line} strokeWidth="2.4"><path d="M-22 22L14 -14" /><path d="M-6 -24Q14 -30 28 -6" strokeWidth="3" /></g>
);
const Warn = (p: At) => (
  <g transform={at(p)}><path d="M0 -24L24 18H-24Z" fill="#f6e3d9" stroke={CLAY} strokeWidth="2" strokeLinejoin="round" /><path d="M0 -8v13" stroke={CLAY} strokeWidth="2.6" strokeLinecap="round" /><circle cy="11" r="1.8" fill={CLAY} /></g>
);
const Tick = ({ ok = true, ...p }: At & { ok?: boolean }) => (
  <g transform={at(p)}><circle r="11" fill={ok ? MINT : "#f6e3d9"} stroke={ok ? INK : CLAY} strokeWidth="1.8" />
    {ok ? <path d="M-5 0l3.5 3.5L5 -4" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M-4 -4l8 8M4 -4l-8 8" stroke={CLAY} strokeWidth="2" strokeLinecap="round" />}
  </g>
);
function Blocks({ n = 5, flag, ...p }: At & { n?: number; flag?: number }) {
  return (
    <g transform={at(p)}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * 34} 0)`}>
          {i ? <path d="M-10 0h-4" stroke={INK} strokeWidth="1.8" /> : null}
          <rect x="-10" y="-11" width="22" height="22" rx="2" fill={i === flag ? MINT : PAPER} stroke={INK} strokeWidth="1.8" />
          {i === flag ? <g stroke={CLAY} strokeWidth="1.8" strokeLinecap="round"><path d="M1 -11v-20" /><path d="M1 -31h12l-4 4 4 4h-12" fill="#f6e3d9" strokeLinejoin="round" /></g> : null}
        </g>
      ))}
    </g>
  );
}
const Plug = ({ broken = false, ...p }: At & { broken?: boolean }) => (
  <g transform={at(p)} {...line}>
    <path d="M-40 0h18" /><rect x="-22" y="-10" width="18" height="20" rx="3" fill={PAPER} /><path d="M-4 -5h8M-4 5h8" />
    <path d={broken ? "M40 0h-14" : "M40 0h-18"} /><rect x={broken ? 10 : 4} y="-10" width="18" height="20" rx="3" fill={PAPER} />
    {broken ? <path d="M2 -16l-4 10 6 2 -4 10" stroke={CLAY} strokeWidth="1.8" /> : null}
  </g>
);
const Book = (p: At) => (
  <g transform={at(p)} {...line}>
    <path d="M-40 -22Q-20 -28 0 -18V26Q-20 18 -40 22Z" fill={PAPER} /><path d="M40 -22Q20 -28 0 -18V26Q20 18 40 22Z" fill={PAPER} />
    <path d="M-30 -10q10 -3 22 2M-30 0q10 -3 22 2M10 -6q10 -4 22 -2M10 4q10 -4 22 -2" stroke={SOFT} strokeWidth="1.6" />
  </g>
);
const Scales = (p: At) => (
  <g transform={at(p)} {...line}>
    <path d="M0 -30V26M-18 26h36M-34 -20h68" /><circle cy="-32" r="3" fill={INK} />
    <path d="M-34 -20l-12 26h24z M34 -20l-12 26h24z" fill={PAPER} strokeWidth="1.6" />
  </g>
);
const Addr = ({ x, y, text, color = INK, size = 9 }: { x: number; y: number; text: string; color?: string; size?: number }) => (
  <text x={x} y={y} style={mono} fontSize={size} fill={color} textAnchor="middle">{text}</text>
);
const Signpost = (p: At) => (
  <g transform={at(p)} {...line}><path d="M0 -34V34M-12 34h24" /><path d="M0 -26h30l8 7-8 7H0z" fill={PAPER} /><path d="M0 -4h-30l-8 7 8 7H0z" fill={PAPER} /><path d="M8 -19h14" stroke={CLAY} /><path d="M-22 3h-12" stroke={CLAY} /></g>
);
const Wifi = ({ off = false, ...p }: At & { off?: boolean }) => (
  <g transform={at(p)} fill="none" stroke={off ? SOFT : INK} strokeWidth="2.4" strokeLinecap="round">
    <path d="M-22 -6a32 32 0 0144 0M-14 2a20 20 0 0128 0M-6 10a8 8 0 0112 0" /><circle cy="16" r="2" fill={off ? SOFT : INK} />
    {off ? <path d="M-20 -18L20 22" stroke={CLAY} /> : null}
  </g>
);
const Bars = ({ fill = 0.4, ...p }: At & { fill?: number }) => (
  <g transform={at(p)}><rect x="-50" y="-6" width="100" height="12" rx="6" fill={PAPER} stroke={INK} strokeWidth="1.8" /><rect x="-48" y="-4" width={96 * fill} height="8" rx="4" fill={CLAY} /></g>
);

// ---------------------------------------------------------------- covers

const COVERS: Record<string, () => ReactNode> = {
  // Guides
  "/use-monero": () => <><Signpost x={70} y={84} /><Dash d="M110 120C150 120 160 70 200 70S250 96 268 92" /><Coin x={262} y={66} size={38} /><Note x={176} y={142}>start anywhere</Note></>,
  "/create-monero-wallet": () => <><Browser x={112} y={82} url="wallet.monkstash.com"><Lock x={0} y={10} /></Browser><WordCard x={262} y={84} n={6} /><Note x={262} y={146}>about two minutes</Note></>,
  "/back-up-monero-wallet": () => <><WordCard x={96} y={80} n={8} /><Dash d="M150 80h40" /><Lock x={228} y={78} s={1.4} /><Note x={228} y={136}>paper, then a safe place</Note></>,
  "/monero-view-only-wallet": () => <><Phone x={92} y={82}><Eye x={0} y={4} s={0.8} /></Phone><Key x={170} y={66} /><Key x={170} y={106} /><path d="M160 98l40 18" stroke={CLAY} strokeWidth="2.6" strokeLinecap="round" /><Note x={262} y={70} anchor="middle">view key: yes</Note><Note x={262} y={112} anchor="middle" color={GREY}>spend key: no</Note></>,
  "/send-monero": () => <><Phone x={70} y={82}><Coin x={0} y={6} size={26} /></Phone><Dash d="M100 82H226" /><path d="M218 74l10 8-10 8" {...line} stroke={CLAY} /><Phone x={256} y={82}><Tick x={0} y={6} /></Phone><Note x={163} y={70}>one minute</Note></>,
  "/receive-monero": () => <><Qr x={110} y={80} size={60} seed={11} /><Dash d="M156 80H214" /><Phone x={250} y={82}><Coin x={0} y={6} size={26} /></Phone><Note x={110} y={142}>share an address</Note></>,
  "/monero-transaction-lookup": () => <><Blocks x={52} y={80} n={6} flag={3} /><Magnifier x={162} y={64} s={1.2} /><Receipt x={274} y={84} lines={3} /><Note x={140} y={136}>find it, then prove it</Note></>,
  "/restore-monero-wallet": () => <><WordCard x={84} y={80} n={6} /><Dash d="M136 80H190" /><path d="M182 72l10 8-10 8" {...line} stroke={CLAY} /><Browser x={248} y={80} w={98} h={78}><Coin x={0} y={8} size={30} /></Browser><Note x={160} y={146}>25 words bring it back</Note></>,
  "/restore-mymonero-seed": () => <><WordCard x={84} y={84} n={6} title={false} /><text x={84} y={34} style={sans} fontSize="7" fontWeight="700" letterSpacing="1" fill={CLAY} textAnchor="middle">13 WORDS</text><Dash d="M136 84H190" /><WordCard x={240} y={84} n={8} /><Note x={160} y={148}>same wallet, new home</Note></>,
  "/monero-wallet-not-syncing": () => <><Bars x={120} y={70} fill={0.38} /><Clock x={240} y={70} h={-20} /><Blocks x={52} y={118} n={7} /><Note x={120} y={50}>stuck at 38%?</Note></>,
  "/monero-wallet-not-connecting": () => <><Laptop x={66} y={76} s={0.75} /><Plug x={164} y={76} s={1.5} broken /><Node x={268} y={78} s={0.85} /><Note x={164} y={136}>wallet, meet node</Note></>,
  "/monero-wallet-not-showing-balance": () => <><Browser x={140} y={80} w={170} h={90}><text x={-60} y={8} style={serif} fontSize="26" fill={SOFT}>0.0000</text><text x={44} y={8} style={sans} fontSize="10" fontWeight="600" fill={GREY}>XMR</text></Browser><Magnifier x={254} y={70} /><Note x={140} y={146}>the coins are still there</Note></>,
  "/monero-gui-virus-warning": () => <><Shield x={96} y={80} check={false} /><Warn x={96} y={82} s={0.7} /><Dash d="M136 80H190" color={SOFT} /><Tick x={226} y={80} s={1.4} /><Note x={226} y={128}>false alarm, usually</Note></>,
  "/monero-remote-node": () => <><Laptop x={76} y={78} /><Dash d="M136 70Q180 40 222 70" /><Node x={260} y={82} /><Note x={180} y={140}>borrow a node</Note></>,
  "/buy-monero": () => <><Coin x={240} y={74} size={50} /><g transform="translate(90 76)"><rect x="-38" y="-24" width="76" height="48" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" /><path d="M-38 -10h76" stroke={INK} strokeWidth="5" /><path d="M-26 10h22" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" /></g><Dash d="M136 76H206" /><Note x={164} y={136}>your first XMR</Note></>,
  "/mine-monero": () => <><Chip x={96} y={78} /><Pick x={170} y={78} /><Coin x={250} y={78} size={42} /><Note x={170} y={138}>your own computer</Note></>,
  "/monero-p2pool": () => <><Chip x={70} y={60} s={0.7} /><Chip x={70} y={110} s={0.7} /><Chip x={130} y={86} s={0.7} /><Dash d="M96 66Q170 60 210 80M96 108Q170 110 210 90M154 86H210" /><Node x={252} y={84} /><Note x={252} y={140}>no pool operator</Note></>,
  "/accept-monero-payments": () => <><Shop x={96} y={80} /><Qr x={206} y={76} size={44} seed={5} /><Tick x={270} y={70} s={1.2} /><Note x={206} y={140}>get paid, privately</Note></>,
  "/monero-payment-gateway": () => <><Browser x={96} y={80} w={130} h={86} url="shop"><path d="M-40 6h40M-40 18h28" stroke={SOFT} strokeWidth="3" strokeLinecap="round" /><rect x="14" y="0" width="34" height="22" rx="3" fill={INK} /></Browser><Dash d="M164 80H206" /><Node x={246} y={80} /><Note x={170} y={146}>your server, your keys</Note></>,
  "/monero-pos": () => <><g transform="translate(110 80)"><rect x="-52" y="-40" width="104" height="72" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" /><text x="0" y="-8" style={serif} fontSize="22" fill={INK} textAnchor="middle">4.50</text>{[-30, -10, 10, 30].map((x) => <rect key={x} x={x - 7} y="6" width="14" height="10" rx="2" fill={MINT} stroke={INK} strokeWidth="1.2" />)}<path d="M-20 40h40" stroke={INK} strokeWidth="2" /></g><Qr x={240} y={78} size={48} seed={3} /><Note x={176} y={146}>a till in the browser</Note></>,
  "/monero-payment-link": () => <><g transform="translate(108 76) rotate(-30)" fill="none" strokeWidth="3"><rect x="-34" y="-11" width="40" height="22" rx="11" stroke={INK} /><rect x="-6" y="-11" width="40" height="22" rx="11" stroke={CLAY} /></g><Dash d="M150 78H196" /><Receipt x={232} y={80} /><Note x={108} y={136}>one link, one invoice</Note></>,
  "/monero-woocommerce": () => <><Browser x={110} y={80} w={150} h={90} url="checkout"><path d="M-56 4h70M-56 16h50" stroke={SOFT} strokeWidth="3" strokeLinecap="round" /><Coin x={46} y={10} size={24} /></Browser><Tick x={240} y={66} /><Tick x={240} y={96} /><Note x={252} y={136} anchor="middle">order paid</Note></>,

  // Learn
  "/what-is-monero": () => <><Coin x={110} y={78} size={64} /><Note x={110} y={140}>digital cash, private by default</Note><Eye x={238} y={76} crossed s={1.3} /></>,
  "/how-monero-works": () => <><Ring x={86} y={80} /><Key x={156} y={80} /><Blocks x={234} y={80} n={2} /><Note x={170} y={140}>three tricks, one payment</Note></>,
  "/monero-vs-bitcoin": () => <><Coin x={92} y={70} size={52} /><text x={160} y={80} style={serif} fontStyle="italic" fontSize="20" fill={GREY} textAnchor="middle">vs</text><text x={232} y={80} style={serif} fontSize="24" fill={GREY} textAnchor="middle">Bitcoin</text><Note x={92} y={130}>private by default</Note><Note x={232} y={130} color={GREY}>public by default</Note></>,
  "/monero-vs-zcash": () => <><Coin x={92} y={70} size={52} /><text x={160} y={80} style={serif} fontStyle="italic" fontSize="20" fill={GREY} textAnchor="middle">vs</text><text x={232} y={80} style={serif} fontSize="24" fill={GREY} textAnchor="middle">Zcash</text><Note x={92} y={130}>privacy always on</Note><Note x={232} y={130} color={GREY}>privacy optional</Note></>,
  "/monero-ring-signatures": () => <><Ring x={120} y={78} r={44} n={16} real={11} /><Note x={120} y={146}>one real, fifteen look-alikes</Note><Note x={250} y={84} color={GREY}>who signed?</Note></>,
  "/monero-stealth-address": () => <><Addr x={80} y={70} text="4A9x…k2Pq" size={11} /><Dash d="M80 80V98H196" /><Addr x={236} y={60} text="8Fm2…" color={GREY} size={10.5} /><Addr x={236} y={80} text="8Qz7…" color={GREY} size={10.5} /><Addr x={236} y={101} text="8Lc4…" color={CLAY} size={11} /><Note x={160} y={140}>a new address every time</Note></>,
  "/monero-subaddress": () => <><Key x={56} y={80} /><Dash d="M108 80L170 50M108 80H170M108 80L170 110" /><Addr x={214} y={54} text="8Ab3…" size={10.5} /><Addr x={214} y={84} text="8Kd9…" size={10.5} /><Addr x={214} y={114} text="8Rw1…" size={10.5} /><Note x={160} y={146}>one wallet, many addresses</Note></>,
  "/is-monero-traceable": () => <><Magnifier x={110} y={74} s={1.4} /><Eye x={110} y={74} crossed s={0.6} /><Blocks x={196} y={80} n={3} /><Note x={160} y={140}>what can be seen, honestly</Note></>,
  "/monero-seed-phrase": () => <><WordCard x={110} y={80} n={8} /><Key x={208} y={80} /><Note x={160} y={146}>25 words, the master key</Note></>,
  "/monero-view-key": () => <><Key x={86} y={80} s={1.2} /><Eye x={236} y={80} s={1.3} /><Dash d="M150 80H206" /><Note x={160} y={136}>see in, never spend</Note></>,
  "/monero-restore-height": () => <><Blocks x={40} y={94} n={8} flag={4} /><Note x={176} y={46}>start scanning here</Note></>,
  "/monero-transaction-fee": () => <><Coin x={100} y={78} size={52} /><g transform="translate(220 78)"><text y="-6" style={serif} fontSize="26" fill={INK} textAnchor="middle">cents</text><path d="M-40 8h80" stroke={SOFT} strokeWidth="2" /></g><Note x={160} y={140}>what a payment costs</Note></>,
  "/monero-transaction-time": () => <><Clock x={80} y={78} h={-10} /><Blocks x={140} y={80} n={5} flag={1} /><Note x={186} y={130}>about 2 minutes a block</Note></>,
  "/monero-light-wallet": () => <><Phone x={80} y={80} /><Dash d="M108 80H160" /><Node x={210} y={80} s={0.9} /><Eye x={272} y={60} s={0.6} /><Note x={176} y={142}>light, with a trade-off</Note></>,
  "/monero-node": () => <><Node x={160} y={78} s={1.2} /><Dash d="M60 50Q100 60 120 70M60 110Q100 100 120 92M260 50Q220 60 200 70M260 110Q220 100 200 92" /><circle cx={56} cy={48} r={5} fill={INK} /><circle cx={56} cy={112} r={5} fill={INK} /><circle cx={264} cy={48} r={5} fill={INK} /><circle cx={264} cy={112} r={5} fill={INK} /><Note x={160} y={150}>the network, one copy at a time</Note></>,
  "/run-a-monero-node": () => <><Laptop x={92} y={78}><Node x={0} y={-4} s={0.55} /></Laptop><Shield x={236} y={78} /><Note x={160} y={144}>your own copy of the chain</Note></>,
  "/monero-pruned-node": () => <><Node x={96} y={78} /><Dash d="M140 78H186" /><Node x={226} y={86} s={0.65} /><Note x={226} y={136}>a third of the space</Note></>,
  "/is-monero-safe": () => <><Shield x={110} y={78} s={1.3} /><Tick x={214} y={60} /><Tick x={214} y={90} /><Tick ok={false} x={214} y={120} /><path d="M232 60h34M232 90h28M232 120h30" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" /></>,
  "/monero-phishing-sites": () => <><Browser x={92} y={74} w={120} h={74} url="m0nkstash.co"><Warn x={0} y={12} s={0.9} /></Browser><Browser x={234} y={74} w={120} h={74} url="real address"><Tick x={0} y={10} /></Browser><Note x={160} y={140}>check the address bar</Note></>,
  "/is-monero-legal": () => <><Scales x={110} y={80} /><Book x={232} y={82} s={0.8} /><Note x={160} y={140}>it depends where you live</Note></>,

  // Wallets
  "/monero-wallets/cake-wallet-review": () => <><Phone x={110} y={80}><Coin x={0} y={6} size={26} /></Phone><text x={220} y={74} style={serif} fontSize="22" fill={INK} textAnchor="middle">Cake</text><Note x={220} y={98} color={GREY}>reviewed, honestly</Note></>,
  "/monero-wallets/feather-wallet-review": () => <><Laptop x={110} y={78}><g {...line} strokeWidth="1.6"><path d="M-14 14C-10 -8 8 -18 18 -18C14 0 4 10 -14 14ZM-14 14L8 -8" /></g></Laptop><text x={232} y={74} style={serif} fontSize="22" fill={INK} textAnchor="middle">Feather</text><Note x={232} y={98} color={GREY}>reviewed, honestly</Note></>,
  "/monero-wallets/monero-gui-vs-cli": () => <><Browser x={92} y={78} w={120} h={78}><rect x={-40} y={-6} width={80} height={10} rx={2} fill={MINT} /><rect x={-40} y={10} width={50} height={10} rx={2} fill={MINT} /></Browser><g transform="translate(232 78)"><rect x="-58" y="-39" width="116" height="78" rx="5" fill={INK} /><text x="-48" y="-16" style={mono} fontSize="9" fill={PAPER}>$ monero-wallet-cli</text><text x="-48" y="0" style={mono} fontSize="9" fill={SOFT}>{"> balance"}</text></g><Note x={160} y={146}>same engine, two faces</Note></>,
  "/monero-wallets/safest-monero-wallet": () => <><Shield x={160} y={74} s={1.3} /><Phone x={72} y={84} s={0.7} /><Laptop x={252} y={84} s={0.6} /><Note x={160} y={144}>safest for whom?</Note></>,

  "/monero-wallets": () => <><Phone x={70} y={84} s={0.8}><Coin x={0} y={6} size={24} /></Phone><Laptop x={160} y={80} s={0.75}><Coin x={0} y={-4} size={26} /></Laptop><g transform="translate(258 84)"><rect x="-34" y="-14" width="68" height="28" rx="7" fill={PAPER} stroke={INK} strokeWidth="2" /><rect x="-24" y="-6" width="30" height="12" rx="2" fill={MINT} stroke={INK} strokeWidth="1.2" /><circle cx="20" cy="0" r="5" fill={PAPER} stroke={INK} strokeWidth="1.6" /></g><Note x={160} y={146}>six honest options</Note></>,

  // Guides added in October 2026
  "/exodus-monero": () => <><WordCard x={84} y={84} n={6} title={false} /><text x={84} y={34} style={sans} fontSize="7" fontWeight="700" letterSpacing="1" fill={CLAY} textAnchor="middle">12 WORDS</text><Dash d="M136 84H190" /><Browser x={250} y={84} w={92} h={74}><Coin x={0} y={8} size={28} /></Browser><Note x={160} y={148}>your XMR, back in your hands</Note></>,
  "/check-monero-balance": () => <><Addr x={92} y={62} text="4AdU…Y8kE" size={11} /><text x={92} y={92} style={serif} fontSize="22" fill={SOFT} textAnchor="middle">? XMR</text><Dash d="M150 76H196" /><Key x={214} y={64} /><Eye x={236} y={104} s={0.9} /><Note x={160} y={146}>an address alone shows nothing</Note></>,
  "/monero-unlocked-balance": () => <><Lock x={78} y={74} s={1.2} /><Blocks x={130} y={80} n={5} flag={4} /><Note x={176} y={132}>10 blocks, about 20 minutes</Note></>,
  "/monero-fcmp": () => <><Ring x={78} y={78} r={30} n={11} real={7} /><Dash d="M122 78H170" /><g transform="translate(234 78)"><circle r="44" fill={MINT} stroke={INK} strokeWidth="1.6" />{Array.from({ length: 28 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.399) * (8 + (i % 7) * 5)} cy={Math.sin(i * 2.399) * (8 + (i % 7) * 5)} r="2.4" fill={i === 13 ? CLAY : INK} />)}</g><Note x={160} y={148}>from 16 to the whole chain</Note></>,
  "/monero-eu-2027": () => <><g transform="translate(92 78)">{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 32} cy={Math.sin((i / 12) * Math.PI * 2) * 32} r="3.2" fill={CLAY} />)}</g><Scales x={226} y={80} s={0.85} /><Note x={160} y={148}>10 July 2027, what really changes</Note></>,
  "/buy-monero-without-kyc": () => <><g transform="translate(86 80)"><rect x="-36" y="-22" width="72" height="44" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" /><circle r="12" fill={MINT} stroke={INK} strokeWidth="1.6" /><path d="M-28 -14h8M20 14h8" stroke={INK} strokeWidth="1.6" strokeLinecap="round" /></g><Dash d="M130 80H186" /><Coin x={226} y={78} size={46} /><Note x={160} y={148}>honest routes, dated</Note></>,
  "/monero-polyseed": () => <><WordCard x={92} y={84} n={6} title={false} /><text x={92} y={34} style={sans} fontSize="7" fontWeight="700" letterSpacing="1" fill={CLAY} textAnchor="middle">16 WORDS</text><Dash d="M144 84H186" /><g transform="translate(236 80)"><rect x="-30" y="-30" width="60" height="60" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" /><path d="M-30 -14h60" stroke={INK} strokeWidth="2" /><text y="16" style={serif} fontSize="16" fill={INK} textAnchor="middle">2026</text></g><Note x={160} y={148}>the date is in the words</Note></>,
  "/is-monero-web-wallet-safe": () => <><Browser x={104} y={76} w={140} h={88} url="wallet.monkstash.com"><Lock x={0} y={4} s={0.9} /></Browser><Shield x={240} y={78} s={1.1} /><Note x={170} y={146}>every risk, said plainly</Note></>,
  "/why-monero-delisted": () => <><g transform="translate(96 78)"><rect x="-50" y="-34" width="100" height="68" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" /><path d="M-38 -16h52M-38 0h40M-38 16h46" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" /><path d="M-44 -2h88" stroke={CLAY} strokeWidth="2.4" strokeLinecap="round" /></g><Dash d="M154 78H196" /><Coin x={236} y={78} size={46} /><Note x={160} y={148}>who dropped it, and why</Note></>,
  "/sell-monero": () => <><Coin x={84} y={78} size={46} /><g {...line} stroke={CLAY}><path d="M122 66h74l-8-7M196 90h-74l8 7" /></g><g transform="translate(240 78)"><rect x="-36" y="-22" width="72" height="44" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" /><circle r="12" fill={MINT} stroke={INK} strokeWidth="1.6" /></g><Note x={160} y={142}>out of XMR, without the regret</Note></>,
  "/swap-bitcoin-to-monero": () => <><g transform="translate(86 76)"><circle r="24" fill={PAPER} stroke={GREY} strokeWidth="2" /><text y="5" style={sans} fontSize="12" fontWeight="700" fill={GREY} textAnchor="middle">BTC</text></g><g {...line} stroke={CLAY}><path d="M122 66h74l-8-7M196 90h-74l8 7" /></g><Coin x={234} y={78} size={46} /><Note x={160} y={142}>which way works, and who you trust</Note></>,
  "/tools/monero-qr-code-generator": () => <><Qr x={96} y={78} size={56} seed={23} /><Dash d="M140 78H186" /><Addr x={246} y={70} text="monero:4…?" size={10} /><Addr x={246} y={92} text="tx_amount=0.25" size={9} color={CLAY} /><Note x={160} y={146}>a payment QR in seconds</Note></>,
  "/tools/monero-mining-calculator": () => <><Chip x={84} y={74} /><g transform="translate(176 78)"><rect x="-30" y="-40" width="60" height="80" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" /><rect x="-21" y="-31" width="42" height="16" rx="2" fill={MINT} stroke={INK} strokeWidth="1.2" />{[-12, 0, 12].map((x) => [0, 12, 24].map((y) => <rect key={`${x}${y}`} x={x - 4} y={y - 6} width="8" height="7" rx="1.5" fill={PAPER} stroke={INK} strokeWidth="1.1" />))}</g><Coin x={256} y={74} size={38} /><Note x={176} y={146}>what would your computer earn?</Note></>,

  // Landing pages and tools
  "/monero-chrome-extension": () => <><Browser x={150} y={74} w={180} h={96}><g transform="translate(60 -34)"><rect x="-12" y="-7" width="24" height="14" rx="3" fill={MINT} stroke={INK} strokeWidth="1.4" /></g><Coin x={0} y={10} size={32} /></Browser><Note x={150} y={146}>right in your browser</Note></>,
  "/mymonero-alternative": () => <><WordCard x={92} y={84} n={6} title={false} /><text x={92} y={34} style={sans} fontSize="7" fontWeight="700" letterSpacing="1" fill={CLAY} textAnchor="middle">13 WORDS</text><Dash d="M144 84H196" /><Browser x={250} y={84} w={92} h={74}><Coin x={0} y={8} size={28} /></Browser><Note x={160} y={148}>moving on, safely</Note></>,
  "/tools/monero-fee-calculator": () => <><g transform="translate(100 80)"><rect x="-34" y="-46" width="68" height="92" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" /><rect x="-24" y="-36" width="48" height="20" rx="2" fill={MINT} stroke={INK} strokeWidth="1.2" />{[-14, 0, 14].map((x) => [0, 14, 28].map((y) => <rect key={`${x}${y}`} x={x - 5} y={y - 6} width="10" height="8" rx="1.5" fill={PAPER} stroke={INK} strokeWidth="1.2" />))}</g><Coin x={222} y={70} size={40} /><Note x={222} y={124}>live from real blocks</Note></>,
  "/tools/monero-address-validator": () => <><Addr x={124} y={74} text="4AdUnd…Y8kE" size={11} /><path d="M50 86h148" stroke={SOFT} strokeWidth="1.6" /><Tick x={246} y={72} s={1.5} /><Note x={160} y={132}>check before you send</Note></>,
  "/tools/monero-restore-height-calculator": () => <><g transform="translate(78 78)"><rect x="-30" y="-30" width="60" height="60" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" /><path d="M-30 -14h60" stroke={INK} strokeWidth="2" /><text y="16" style={serif} fontSize="22" fill={INK} textAnchor="middle">12</text></g><Dash d="M118 78H150" /><Blocks x={172} y={80} n={4} flag={1} /><Note x={176} y={140}>a date, as a block</Note></>,
  "/monero-wallets/android": () => <><Phone x={110} y={80}><circle cx={0} cy={-26} r={2.4} fill={INK} /><Coin x={0} y={6} size={26} /></Phone><Qr x={214} y={74} size={44} seed={19} /><Note x={214} y={134}>for Android</Note></>,
  "/monero-wallets/iphone": () => <><Phone x={110} y={80}><rect x={-8} y={-31} width={16} height={5} rx={2.5} fill={INK} /><Coin x={0} y={6} size={26} /></Phone><Lock x={214} y={72} s={1.2} /><Note x={214} y={134}>for iPhone</Note></>,
  "/monero-wallets/desktop": () => <><Laptop x={104} y={78}><Coin x={0} y={-4} size={30} /></Laptop><Node x={240} y={78} s={0.8} /><Note x={176} y={140}>Windows, Mac and Linux</Note></>,
  "/monero-wallets/hardware": () => <><g transform="translate(118 80)"><rect x="-46" y="-18" width="92" height="36" rx="8" fill={PAPER} stroke={INK} strokeWidth="2" /><rect x="-32" y="-8" width="40" height="16" rx="2" fill={MINT} stroke={INK} strokeWidth="1.2" /><circle cx="26" cy="0" r="6" fill={PAPER} stroke={INK} strokeWidth="1.6" /></g><Lock x={240} y={76} /><Note x={176} y={134}>keys that never touch the internet</Note></>,
};

/** Fallback for pages without their own cover yet: the Monero coin on ruled paper. */
const FALLBACK = () => <><Coin x={160} y={76} size={56} variant="mono" /></>;

export function ArticleCover({ path, className }: { path: string; className?: string }) {
  const draw = COVERS[path] ?? FALLBACK;
  return (
    <svg viewBox="0 0 320 160" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="160" fill={PAPER} />
      <g stroke={RULE} strokeWidth="1"><path d="M0 32H320M0 64H320M0 96H320M0 128H320" /></g>
      {draw()}
    </svg>
  );
}

/** Paths that have a drawn cover (for checks). */
export const COVER_PATHS = Object.keys(COVERS);
