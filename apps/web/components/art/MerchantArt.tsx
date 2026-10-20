import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Diagrams for the "Accept Monero" pillar and its cluster pages. Wide versions are drawn at
 * 560 units; phone versions at 360, paired with <Adaptive> from WhatIsMoneroNarrowArt.
 * Single-column pieces (the till, the payment link, the WooCommerce flow) are drawn at 360
 * only, so they read well at any width without scrolling.
 */

const FOREST = "#1f4733";
const INK = "#1b2a22";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const CARD = "#fbfbf7";
const MUTED = "#6b7a70";
const SOFT = "#e7efe8";
const SERIF = "var(--font-display)";
const MONO = "var(--font-mono)";
const fit = { width: "100%", height: "auto" } as const;
/** Single-column pieces keep their natural size on wide screens instead of being stretched. */
const fitNarrow = { width: "100%", height: "auto", maxWidth: 420, display: "block", margin: "0 auto" } as const;

const SALE = [
  { title: "Set a price", a: "€25, in your", b: "own currency" },
  { title: "Fresh address", a: "A new subaddress", b: "and QR, per sale" },
  { title: "Customer pays", a: "From any Monero", b: "wallet, in seconds" },
  { title: "Paid", a: "Matched by its own", b: "address, not the amount" },
];

function Tick({ x, y, size = 22, color = "#fff" }: { x: number; y: number; size?: number; color?: string }) {
  const s = size / 22;
  return <path d={`M${x} ${y + 11 * s} l${7 * s} ${7 * s} l${13 * s} ${-14 * s}`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />;
}

/** Pillar hero: one Monero sale as a 2x2 grid, sized to stay readable in the hero column. */
export function SaleFlowArt() {
  const cells = [{ x: 8, y: 34 }, { x: 216, y: 34 }, { x: 8, y: 170 }, { x: 216, y: 170 }];
  return (
    <svg viewBox="0 0 420 380" role="img" aria-label="How a Monero sale works. One, set a price, for example 25 euros in your own currency. Two, your wallet makes a fresh address and QR code for this sale only. Three, the customer pays from any Monero wallet, in seconds. Four, the sale shows as paid, matched by its own address, never by the amount. The money goes straight into your wallet; no company holds it in between." style={fit}>
      <text x="8" y="20" fontSize="11.5" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ONE MONERO SALE</text>
      {SALE.map((s, i) => {
        const { x, y } = cells[i]!;
        const last = i === 3;
        return (
          <g key={s.title}>
            <rect x={x} y={y} width="196" height="122" rx="5" fill={last ? FOREST : CARD} stroke={FOREST} strokeWidth="1.3" />
            <circle cx={x + 22} cy={y + 24} r="12" fill={last ? "#fff" : FOREST} />
            <text x={x + 22} y={y + 29} textAnchor="middle" fontSize="13" fontWeight="700" fill={last ? FOREST : "#fff"}>{i + 1}</text>
            {i === 0 ? <text x={x + 186} y={y + 36} textAnchor="end" fontFamily={SERIF} fontSize="28" fill={INK}>€25</text> : null}
            {i === 1 ? (
              <g transform={`translate(${x + 152} ${y + 10})`}>
                <rect width="34" height="34" fill="#fff" stroke={INK} strokeWidth="1" />
                {[[3, 3], [21, 3], [3, 21]].map(([a, b2]) => <rect key={`${a}${b2}`} x={a} y={b2} width="10" height="10" fill={INK} />)}
                <rect x="21" y="21" width="4" height="4" fill={INK} /><rect x="27" y="27" width="4" height="4" fill={INK} />
              </g>
            ) : null}
            {i === 2 ? <MoneroSymbol variant="color" size={34} x={x + 152} y={y + 10} /> : null}
            {last ? <Tick x={x + 156} y={y + 14} size={26} /> : null}
            <text x={x + 14} y={y + 76} fontFamily={SERIF} fontStyle="italic" fontSize="20" fill={last ? "#fff" : INK}>{s.title}</text>
            <text x={x + 14} y={y + 98} fontSize="13" fill={last ? "#dfe9e2" : INK}>{s.a}</text>
            <text x={x + 14} y={y + 114} fontSize="13" fill={last ? "#dfe9e2" : INK}>{s.b}</text>
          </g>
        );
      })}
      <rect x="8" y="306" width="404" height="64" rx="5" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
      <text x="24" y="332" fontSize="14" fontWeight="700" fill={FOREST}>Straight into your wallet</text>
      <text x="24" y="354" fontSize="13" fill={INK}>No processor, no chargebacks, no frozen funds.</text>
    </svg>
  );
}

export function SaleFlowNarrow() {
  return (
    <svg viewBox="0 0 360 470" role="img" aria-label="How a Monero sale works. One, set a price in your own currency. Two, a fresh address and QR code for this sale only. Three, the customer pays from any Monero wallet. Four, the sale shows as paid, matched by its address, never by the amount. The money goes straight into your wallet." style={fit}>
      <text x="4" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ONE MONERO SALE</text>
      <line x1="28" y1="50" x2="28" y2="320" stroke={FOREST} strokeWidth="1.4" />
      {SALE.map((s, i) => {
        const y = 50 + i * 90;
        const last = i === 3;
        return (
          <g key={s.title}>
            <circle cx="28" cy={y} r="14" fill={last ? CLAY : FOREST} />
            {last ? <Tick x={20} y={y - 9} size={16} /> : <text x="28" y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{i + 1}</text>}
            <text x="56" y={y + 6} fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={last ? CLAY : INK}>{s.title}</text>
            <text x="56" y={y + 30} fontSize="14" fill={INK}>{s.a} {s.b}</text>
          </g>
        );
      })}
      <rect x="4" y="360" width="352" height="96" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="20" y="388" fontSize="14" fontWeight="700" fill={FOREST}>Straight into your wallet</text>
      <text x="20" y="410" fontSize="13" fill={INK}>No processor holds the money.</text>
      <text x="20" y="430" fontSize="13" fill={INK}>No account, no chargebacks.</text>
      <text x="20" y="448" fontSize="12" fill={MUTED}>Spendable after about 20 minutes.</text>
    </svg>
  );
}

const SETUPS = [
  { title: "Payment link", who: "Freelancers", how: ["Send a link or QR", "by email or chat"], key: "In your wallet" },
  { title: "Cashier mode", who: "Shops and cafes", how: ["A till on a tablet", "or phone at the counter"], key: "On the till device" },
  { title: "MonkStash Pay", who: "Online shops", how: ["Checkout and API", "on your own server"], key: "On your server" },
];

/** Which setup fits: payment links, cashier mode, or the self-hosted gateway. */
export function SetupPickerArt() {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-label="Three ways to accept Monero with MonkStash. Payment links, for freelancers and creators: send a link or QR code by email or chat; the view key stays in your wallet. Cashier mode, for shops, cafes and market stalls: a till on a tablet or phone at the counter; the view key stays on the till device. MonkStash Pay, for online shops: a checkout page and an API on your own server; the view key stays on your server. In all three, no MonkStash server sees your sales." style={fit}>
      <text x="16" y="24" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>PICK YOUR SETUP</text>
      {SETUPS.map((s, i) => {
        const x = 16 + i * 180;
        return (
          <g key={s.title}>
            <rect x={x} y="40" width="168" height="196" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
            <rect x={x} y="40" width="168" height="6" fill={i === 1 ? CLAY : FOREST} />
            <text x={x + 16} y="80" fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={INK}>{s.title}</text>
            <text x={x + 16} y="102" fontSize="11" fontWeight="700" letterSpacing="0.8" fill={i === 1 ? CLAY : FOREST}>{s.who.toUpperCase()}</text>
            <text x={x + 16} y="134" fontSize="12" fill={INK}>{s.how[0]}</text>
            <text x={x + 16} y="151" fontSize="12" fill={INK}>{s.how[1]}</text>
            <line x1={x + 16} y1="178" x2={x + 152} y2="178" stroke={FOREST} strokeOpacity="0.3" />
            <text x={x + 16} y="200" fontSize="10.5" fontWeight="700" letterSpacing="1" fill={MUTED}>VIEW KEY STAYS</text>
            <text x={x + 16} y="219" fontSize="12.5" fontWeight="600" fill={FOREST}>{s.key}</text>
          </g>
        );
      })}
      <text x="16" y="270" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={INK}>In all three, no MonkStash server ever sees your sales.</text>
    </svg>
  );
}

export function SetupPickerNarrow() {
  return (
    <svg viewBox="0 0 360 540" role="img" aria-label="Three ways to accept Monero with MonkStash. Payment links for freelancers and creators; the view key stays in your wallet. Cashier mode for shops, cafes and stalls; the view key stays on the till device. MonkStash Pay for online shops; the view key stays on your server. No MonkStash server sees your sales." style={fit}>
      <text x="4" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>PICK YOUR SETUP</text>
      {SETUPS.map((s, i) => {
        const y = 34 + i * 158;
        return (
          <g key={s.title}>
            <rect x="4" y={y} width="352" height="144" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
            <rect x="4" y={y} width="6" height="144" fill={i === 1 ? CLAY : FOREST} />
            <text x="24" y={y + 32} fontFamily={SERIF} fontStyle="italic" fontSize="21" fill={INK}>{s.title}</text>
            <text x="24" y={y + 54} fontSize="12" fontWeight="700" letterSpacing="0.8" fill={i === 1 ? CLAY : FOREST}>{s.who.toUpperCase()}</text>
            <text x="24" y={y + 80} fontSize="14" fill={INK}>{s.how[0]} {s.how[1]}</text>
            <text x="24" y={y + 112} fontSize="11" fontWeight="700" letterSpacing="1" fill={MUTED}>VIEW KEY STAYS</text>
            <text x="24" y={y + 131} fontSize="14" fontWeight="600" fill={FOREST}>{s.key}</text>
          </g>
        );
      })}
      <text x="4" y="526" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={INK}>No MonkStash server sees your sales.</text>
    </svg>
  );
}

const GATEWAY = [
  { n: "1", title: "Your shop", a: "Asks for an", b: "invoice by API" },
  { n: "2", title: "MonkStash Pay", a: "Fresh address,", b: "price held" },
  { n: "3", title: "Checkout", a: "QR, amount,", b: "live status" },
  { n: "4", title: "Webhook", a: "Signed: this", b: "order is paid" },
];

/** The self-hosted gateway: shop, MonkStash Pay, customer, webhook. */
export function GatewayFlowArt() {
  return (
    <svg viewBox="0 0 560 330" role="img" aria-label="How MonkStash Pay works. One, your shop asks your MonkStash Pay server for an invoice, for example 19.99 euros for order 1001. Two, MonkStash Pay gives it a fresh subaddress and holds the price for 30 minutes. Three, the customer pays on the checkout page, which shows the QR code, amount and live status. Four, when the payment is confirmed, MonkStash Pay sends your shop a signed webhook, invoice paid. Everything runs on your own server with a view-only wallet that cannot spend." style={fit}>
      <text x="16" y="24" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>MONKSTASH PAY, ON YOUR OWN SERVER</text>
      <rect x="16" y="40" width="528" height="196" rx="6" fill={SOFT} stroke={FOREST} strokeWidth="1.2" strokeDasharray="5 4" />
      <text x="32" y="62" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill={FOREST}>YOUR SERVER, YOUR VIEW KEY</text>
      {GATEWAY.map((g, i) => {
        const x = 32 + i * 128;
        const key = i === 3;
        return (
          <g key={g.title}>
            <rect x={x} y="78" width="112" height="140" rx="4" fill={key ? FOREST : CARD} stroke={FOREST} strokeWidth="1.2" />
            <circle cx={x + 20} cy="100" r="11" fill={key ? "#fff" : FOREST} />
            <text x={x + 20} y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill={key ? FOREST : "#fff"}>{g.n}</text>
            <text x={x + 12} y="146" fontFamily={SERIF} fontStyle="italic" fontSize="13.5" fill={key ? "#fff" : INK}>{g.title}</text>
            <text x={x + 12} y="174" fontSize="11" fill={key ? "#dfe9e2" : INK}>{g.a}</text>
            <text x={x + 12} y="190" fontSize="11" fill={key ? "#dfe9e2" : INK}>{g.b}</text>
            {i < 3 ? <path d={`M${x + 113} 148 h13 m-5 -5 l5 5 l-5 5`} fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </g>
        );
      })}
      <rect x="16" y="252" width="258" height="62" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="30" y="276" fontSize="12" fontWeight="700" fill={FOREST}>View-only wallet</text>
      <text x="30" y="296" fontSize="11.5" fill={INK}>Sees payments, can never spend.</text>
      <rect x="286" y="252" width="258" height="62" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="300" y="276" fontSize="12" fontWeight="700" fill={CLAY}>No middleman</text>
      <text x="300" y="296" fontSize="11.5" fill={INK}>Money goes straight to your wallet.</text>
    </svg>
  );
}

export function GatewayFlowNarrow() {
  return (
    <svg viewBox="0 0 360 520" role="img" aria-label="How MonkStash Pay works, on your own server. One, your shop asks for an invoice. Two, MonkStash Pay makes a fresh subaddress and holds the price. Three, the customer pays on the checkout page. Four, your shop gets a signed webhook when it is paid. The wallet is view-only, and the money goes straight to you." style={fit}>
      <text x="4" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>ON YOUR OWN SERVER</text>
      <line x1="28" y1="48" x2="28" y2="318" stroke={FOREST} strokeWidth="1.4" />
      {GATEWAY.map((g, i) => {
        const y = 48 + i * 90;
        const key = i === 3;
        return (
          <g key={g.title}>
            <circle cx="28" cy={y} r="14" fill={key ? CLAY : FOREST} />
            <text x="28" y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{g.n}</text>
            <text x="56" y={y + 6} fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={key ? CLAY : INK}>{g.title}</text>
            <text x="56" y={y + 30} fontSize="14" fill={INK}>{g.a} {g.b}</text>
          </g>
        );
      })}
      <rect x="4" y="370" width="352" height="64" rx="4" fill={CARD} stroke={FOREST} strokeWidth="1.2" />
      <text x="20" y="396" fontSize="14" fontWeight="700" fill={FOREST}>View-only wallet</text>
      <text x="20" y="418" fontSize="13" fill={INK}>Sees payments, can never spend.</text>
      <rect x="4" y="444" width="352" height="64" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="20" y="470" fontSize="14" fontWeight="700" fill={CLAY}>No middleman</text>
      <text x="20" y="492" fontSize="13" fill={INK}>Money goes straight to your wallet.</text>
    </svg>
  );
}

/** Cashier mode: a tablet till, before and after. Single column, so it reads at any width. */
export function TillArt() {
  return (
    <svg viewBox="0 0 360 264" role="img" aria-label="Cashier mode on a tablet. On the left, the till shows a price of 4 euros 50 and a QR code for the customer to scan, with the price held for 14 minutes 59 seconds. On the right, a moment later, the same screen turns green and says Paid." style={fitNarrow}>
      <g>
        <rect x="8" y="16" width="164" height="236" rx="14" fill={INK} />
        <rect x="18" y="28" width="144" height="212" rx="6" fill={CARD} />
        <text x="30" y="52" fontSize="10" fontWeight="700" letterSpacing="1" fill={FOREST}>TABLE 4</text>
        <text x="30" y="84" fontFamily={SERIF} fontSize="28" fill={INK}>€4.50</text>
        <rect x="46" y="100" width="88" height="88" fill="#fff" stroke={INK} strokeWidth="1" />
        {[[52, 106], [110, 106], [52, 164]].map(([a, b]) => <rect key={`${a}${b}`} x={a} y={b} width="18" height="18" fill={INK} />)}
        {[[80, 112], [92, 124], [80, 140], [104, 136], [116, 150], [92, 158], [110, 170], [80, 172], [124, 124]].map(([a, b]) => <rect key={`${a}${b}`} x={a} y={b} width="7" height="7" fill={INK} />)}
        <rect x="30" y="202" width="120" height="26" rx="4" fill="#f1e3da" />
        <circle cx="42" cy="215" r="4" fill={CLAY} />
        <text x="52" y="219" fontSize="10" fill={INK}>Held for 14:59</text>
      </g>
      <path d="M180 134 h14 m-5 -5 l5 5 l-5 5" fill="none" stroke={FOREST} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <g>
        <rect x="200" y="16" width="152" height="236" rx="14" fill={INK} />
        <rect x="210" y="28" width="132" height="212" rx="6" fill={FOREST} />
        <circle cx="276" cy="100" r="28" fill="none" stroke="#fff" strokeWidth="3" />
        <Tick x={260} y={88} size={32} />
        <text x="276" y="166" textAnchor="middle" fontFamily={SERIF} fontSize="30" fill="#fff">Paid</text>
        <text x="276" y="192" textAnchor="middle" fontSize="13" fill="#dfe9e2">€4.50</text>
        <rect x="236" y="206" width="80" height="22" rx="4" fill="#fff" />
        <text x="276" y="221" textAnchor="middle" fontSize="10" fontWeight="700" fill={FOREST}>New sale</text>
      </g>
    </svg>
  );
}

/** Payment link: what the payer sees on their phone. */
export function PayLinkArt() {
  return (
    <svg viewBox="0 0 360 360" role="img" aria-label="A Monero payment link opened on a phone. It shows who is asking, Ana Studio, the price of 25 euros, the exact XMR amount converted at a held rate, a pay-by time, the note Logo design, a QR code, and buttons to open the payment in a wallet or go back to the shop." style={fitNarrow}>
      <rect x="92" y="8" width="176" height="340" rx="22" fill={INK} />
      <rect x="102" y="26" width="156" height="306" rx="10" fill={CARD} />
      <text x="116" y="50" fontSize="9" fontWeight="700" letterSpacing="1" fill={CLAY}>FROM ANA STUDIO</text>
      <text x="116" y="84" fontFamily={SERIF} fontSize="28" fill={INK}>€25.00</text>
      <text x="116" y="102" fontSize="10" fill={INK}>0.052568 XMR</text>
      <text x="116" y="116" fontSize="9.5" fill={MUTED}>Pay by Sat 17:00</text>
      <text x="116" y="134" fontSize="11" fill={INK}>Logo design</text>
      <rect x="140" y="142" width="80" height="80" fill="#fff" stroke={INK} strokeWidth="1" />
      {[[145, 147], [198, 147], [145, 200]].map(([a, b]) => <rect key={`${a}${b}`} x={a} y={b} width="17" height="17" fill={INK} />)}
      {[[170, 153], [182, 168], [170, 184], [192, 180], [204, 192], [182, 204], [204, 208]].map(([a, b]) => <rect key={`${a}${b}`} x={a} y={b} width="7" height="7" fill={INK} />)}
      <rect x="116" y="232" width="128" height="28" rx="5" fill={FOREST} />
      <text x="180" y="250" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">Open in my wallet</text>
      <rect x="116" y="268" width="128" height="26" rx="5" fill={CARD} stroke={FOREST} strokeWidth="1" />
      <text x="180" y="285" textAnchor="middle" fontSize="10" fontWeight="600" fill={INK}>Paid? Back to the shop</text>
      <text x="116" y="312" fontSize="8.5" fill={MUTED}>Details live in the link itself.</text>
      <text x="8" y="40" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>One link,</text>
      <text x="8" y="58" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>one fresh</text>
      <text x="8" y="76" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>address.</text>
      <text x="278" y="300" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>Works with</text>
      <text x="278" y="318" fontFamily={SERIF} fontStyle="italic" fontSize="12.5" fill={MUTED}>any wallet.</text>
    </svg>
  );
}

const WOO = [
  { title: "Place order", a: "Customer picks", b: "Monero (XMR)", color: FOREST },
  { title: "Pay", a: "On your MonkStash Pay", b: "checkout page", color: FOREST },
  { title: "Signed webhook", a: "Signature checked,", b: "then status re-checked", color: CLAY },
  { title: "Processing", a: "Order marked paid", b: "automatically", color: FOREST },
];

/** WooCommerce: from "Place order" to "Processing". */
export function WooFlowArt() {
  return (
    <svg viewBox="0 0 360 440" role="img" aria-label="How a WooCommerce order is paid in Monero. One, the customer places the order and picks Monero. Two, they pay on your MonkStash Pay checkout page. Three, MonkStash Pay sends a signed webhook; the plugin checks the signature and then asks MonkStash Pay for the real status before changing anything. Four, the order moves to Processing, paid, automatically. A check every five minutes covers any missed webhook." style={fitNarrow}>
      <text x="4" y="18" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={MUTED}>A WOOCOMMERCE ORDER, PAID IN XMR</text>
      <line x1="28" y1="50" x2="28" y2="320" stroke={FOREST} strokeWidth="1.4" />
      {WOO.map((s, i) => {
        const y = 50 + i * 90;
        return (
          <g key={s.title}>
            <circle cx="28" cy={y} r="14" fill={s.color} />
            {i === 3 ? <Tick x={20} y={y - 9} size={16} /> : <text x="28" y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{i + 1}</text>}
            <text x="56" y={y + 6} fontFamily={SERIF} fontStyle="italic" fontSize="19" fill={i === 2 ? CLAY : INK}>{s.title}</text>
            <text x="56" y={y + 30} fontSize="14" fill={INK}>{s.a} {s.b}</text>
          </g>
        );
      })}
      <rect x="4" y="372" width="352" height="56" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="20" y="396" fontSize="13" fontWeight="700" fill={FOREST}>Missed a webhook?</text>
      <text x="20" y="416" fontSize="12.5" fill={INK}>A check every 5 minutes catches it.</text>
    </svg>
  );
}
