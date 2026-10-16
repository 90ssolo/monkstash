import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { Article79ScopeArt, Article79ScopeNarrow, EuTimelineArt, EuTimelineNarrow } from "@/components/art/MoneroEu2027Art";
import { walletUrl } from "@/lib/site";

const AMLR = "https://publications.europa.eu/resource/celex/32024R1624";

export const meta: ArticleMeta = {
  slug: "monero-eu-2027",
  section: "learn",
  kicker: "Rules and access",
  title: "Monero and the EU's 2027 Rules: What Changes and What Does Not",
  seoTitle: "Monero and the EU 2027 Rules: What Changes",
  summary: "From 10 July 2027, EU exchanges may not keep accounts that allow anonymity-enhancing coins. What the AMLR says, and what it leaves out about you.",
  keyword: "monero eu 2027",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "what-text-says", label: "What Article 79 actually says" },
    { id: "timeline", label: "The timeline" },
    { id: "buying-selling", label: "Buying and selling" },
    { id: "merchants", label: "Merchants and businesses" },
    { id: "self-custody", label: "Self-custody" },
    { id: "open", label: "What is still open" },
    { id: "next", label: "Next steps" },
  ],
  related: ["is-monero-legal", "buy-monero", "accept-monero-payments", "buy-monero-without-kyc"],
  faq: [
    { q: "Is Monero banned in the EU from 2027?", a: "Not in the sense of a ban on owning it, in our reading. Article 79 of Regulation (EU) 2024/1624 prohibits credit institutions, financial institutions and crypto-asset service providers from keeping accounts that allow anonymisation, including through anonymity-enhancing coins. It applies from 10 July 2027. It does not contain a rule addressed to individuals holding coins. This is not legal advice." },
    { q: "What date does the EU privacy coin rule apply from?", a: "Article 90 of the AMLR says the regulation applies from 10 July 2027 (with a later date, 10 July 2029, only for football agents and professional football clubs). Article 79 is part of it." },
    { q: "Is Monero legal in the EU?", a: "We found no EU rule that makes holding Monero illegal for individuals. The EU rules we read govern regulated businesses such as exchanges. National laws, tax rules and court decisions can add more, so check your own country or ask a lawyer." },
    { q: "Can I still keep Monero in my own wallet after 2027?", a: "The text of Article 79 addresses obliged entities, not people holding their own keys. Recital 160 adds that the prohibition does not apply to providers of hardware, software or self-hosted wallets insofar as they have no access to or control over those wallets. That is our reading of the text, not legal advice." },
    { q: "Why did Kraken delist Monero in Europe?", a: "Kraken said it had no choice but to delist XMR in the European Economic Area due to regulatory changes. Trading and deposits for EEA clients stopped on 31 October 2024, and remaining balances were converted to BTC after the 31 December 2024 withdrawal deadline." },
    { q: "Does MiCA already restrict Monero?", a: "MiCA Article 76(3) requires trading platforms to prevent admission of crypto-assets with an inbuilt anonymisation function unless the holders and their transaction history can be identified. MiCA has applied since 30 December 2024, so this rule is already in force for trading platforms." },
    { q: "What is the AMLR?", a: "The Anti-Money Laundering Regulation, Regulation (EU) 2024/1624, on preventing the use of the financial system for money laundering or terrorist financing. It sets duties for obliged entities such as banks, financial institutions and crypto-asset service providers. It was adopted on 31 May 2024 and published on 19 June 2024." },
  ],
  sources: [
    { label: "Regulation (EU) 2024/1624 (AMLR), official text via the EU Publications Office: Articles 2, 3, 40, 79, 90 and recital 160", href: AMLR },
    { label: "Regulation (EU) 2023/1114 (MiCA), official text via the EU Publications Office: Articles 76, 143 and 149", href: "https://publications.europa.eu/resource/celex/32023R1114" },
    { label: "Kraken: Support for Monero (XMR) in Europe", href: "https://support.kraken.com/articles/support-for-monero-xmr-in-europe" },
    { label: "AMLA: About AMLA and setup timeline", href: "https://www.amla.europa.eu/about-amla_en" },
    { label: "AMLA: Public consultations", href: "https://www.amla.europa.eu/policy/public-consultations_en" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        You may have read that the EU will ban Monero in 2027. The real rule is narrower, and the difference matters. From{" "}
        <strong>10 July 2027</strong>, EU banks, financial firms and crypto exchanges <mark>may not keep accounts that hide who owns
        them or obscure transactions, including through anonymity-enhancing coins</mark>. We read the regulation&apos;s own text so you
        do not have to. Here is what it says, what it leaves out, and what it means for buying, selling, getting paid and keeping
        XMR in your own wallet.
      </p>

      <Callout title="Our reading in 20 seconds (not legal advice)">
        Article 79 of Regulation (EU) 2024/1624 applies to <strong>obliged entities</strong>: credit institutions, financial
        institutions and crypto-asset service providers such as exchanges and custodians. The text contains <strong>no rule
        addressed to individuals</strong> who hold Monero in a self-custody wallet, and its recital 160 says the ban does not apply to
        wallet software providers that have no access to or control over users&apos; wallets. This is our reading of the text, not legal
        advice. Reviewed 2026-10-15.
      </Callout>

      <Takeaways items={[
        "The rule targets regulated businesses, not people. It starts on 10 July 2027.",
        "EU exchanges are where the change lands. Some acted early: Kraken stopped XMR for EEA clients in October 2024.",
        "A separate rule in MiCA has applied to trading platforms since 30 December 2024.",
        "Holding XMR in your own wallet is not addressed by Article 79. National law can still add rules.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        The EU&apos;s Anti-Money Laundering Regulation (AMLR) does not name Monero. It uses a category instead. Article 2 defines{" "}
        <em>anonymity-enhancing coins</em> as &quot;crypto-assets that have built-in features designed to make crypto-asset transfer
        information anonymous, either systematically or optionally.&quot; Monero hides senders, receivers and amounts by default,
        which fits that description in our reading, though no EU text we read lists coins by name.
      </p>
      <p>
        The prohibition then lands on the businesses that handle customer accounts. That is why the practical effect is about{" "}
        <mark>where you can buy and sell</mark>, not whether you can own.
      </p>
      <table>
        <thead><tr><th>What you do</th><th>Addressed by Article 79?</th><th>Our reading of the text</th></tr></thead>
        <tbody>
          <tr><td>Hold XMR in a wallet where you control the keys</td><td>No</td><td>No rule in the AMLR is addressed to you as a holder</td></tr>
          <tr><td>Send XMR to a friend&apos;s own wallet</td><td>No</td><td>No obliged entity sits in the middle</td></tr>
          <tr><td>Buy or sell XMR on an EU-regulated exchange</td><td>Yes</td><td>The exchange may not keep such accounts from 10 July 2027</td></tr>
          <tr><td>Keep XMR with an EU custodian or broker</td><td>Yes</td><td>Same rule: it binds the provider holding the account</td></tr>
          <tr><td>Use wallet software that never touches your keys</td><td>No</td><td>Recital 160 leaves such providers out</td></tr>
          <tr><td>Withdraw from an exchange to your own wallet</td><td>Partly</td><td>Article 40 lets the exchange check who controls the address</td></tr>
        </tbody>
      </table>
      <p>
        The idea itself is not new. The earlier EU directive, (EU) 2015/849, already banned anonymous accounts and passbooks, and the
        AMLR&apos;s own correlation table maps that rule to Article 79(1). What the 2024 text adds is crypto: it names anonymous
        crypto-asset accounts and anonymity-enhancing coins as ways an account can become anonymous.
      </p>

      <h2 id="what-text-says">What Article 79 actually says</h2>
      <p>
        Article 79(1) of the <a href={AMLR} rel="noopener">AMLR</a>, in the official English text, reads:
      </p>
      <blockquote>
        &quot;Credit institutions, financial institutions and crypto-asset service providers shall be prohibited from keeping
        anonymous bank and payment accounts, anonymous passbooks, anonymous safe-deposit boxes or anonymous crypto-asset accounts as
        well as any account otherwise allowing for the anonymisation of the customer account holder or the anonymisation or
        increased obfuscation of transactions, including through anonymity-enhancing coins.&quot;
      </blockquote>
      <p>Three details in the wider text shape how far it reaches:</p>
      <ul>
        <li>
          <strong>Who it binds.</strong> The subjects of the sentence are credit institutions, financial institutions and crypto-asset
          service providers. Article 2 lists crypto-asset service providers among financial institutions, and Article 3 makes
          financial institutions obliged entities.
        </li>
        <li>
          <strong>What recital 160 adds.</strong> It explains the aim (traceability of crypto transfers) and says the prohibition
          &quot;does not apply to providers of hardware and software or providers of self-hosted wallets insofar as they do not possess
          access to or control over those crypto-asset wallets.&quot;
        </li>
        <li>
          <strong>Self-hosted addresses are handled elsewhere.</strong> Article 40 tells crypto-asset service providers to assess and
          reduce the risk of transfers to and from self-hosted addresses, for example by identifying the person on the other side or
          asking where funds come from. It does not ban such transfers.
        </li>
      </ul>
      <Figure caption="Where Article 79 reaches, in our reading: the regulated businesses in the dashed box, not people moving coins between their own wallets.">
        <Adaptive wide={<Article79ScopeArt />} narrow={<Article79ScopeNarrow />} />
      </Figure>

      <h2 id="timeline">The timeline</h2>
      <Figure caption="Key dates for EU crypto rules that touch Monero.">
        <Adaptive wide={<EuTimelineArt />} narrow={<EuTimelineNarrow />} />
      </Figure>
      <table>
        <thead><tr><th>Date</th><th>What happened or happens</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>31 May 2024</td><td>AMLR adopted; published in the Official Journal on 19 June 2024</td><td>AMLR text; AMLA</td></tr>
          <tr><td>26 June 2024</td><td>AMLA, the new EU anti-money laundering authority, legally established</td><td>AMLA</td></tr>
          <tr><td>31 October 2024</td><td>Kraken halts XMR trading and deposits for EEA clients &quot;due to regulatory changes&quot;</td><td>Kraken</td></tr>
          <tr><td>30 December 2024</td><td>MiCA applies, including its rule on trading platforms and coins with an inbuilt anonymisation function</td><td>MiCA Art. 149</td></tr>
          <tr><td>1 July 2026</td><td>Latest end of MiCA&apos;s transitional period for providers already operating</td><td>MiCA Art. 143</td></tr>
          <tr><td>10 July 2027</td><td>AMLR applies, including Article 79; AMLA guidelines on self-hosted address measures due by this date</td><td>AMLR Arts. 90, 40</td></tr>
          <tr><td>During 2028</td><td>AMLA plans to start direct supervision</td><td>AMLA timeline</td></tr>
        </tbody>
      </table>
      <KeyFact label="The date to remember">
        10 July 2027. Article 90 of the AMLR: &quot;It shall apply from 10 July 2027&quot;, with a later date only for football agents and
        professional football clubs.
      </KeyFact>

      <h2 id="buying-selling">Buying and selling</h2>
      <p>
        This is where you will feel it. An EU-regulated exchange or broker is a crypto-asset service provider, so from 10 July 2027
        it may not keep accounts that allow obfuscation through anonymity-enhancing coins. Some platforms acted
        early. <a href="https://support.kraken.com/articles/support-for-monero-xmr-in-europe" rel="noopener">Kraken</a> halted
        XMR trading and deposits for EEA clients on 31 October 2024, set a withdrawal deadline of 31 December 2024, and converted
        remaining XMR to BTC.
      </p>
      <p>
        There is also a rule that is already live. MiCA Article 76(3) requires a trading platform&apos;s rules to &quot;prevent the
        admission to trading of crypto-assets that have an inbuilt anonymisation function unless the holders of those crypto-assets and
        their transaction history can be identified.&quot; MiCA has applied since 30 December 2024.
      </p>
      <p>
        What this means for you: expect <mark>fewer regulated on-ramps for XMR in the EU</mark>, and treat any EU platform that still
        lists it as something to check, not assume. Our guide to <Link href="/buy-monero">buying Monero</Link> covers the routes
        people use, including swapping from another coin, and the trade-offs of each.
      </p>

      <h2 id="merchants">Merchants and businesses</h2>
      <p>
        A shop that accepts XMR straight into its own wallet is not, by that act, a crypto-asset service provider in our reading. The
        rule bites at the edges:
      </p>
      <ul>
        <li><strong>Cashing out.</strong> If you convert XMR to euros through an EU exchange, that exchange is bound by Article 79 from 10 July 2027, and may already have stopped supporting XMR.</li>
        <li><strong>Payment processors.</strong> A third party that holds funds for you may be a regulated provider with its own limits. A non-custodial setup, where payments go straight to your wallet, keeps that middle layer out.</li>
        <li><strong>Your own duties.</strong> Some businesses are obliged entities in their own right under Article 3, for example traders in high-value goods or precious metals. If that is you, you have anti-money laundering duties whatever the payment method. Ask a professional.</li>
      </ul>
      <p>
        If you want to take Monero without a middleman, see <Link href="/accept-monero-payments">how to accept Monero payments</Link>{" "}
        and our <Link href="/business">tools for businesses</Link>, where payments land directly in a wallet you control.
      </p>

      <h2 id="self-custody">Self-custody</h2>
      <p>
        Article 79 is written for institutions that keep accounts for customers. A self-custody wallet is not an account someone keeps
        for you: you hold the keys. We found nothing in the AMLR that addresses individuals holding Monero in their own wallet, and
        recital 160 explicitly leaves out wallet software providers with no access to or control over users&apos; wallets.
      </p>
      <p>
        That is also how MonkStash is built. Our <Link href={walletUrl}>non-custodial web wallet</Link> creates and encrypts your keys
        on your device, and we never hold them. That design is about your security first, and it also matches the line the text draws.
      </p>
      <Callout kind="warn" title="Where self-custody meets the rules">
        Sending XMR from your wallet to an EU exchange, or withdrawing to it, involves that exchange, and Article 40 lets it ask who
        controls a self-hosted address and where funds came from. Your country&apos;s tax rules apply too. Owning a coin in your own wallet does not exempt you from either.
      </Callout>

      <h2 id="open">What is still open</h2>
      <p>The text is final, but how it is applied is not fully settled. As of 15 October 2026:</p>
      <ul>
        <li>
          <strong>Guidelines on self-hosted addresses.</strong> Article 40(2) requires AMLA to issue guidelines on these measures by
          10 July 2027. AMLA&apos;s <a href="https://www.amla.europa.eu/policy/public-consultations_en" rel="noopener">consultations page</a>{" "}
          listed 11 consultations when we checked, none of them on these guidelines yet.
        </li>
        <li>
          <strong>Other technical standards.</strong> AMLA has consulted on draft standards that shape everyday checks, including
          customer due diligence (open from 9 February to 8 May 2026). Final versions still need to be adopted.
        </li>
        <li>
          <strong>How &quot;increased obfuscation&quot; is read.</strong> The text does not list coins. National supervisors, and from
          2028 AMLA for directly supervised firms, will apply the definition in practice.
        </li>
        <li>
          <strong>National law.</strong> The AMLR sets EU-wide duties for businesses. It does not stop a country from having its own
          rules on other matters, such as tax. Check where you live, and see <Link href="/is-monero-legal">is Monero legal</Link> for
          the wider picture.
        </li>
      </ul>
      <p>
        One more practical note from AMLA itself: it says it will not issue fines, fees or sanctions on individual citizens, and that
        anyone contacting you in its name to offer a refund or recovery is attempting a scam.
      </p>
      <Callout title="Not legal advice">
        This page explains our reading of the published texts. It is not legal advice, and it does not cover every country&apos;s
        national rules. Laws and their interpretation change. Reviewed 2026-10-15.
      </Callout>

      <h2 id="next">Next steps</h2>
      <p>
        If you hold XMR on an EU exchange, check that exchange&apos;s notices now rather than in July 2027, and consider moving coins
        you mean to keep into a wallet where you hold the keys. You can <Link href={walletUrl}>open a MonkStash wallet</Link> in your
        browser in a few minutes. Then read <Link href="/is-monero-legal">is Monero legal</Link> for the rules beyond the EU, and{" "}
        <Link href="/buy-monero">how to buy Monero</Link> for the routes still open to you.
      </p>
    </>
  );
}
