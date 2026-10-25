import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ExchangeViewArt } from "@/components/art/WhyMoneroDelistedArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "why-monero-delisted",
  section: "learn",
  kicker: "Monero and exchanges",
  title: "Why Was Monero Delisted? Every Major Exchange, Dated and Sourced",
  seoTitle: "Why Was Monero Delisted? Dated Timeline",
  summary: "Why exchanges delisted Monero: the privacy that blocks their tracing tools, new rules, and listing reviews. A dated timeline from Coincheck to Kraken.",
  keyword: "why monero delisted",
  updated: "2026-10-25",
  readingMinutes: 8,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "timeline", label: "The delistings, dated" },
    { id: "why", label: "The four reasons behind them" },
    { id: "coinbase", label: "Why Coinbase never listed it" },
    { id: "kraken", label: "Can you still buy Monero on Kraken?" },
    { id: "means", label: "What it means for you" },
    { id: "next-rules", label: "What comes next: the EU in 2027" },
    { id: "next", label: "Next steps" },
  ],
  related: ["buy-monero", "is-monero-legal", "monero-eu-2027", "buy-monero-without-kyc"],
  sources: [
    { label: "Binance: Binance will delist ANT, MULTI, VAI and XMR on 2024-02-20", href: "https://www.binance.com/en/support/announcement/binance-will-delist-ant-multi-vai-xmr-on-2024-02-20-f73b083ba6834771b07dbe5319917ae5" },
    { label: "OKX: OKX to delist several spot trading pairs (29 December 2023)", href: "https://www.okx.com/help/okx-to-delist-several-spot-trading-pairs-12-29" },
    { label: "Kraken: Notice of asset delisting in Ireland and Belgium for Monero (XMR)", href: "https://support.kraken.com/hc/en-us/articles/notice-of-asset-delisting-in-ireland-and-belgium-for-monero-xmr" },
    { label: "Kraken: UK Monero (XMR) conversion FAQ", href: "https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" },
    { label: "Kraken: Support for Monero (XMR) in Europe", href: "https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" },
    { label: "Kraken: Notice of delisting XMR in Canada", href: "https://support.kraken.com/articles/notice-of-delisting-xmr-canada" },
    { label: "The Block: Binance adds a monitoring tag to Monero, Zcash and others (January 2024)", href: "https://www.theblock.co/post/270282/binance-monitoring-tag-monero-zcash" },
    { label: "Decrypt: Huobi to delist 7 privacy coins, citing the latest financial regulations (September 2022)", href: "https://decrypt.co/109513/crypto-exchange-huobi-delist-7-privacy-coins-citing-latest-financial-regulations" },
    { label: "Decrypt: Privacy coins drop after Bittrex delisting announcement (January 2021)", href: "https://decrypt.co/53024/privacy-coins-drop-10-after-bittrex-announcement" },
    { label: "Decrypt: Here's why Coinbase still hasn't listed Monero (July 2020)", href: "https://decrypt.co/36731/heres-why-coinbase-still-hasnt-listed-monero" },
    { label: "Cointelegraph: Another exchange delists Monero (Huobi Korea and Bithumb, 2020)", href: "https://cointelegraph.com/news/another-exchange-delists-monero-amidst-ongoing-sex-scandal" },
    { label: "Finance Magnates: Upbit to delist privacy coins over money laundering concerns (September 2019)", href: "https://www.financemagnates.com/cryptocurrency/news/upbit-to-delist-five-altcoins-due-to-money-laundering-concerns/" },
    { label: "Business Insider Japan: Coincheck to end handling of Monero and other privacy coins (May 2018)", href: "https://www.businessinsider.jp/article/167666/" },
    { label: "EUR-Lex: Regulation (EU) 2024/1624 (Anti-Money Laundering Regulation), Article 79", href: "https://eur-lex.europa.eu/eli/reg/2024/1624/oj" },
  ],
  faq: [
    { q: "Why was Monero delisted?", a: "Mostly because exchanges cannot trace it. Regulated exchanges must check where deposits come from, and the tracing tools they use for bitcoin see nothing useful on Monero, which hides senders, receivers and amounts by default. Some regulators also bar licensed firms from handling privacy coins, and some exchanges said XMR no longer met their listing criteria." },
    { q: "When did Binance delist Monero?", a: "Binance ended XMR trading on 20 February 2024, after announcing it on 6 February. Deposits stopped being credited after 21 February and withdrawals stayed open until 20 May 2024." },
    { q: "Is Monero illegal now?", a: "No, not for individuals in most countries. Delistings are decisions about what exchanges offer. Owning Monero and holding it in your own wallet remains legal in most places, though rules differ by country." },
    { q: "Why is Monero not on Coinbase?", a: "Coinbase has not listed XMR. In 2020 its CEO said he would personally like to list it but pointed to regulators as the obstacle." },
    { q: "Can I still buy Monero on Kraken?", a: "Not in the EEA, the UK or Canada, where Kraken removed it in 2024 and 2025, nor in Ireland and Belgium. Kraken's Monero page still offers it elsewhere, but it does not list regions, so check availability in your own account." },
    { q: "Is Monero dead after the delistings?", a: "No. The network keeps producing blocks about every two minutes and development continues in public, including the FCMP++ upgrade. Delistings changed where people buy XMR, not whether the coin works." },
    { q: "What happens to my Monero if my exchange delists it?", a: "Exchanges usually give a withdrawal window and then convert or freeze what is left. Kraken, for example, converted remaining XMR to bitcoin in the UK and EEA. Withdraw to a wallet you control as soon as a notice appears." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Logged in to buy Monero and found it gone?</strong> You are not alone. Since 2018, exchange after exchange has
        removed XMR, some worldwide and some only in certain countries. The reason is not that Monero broke or became illegal.
        It is that <mark>Monero does its job too well for an exchange&apos;s compliance team</mark>.
      </p>
      <p>
        Below is every major delisting we could date, each linked to the exchange&apos;s own notice where one still exists,
        the four reasons behind them, and what it all means for the coins in your wallet.
      </p>

      <Takeaways items={[
        "Exchanges must trace deposits. Monero hides the data their tracing tools need.",
        "Some regulators (Japan, South Korea, Dubai, the EU from 2027) keep privacy coins off licensed platforms.",
        "Delistings limit where you buy. They do not make owning Monero illegal in most countries.",
        "If your exchange posts a notice, withdraw to your own wallet before the deadline.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        Monero was delisted because <mark>exchanges cannot trace it</mark>. Regulated exchanges have to show where customer
        funds come from and go to. On bitcoin they buy blockchain analysis that scores every deposit. Monero hides senders,
        receivers and amounts by default, so those tools have almost nothing to work with. Some exchanges decided the
        compliance risk was not worth it, some regulators made the choice for them, and a few simply said XMR no longer met
        their listing criteria.
      </p>
      <Figure caption="Why compliance teams struggle: the checks they run on bitcoin find nothing on Monero.">
        <ExchangeViewArt />
      </Figure>

      <h2 id="timeline">The delistings, dated</h2>
      <p>
        Exchange notices disappear when exchanges close, so we mark which entries rest on the exchange&apos;s own page and
        which on dated news reports.
      </p>
      <table>
        <caption>Major Monero delistings (checked 2026-10-25)</caption>
        <thead><tr><th>Date</th><th>Exchange</th><th>Where</th><th>What happened</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>18 June 2018</td><td>Coincheck</td><td>Japan</td><td>Stopped handling XMR, ZEC, DASH and REP; balances converted to yen</td><td><a href="https://www.businessinsider.jp/article/167666/" rel="noopener">News</a></td></tr>
          <tr><td>30 September 2019</td><td>Upbit</td><td>South Korea</td><td>Delisted XMR and other privacy coins, citing money laundering risk</td><td><a href="https://www.financemagnates.com/cryptocurrency/news/upbit-to-delist-five-altcoins-due-to-money-laundering-concerns/" rel="noopener">News</a></td></tr>
          <tr><td>April to June 2020</td><td>Huobi Korea, Bithumb</td><td>South Korea</td><td>Both dropped XMR; Bithumb cited low trading volume</td><td><a href="https://cointelegraph.com/news/another-exchange-delists-monero-amidst-ongoing-sex-scandal" rel="noopener">News</a></td></tr>
          <tr><td>15 January 2021</td><td>Bittrex</td><td>Worldwide</td><td>Closed its XMR markets, with no reason given</td><td><a href="https://decrypt.co/53024/privacy-coins-drop-10-after-bittrex-announcement" rel="noopener">News</a></td></tr>
          <tr><td>19 September 2022</td><td>Huobi (now HTX)</td><td>Worldwide</td><td>Removed seven privacy coins, citing the latest financial regulations</td><td><a href="https://decrypt.co/109513/crypto-exchange-huobi-delist-7-privacy-coins-citing-latest-financial-regulations" rel="noopener">News</a></td></tr>
          <tr><td>5 January 2024</td><td>OKX</td><td>Worldwide</td><td>Ended XMR trading pairs, saying they did not fulfil its listing criteria</td><td><a href="https://www.okx.com/help/okx-to-delist-several-spot-trading-pairs-12-29" rel="noopener">OKX notice</a></td></tr>
          <tr><td>20 February 2024</td><td>Binance</td><td>Worldwide</td><td>Ended XMR trading after a monitoring tag in January; withdrawals open until 20 May 2024</td><td><a href="https://www.binance.com/en/support/announcement/binance-will-delist-ant-multi-vai-xmr-on-2024-02-20-f73b083ba6834771b07dbe5319917ae5" rel="noopener">Binance notice</a></td></tr>
          <tr><td>10 June 2024</td><td>Kraken</td><td>Ireland, Belgium</td><td>Delisted XMR; remaining balances converted to bitcoin</td><td><a href="https://support.kraken.com/hc/en-us/articles/notice-of-asset-delisting-in-ireland-and-belgium-for-monero-xmr" rel="noopener">Kraken notice</a></td></tr>
          <tr><td>30 July 2024</td><td>Kraken</td><td>United Kingdom</td><td>Converted remaining UK XMR balances to bitcoin</td><td><a href="https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" rel="noopener">Kraken FAQ</a></td></tr>
          <tr><td>31 October 2024</td><td>Kraken</td><td>EEA</td><td>Halted XMR trading and deposits &quot;due to regulatory changes&quot;; balances converted after 31 December</td><td><a href="https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" rel="noopener">Kraken notice</a></td></tr>
          <tr><td>2 September 2025</td><td>Kraken</td><td>Canada</td><td>Disabled XMR trading, citing Canadian compliance requirements</td><td><a href="https://support.kraken.com/articles/notice-of-delisting-xmr-canada" rel="noopener">Kraken notice</a></td></tr>
        </tbody>
      </table>
      <p>
        Lists online that claim dozens of delistings in a single year usually do not cite anything. We left out every entry
        we could not tie to a notice or a dated report.
      </p>

      <h2 id="why">The four reasons behind them</h2>
      <h3>1. Blockchain analysis does not work on Monero</h3>
      <p>
        Exchanges screen deposits with tracing software that follows coins from address to address. On Monero, ring
        signatures hide the real sender, <Link href="/monero-stealth-address">stealth addresses</Link> hide the receiver, and
        amounts are hidden too. Our guide to <Link href="/how-monero-works">how Monero works</Link> explains each piece. The
        result: <mark>a compliance team cannot show a regulator where an XMR deposit came from</mark>, which is exactly what
        money laundering rules ask of them.
      </p>
      <h3>2. Rules on passing customer data along</h3>
      <p>
        International standards ask exchanges to send sender and receiver details with transfers between them, known as the
        travel rule. That is hard to square with a coin built to hide both. Upbit cited money laundering risk in 2019, Huobi
        pointed to the latest financial regulations in 2022, and Kraken said regulatory changes left it no choice in the EEA.
      </p>
      <h3>3. Regulators that decided for the exchanges</h3>
      <p>
        In some places the regulator settled it. South Korea, Dubai and Dubai&apos;s financial centre (DIFC) bar licensed
        firms from handling privacy coins, and Japan&apos;s exchange association does not allow coins whose transfers cannot
        be traced. Our <Link href="/is-monero-legal">country-by-country legal guide</Link> links each rule.
      </p>
      <h3>4. Plain business reviews</h3>
      <p>
        Not every delisting names regulation. OKX said its XMR pairs no longer met its listing criteria, Binance said it
        delists assets that no longer meet its standards, and Bithumb cited falling volume. When a coin brings compliance
        cost and modest trading fees, <mark>dropping it is the easy business decision</mark>.
      </p>

      <h2 id="coinbase">Why Coinbase never listed it</h2>
      <p>
        Coinbase has not listed XMR. In a 2020 podcast its CEO said he would personally like to, but{" "}
        <a href="https://decrypt.co/36731/heres-why-coinbase-still-hasnt-listed-monero" rel="noopener">pointed to regulators</a>{" "}
        as the obstacle. Nothing since suggests a change, and the EU rule below makes one less likely for European users.
      </p>

      <h2 id="kraken">Can you still buy Monero on Kraken?</h2>
      <p>
        Not in the EEA, the United Kingdom, Canada, Ireland or Belgium: Kraken&apos;s own notices cover each of those. Its
        Monero price page still offers to buy XMR, but it does not say in which regions, so{" "}
        <mark>check your own account before you send money</mark>. Our <Link href="/buy-monero">guide to buying Monero</Link>{" "}
        covers the other routes, and <Link href="/buy-monero-without-kyc">buying without KYC</Link> covers peer-to-peer
        options that do not depend on any exchange listing.
      </p>

      <h2 id="means">What it means for you</h2>
      <ul>
        <li><strong>Owning Monero stays legal in most countries.</strong> Delistings are about what businesses offer, not what you may hold.</li>
        <li><strong>The network does not care.</strong> Blocks keep coming about every two minutes, and development continues, including the <Link href="/monero-fcmp">FCMP++ upgrade</Link>.</li>
        <li><strong>Coins on an exchange are at risk of a deadline.</strong> Kraken converted leftover XMR to bitcoin in the UK and EEA. Keep your XMR in a wallet where you hold the keys.</li>
        <li><strong>Getting in and out takes more planning.</strong> Swaps, peer-to-peer trades and the exchanges that still list XMR remain. Our guides to <Link href="/swap-bitcoin-to-monero">swapping bitcoin to Monero</Link> and <Link href="/sell-monero">selling Monero</Link> compare them.</li>
      </ul>
      <Callout kind="warn" title="Delisting notices attract scammers">
        When an exchange announces a delisting, fake &quot;migration&quot; sites and support accounts appear, asking for
        your login or your recovery words. A real exchange never asks for your wallet&apos;s seed. Our{" "}
        <Link href="/monero-phishing-sites">phishing guide</Link> shows how to check.
      </Callout>

      <h2 id="next-rules">What comes next: the EU in 2027</h2>
      <KeyFact label="10 July 2027">
        The EU&apos;s Anti-Money Laundering Regulation stops banks and crypto-asset service providers from keeping accounts
        that allow anonymity-enhancing coins. It targets those firms, not individuals with their own wallets.
      </KeyFact>
      <p>
        The rule is Article 79 of{" "}
        <a href="https://eur-lex.europa.eu/eli/reg/2024/1624/oj" rel="noopener">Regulation (EU) 2024/1624</a>. Expect the remaining EU platforms to drop XMR before that date. Our guide to{" "}
        <Link href="/monero-eu-2027">Monero and the EU&apos;s 2027 rules</Link> explains what changes and what does not.
      </p>

      <h2 id="next">Next steps</h2>
      <ul>
        <li>Move any XMR off an exchange into a wallet you control. You can <Link href={walletUrl}>open MonkStash</Link> in your browser in about two minutes.</li>
        <li>Find a route that still works where you live in <Link href="/buy-monero">how to buy Monero</Link>.</li>
        <li>Check your country in <Link href="/is-monero-legal">is Monero legal?</Link></li>
      </ul>
      <p className="small muted">General information, not legal or financial advice. Exchange policies change; the dates above were checked on 25 October 2026.</p>
    </>
  );
}
