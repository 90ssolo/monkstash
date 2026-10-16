import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { AtomicSwapArt, AtomicSwapNarrow } from "@/components/art/SwapBitcoinToMoneroArt";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "swap-bitcoin-to-monero",
  section: "guides",
  kicker: "Get Monero",
  title: "How to Swap Bitcoin to Monero (and Back)",
  seoTitle: "BTC to XMR Swap: Bitcoin to Monero and Back",
  summary: "Three ways to swap BTC to XMR, and back: atomic swaps, Haveno and instant exchanges, compared on trust, time, privacy and what can go wrong.",
  keyword: "btc to xmr swap",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "compare", label: "Three routes compared" },
    { id: "atomic", label: "How an atomic swap works" },
    { id: "atomic-steps", label: "Atomic swap step by step" },
    { id: "haveno", label: "Haveno and RetoSwap" },
    { id: "instant", label: "Instant exchanges" },
    { id: "back", label: "Going back: Monero to bitcoin" },
    { id: "safety", label: "Mistakes that cost money" },
    { id: "next", label: "Next steps" },
  ],
  related: ["buy-monero-without-kyc", "buy-monero", "receive-monero", "monero-subaddress"],
  sources: [
    { label: "eigenwallet: official site (formerly UnstoppableSwap)", href: "https://eigenwallet.org/" },
    { label: "eigenwallet docs: Overview", href: "https://docs.eigenwallet.org/" },
    { label: "eigenwallet docs: Install and verify the app", href: "https://docs.eigenwallet.org/getting_started/install_instructions" },
    { label: "eigenwallet docs: Your first swap", href: "https://docs.eigenwallet.org/getting_started/first_swap" },
    { label: "eigenwallet docs: Refund and punish", href: "https://docs.eigenwallet.org/advanced/refund_punish" },
    { label: "eigenwallet docs: Anti-spam deposit FAQ", href: "https://docs.eigenwallet.org/faq/anti_spam_deposit" },
    { label: "eigenwallet core repository (forked from comit-network/xmr-btc-swap)", href: "https://github.com/eigenwallet/core" },
    { label: "comit-network/xmr-btc-swap README (one direction: send BTC, receive XMR; unmaintained)", href: "https://github.com/comit-network/xmr-btc-swap" },
    { label: "Haveno docs: Trade protocol", href: "https://docs.haveno.exchange/overview/trade-protocol/" },
    { label: "Haveno: FAQ", href: "https://haveno.exchange/faq/" },
    { label: "RetoSwap: official site", href: "https://retoswap.com/" },
    { label: "Unchained: FixedFloat hacked for $26 million (February 2024)", href: "https://unchainedcrypto.com/crypto-exchange-fixedfloat-hacked-for-26-million-in-bitcoin-ether/" },
    { label: "The Record: German authorities take down eXch (May 2025)", href: "https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" },
  ],
  faq: [
    { q: "What is the safest way to swap BTC to XMR?", a: "An atomic swap, such as eigenwallet (formerly UnstoppableSwap), keeps either coin out of a middleman's hands: if the swap fails, you can refund your bitcoin. The one duty it gives you is to open the app during the refund window if a swap stalls." },
    { q: "Can I swap XMR to BTC with an atomic swap?", a: "Not with eigenwallet today. As of 2026-10-15 its docs describe only bitcoin to Monero. To go from XMR to BTC, sell XMR for BTC on a Haveno network such as RetoSwap, or use an instant exchange." },
    { q: "Is eigenwallet the same as UnstoppableSwap?", a: "Yes. eigenwallet says it was formerly called UnstoppableSwap, and its code is a fork of the comit-network xmr-btc-swap project. It is a desktop app for Windows, macOS and Linux." },
    { q: "How long does a BTC to XMR swap take?", a: "With an atomic swap, the bitcoin lock needs about 10 minutes to confirm, then the maker locks XMR. On Haveno it depends on the trade. Instant exchanges take minutes unless they hold your trade for review. Your received XMR becomes spendable after 10 Monero blocks, about 20 minutes." },
    { q: "Can I swap bitcoin to Monero without KYC?", a: "Yes. Atomic swaps and Haveno networks need no account or ID check, and some instant exchanges do not ask for ID up front, though they can at any time. Local laws still apply." },
    { q: "What happens if an atomic swap fails?", a: "After 24 Bitcoin blocks, about 4 hours, the swap can be cancelled. You then have about 24 hours to refund your bitcoin, and only you can do that. The app needs to run for a few minutes during that window." },
    { q: "Where should the Monero go after a swap?", a: "To a wallet where you hold the keys, ideally at a fresh subaddress used only for that swap. That way no counterparty can link your swaps to each other." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Holding bitcoin and want Monero?</strong> You do not need an exchange account to make the switch. A{" "}
        <mark>BTC to XMR swap can run straight between you and another trader</mark>, with code holding both sides until the
        trade is done.
      </p>
      <p>
        There are three ways to do it, and they are not equal. This guide compares them on trust, time, privacy and what
        can go wrong, then walks through the safest one. Every claim was checked against each project&apos;s own docs on
        2026-10-15.
      </p>

      <Takeaways items={[
        "Atomic swaps (eigenwallet) are the lowest-trust route from BTC to XMR, in that direction only.",
        "Haveno networks such as RetoSwap work both ways, with escrow and an arbitrator.",
        "Instant exchanges are fastest, but they hold your coins mid-trade.",
        "Always receive at a fresh subaddress in a wallet you control.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        To swap bitcoin to Monero, use an atomic swap app such as eigenwallet, place a trade on a Haveno network such as
        RetoSwap, or send BTC to an instant exchange. For the reverse, Monero to bitcoin, Haveno and instant exchanges work;
        eigenwallet&apos;s docs only describe the BTC to XMR direction. Whatever you pick,{" "}
        <mark>have your Monero address ready first</mark>: a fresh subaddress in a wallet where you hold the keys.
      </p>

      <h2 id="compare">Three routes compared</h2>
      <table>
        <caption>BTC to XMR swap routes (last checked 2026-10-15)</caption>
        <thead><tr><th>&nbsp;</th><th>Atomic swap (eigenwallet)</th><th>Haveno / RetoSwap</th><th>Instant exchange</th></tr></thead>
        <tbody>
          <tr><th>Trust model</th><td>Code on both chains; no one holds your coins</td><td>2-of-3 multisig escrow, arbitrator only in a dispute</td><td>You trust the company until it pays out</td></tr>
          <tr><th>Directions</th><td>BTC to XMR only</td><td>Both ways</td><td>Usually both ways</td></tr>
          <tr><th>Typical time</th><td>About 10 min for the BTC lock to confirm, then the XMR lock</td><td>Depends on the trade and the counterparty</td><td>Minutes, unless a review holds it</td></tr>
          <tr><th>Who sees what</th><td>The maker sees the swap; your BTC lock is public on Bitcoin</td><td>Your counterparty; the arbitrator only in a dispute</td><td>The service sees both your deposit and payout address</td></tr>
          <tr><th>Failure mode</th><td>Stalled swap: refund your BTC within the window</td><td>Unresponsive trader: arbitration</td><td>Frozen, hacked or seized service</td></tr>
          <tr><th>Account or ID</th><td>None</td><td>None (Haveno is non-KYC)</td><td>Varies; can be asked mid-trade</td></tr>
        </tbody>
      </table>
      <p>
        If you only remember one row, make it the trust model. The other two routes{" "}
        <mark>never let a company hold both sides of your trade</mark>.
      </p>
      <h3>Which one should you pick?</h3>
      <ul>
        <li><strong>You hold BTC on a computer you can come back to within a day:</strong> the atomic swap. It is the only route where no person or company can freeze the trade.</li>
        <li><strong>You want to go from XMR to BTC, or you want an arbitrator if a trade goes sideways:</strong> a Haveno network such as RetoSwap.</li>
        <li><strong>You are on a phone, the amount is small, and speed matters most:</strong> an instant exchange, with the risks below in mind.</li>
      </ul>
      <h3>A word on privacy</h3>
      <p>
        Bitcoin is a public ledger, so the BTC side of any swap is visible to anyone who looks: the coins you sent and where
        they went. The Monero side is not. Once the XMR reaches your wallet, the amount and your address are hidden on chain.
        That is why the receiving end matters so much. If you receive at an address you have used before, or at an
        exchange account tied to your name, you hand back some of the privacy you just paid for.
      </p>
      <p>
        One more honest point: a swap does not erase the history of the bitcoin you started with. If that bitcoin came from
        an exchange that knows who you are, the exchange can still see where it was sent. A swap changes what happens next,
        not what happened before.
      </p>

      <h2 id="atomic">How an atomic swap works</h2>
      <p>
        &quot;Atomic&quot; means all or nothing: either both sides get paid, or both get their coins back. eigenwallet,
        formerly UnstoppableSwap, is a desktop app for Windows, macOS and Linux built on the open-source{" "}
        <a href="https://github.com/eigenwallet/core" rel="noopener">xmr-btc-swap</a> code. You are the taker; a maker
        sells you XMR for your BTC at a rate it sets.
      </p>
      <p>
        Per its <a href="https://docs.eigenwallet.org/getting_started/first_swap" rel="noopener">first swap guide</a>, the
        swap runs in four moves. You lock your bitcoin in a 2-of-2 lock. The maker locks Monero. The maker claims your
        bitcoin, and that claim reveals the key you need. You use that key to claim the Monero.
      </p>
      <Figure caption="The four moves of a BTC to XMR atomic swap, and the refund window that protects you if it stalls.">
        <Adaptive wide={<AtomicSwapArt />} narrow={<AtomicSwapNarrow />} />
      </Figure>
      <h3>The safety net: refund and punish</h3>
      <p>
        If a swap stalls, the <a href="https://docs.eigenwallet.org/advanced/refund_punish" rel="noopener">refund rules</a>{" "}
        kick in. After 24 Bitcoin confirmations, about 4 hours, the swap can be cancelled. You then have a window of 144
        blocks, about 24 hours, in which <mark>only you can refund your bitcoin</mark>. The app does not need to run the
        whole time, only for a few minutes inside that window. If you stay offline for the entire window, the maker can
        claim your bitcoin as a penalty.
      </p>
      <p>
        There is also an anti-spam deposit, a small share of your BTC that matters only when a swap is refunded. The{" "}
        <a href="https://docs.eigenwallet.org/faq/anti_spam_deposit" rel="noopener">docs</a> say a maker can withhold it,
        though this is rare and hurts the maker&apos;s reputation.
      </p>

      <h2 id="atomic-steps">Atomic swap step by step</h2>
      <p>
        This is the shape of a swap, not a screen-by-screen tour. Apps change; follow the{" "}
        <a href="https://docs.eigenwallet.org/" rel="noopener">eigenwallet docs</a> for the current screens.
      </p>
      <Steps items={[
        { title: "Get your Monero address ready", body: <p><Link href={walletUrl}>Open your MonkStash wallet</Link> and make a new <Link href="/monero-subaddress">subaddress</Link> for this swap. MonkStash has no swap feature; it gives you the address the XMR should end up at.</p> },
        { title: "Install eigenwallet from the official source", body: <p>Use eigenwallet.org or its GitHub releases, and <a href="https://docs.eigenwallet.org/getting_started/install_instructions" rel="noopener">verify the GPG signature</a> before you run it.</p> },
        { title: "Deposit only what you want to swap", body: <p>The guide warns the app swaps all available bitcoin in its internal wallet. It suggests at least about 0.0003 BTC, with better rates from around 0.003 BTC.</p> },
        { title: "Compare offers", body: <p>Each maker shows a minimum, maximum, markup and anti-spam deposit. A lower markup means more XMR for your BTC.</p> },
        { title: "Confirm and keep the app available", body: <p>Review the final amounts and fees. Plan to be able to open the app within a day if the swap stalls.</p> },
        { title: "Move the XMR to your own address", body: <p>eigenwallet is also a Monero wallet. Once the swap completes, you can send the XMR on to your fresh MonkStash subaddress. It is spendable after 10 Monero blocks, about 20 minutes.</p> },
      ]} />

      <h2 id="haveno">Haveno and RetoSwap</h2>
      <p>
        <a href="https://haveno.exchange/" rel="noopener">Haveno</a> is open-source software for peer-to-peer trading over
        Tor, and RetoSwap is the best-known network running it. BTC is one of the payment methods listed on{" "}
        <a href="https://retoswap.com/" rel="noopener">RetoSwap&apos;s site</a>, and offers go both ways: people buying XMR
        and people selling it.
      </p>
      <p>
        Per the Haveno <a href="https://docs.haveno.exchange/overview/trade-protocol/" rel="noopener">trade protocol</a>,
        the XMR seller locks the coins plus a security deposit, the buyer locks a deposit too, and everything sits in a
        2-of-3 multisig wallet. The buyer sends the BTC directly, the seller confirms, and the XMR is released. The
        arbitrator holds the third key and steps in only if the traders disagree.
      </p>
      <p>
        <strong>Trade-offs.</strong> You need some XMR for a deposit, although sellers can offer no-deposit trades of up to
        1.5 XMR. RetoSwap lists a 0.8% taker fee for crypto trades on its site. It is slower than the other routes, because
        a human has to confirm your payment.
      </p>

      <h2 id="instant">Instant exchanges</h2>
      <p>
        An instant exchange gives you a deposit address. You send BTC, it sends XMR, usually within minutes. No app to
        install, no deposit. The price of that convenience is custody: <mark>between your deposit and your payout, the
        company holds your coins</mark>.
      </p>
      <p>That window is where things break:</p>
      <ul>
        <li><strong>Reviews:</strong> a deposit flagged by an anti-money-laundering check can be held until you show ID, even on a service with no account.</li>
        <li><strong>Hacks:</strong> FixedFloat <a href="https://unchainedcrypto.com/crypto-exchange-fixedfloat-hacked-for-26-million-in-bitcoin-ether/" rel="noopener">lost about $26 million</a> in February 2024, and users saw stuck transactions first.</li>
        <li><strong>Seizures:</strong> German authorities <a href="https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" rel="noopener">took eXch offline</a> on April 30, 2025 and seized its servers and crypto.</li>
      </ul>
      <p>
        If you use one, swap small amounts, keep the order ID, and never leave a balance there.
      </p>

      <h2 id="back">Going back: Monero to bitcoin</h2>
      <p>
        Many people want the reverse trip, often as an atomic swap from XMR to BTC. Here is the
        straight answer as of 2026-10-15: <mark>eigenwallet&apos;s docs describe only bitcoin to Monero</mark>. The original{" "}
        <a href="https://github.com/comit-network/xmr-btc-swap" rel="noopener">xmr-btc-swap</a> project, now unmaintained,
        also offered only that direction. For XMR to BTC today, your options are:
      </p>
      <ul>
        <li><strong>A Haveno network.</strong> Sell XMR for BTC as a maker or take someone&apos;s offer. Your XMR sits in multisig escrow, not with a company.</li>
        <li><strong>An instant exchange.</strong> Fast, with the custody risks above.</li>
      </ul>
      <p>
        Either way, send from your own wallet, and paste a bitcoin address you have checked twice. Crypto payments cannot be
        reversed.
      </p>

      <h2 id="safety">Mistakes that cost money</h2>
      <Callout kind="warn" title="Before you swap">
        Download apps only from official sites or GitHub, and verify signatures. Ignore anyone who messages you as
        &quot;support&quot;; eigenwallet&apos;s own docs warn about fake support accounts. Check the first and last six
        characters of every address you paste. Start with a small test swap. And on an atomic swap, make sure you can
        open the app within the refund window.
      </Callout>
      <p>
        Fake copies of crypto sites are a common trick. If a site looks like one of these projects but the
        address is slightly off, close it. Our guide to <Link href="/monero-phishing-sites">spotting fake Monero sites</Link>{" "}
        shows what to check.
      </p>
      <KeyFact label="One habit for every route">
        Receive each swap at a new subaddress. Counterparties then cannot link your trades to each other, and your own
        records stay clear.
      </KeyFact>

      <h2 id="next">Next steps</h2>
      <ol>
        <li><Link href={walletUrl}>Open your MonkStash wallet</Link> and back up your 25 words.</li>
        <li>Make a fresh subaddress for your first swap.</li>
        <li>No bitcoin yet? Read <Link href="/buy-monero">how to buy Monero</Link>, or <Link href="/buy-monero-without-kyc">how to buy Monero without KYC</Link>.</li>
        <li>Learn <Link href="/receive-monero">how receiving works</Link>, so you know when your XMR is spendable.</li>
      </ol>
    </>
  );
}
