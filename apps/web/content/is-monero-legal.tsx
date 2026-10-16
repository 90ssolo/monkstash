import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { walletUrl } from "@/lib/site";
import { LEGALITY_CHECKED, LEGALITY_ROWS } from "@/lib/legality";

function checkedLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function LegalityTable() {
  return (
    <table>
      <caption>Monero rules in 15 jurisdictions, checked {checkedLabel(LEGALITY_CHECKED)}</caption>
      <thead>
        <tr><th scope="col">Country</th><th scope="col">Owning and using</th><th scope="col">Exchange access</th><th scope="col">Notable rules</th><th scope="col">Tax</th><th scope="col">Source</th></tr>
      </thead>
      <tbody>
        {LEGALITY_ROWS.map((r) => (
          <tr key={r.id} id={r.id}>
            <th scope="row">{r.country}</th>
            <td>{r.owning}</td>
            <td>{r.exchanges}</td>
            <td>{r.notable}</td>
            <td>
              {r.tax}
              {r.taxLink ? <> <a href={r.taxLink.href} rel="noopener">{r.taxLink.label}</a></> : null}
            </td>
            <td>
              <a href={r.source.href} rel="noopener">{r.source.label}</a>
              {r.more?.map((m) => <span key={m.href}>; <a href={m.href} rel="noopener">{m.label}</a></span>)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const meta: ArticleMeta = {
  slug: "is-monero-legal",
  section: "learn",
  kicker: "Rules and access",
  title: "Is Monero Legal? Country-by-Country Guide (2026)",
  seoTitle: "Is Monero Legal? Country-by-Country Guide (2026)",
  summary: "Is Monero legal? In the 15 jurisdictions we checked, rules mostly target exchanges, not owners. Dated, sourced table for the US, UK, EU, Canada and more.",
  keyword: "is monero legal",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "countries", label: "Is Monero legal? Country by country" },
    { id: "holding", label: "Holding vs buying" },
    { id: "delist", label: "Why exchanges delisted it" },
    { id: "eu-2027", label: "The EU's 2027 rule" },
    { id: "compare", label: "Privacy vs illegal" },
    { id: "taxes", label: "Taxes and reporting" },
    { id: "wallets", label: "Does using a wallet break any rules?" },
    { id: "check", label: "How to check your own rules" },
    { id: "bottom", label: "The bottom line" },
  ],
  related: ["monero-eu-2027", "what-is-monero", "buy-monero", "is-monero-traceable"],
  faq: [
    { q: "Is it illegal to own Monero?", a: "In the 15 jurisdictions we checked, we found no rule that makes it illegal for an individual to own Monero, though Russia now restricts transfers to self-custody wallets. Most rules restrict exchanges and other licensed firms, which affects access rather than ownership. This is not legal advice." },
    { q: "Is Monero legal in the US?", a: "Yes. FinCEN's 2019 guidance says a person who uses privacy coins to pay for goods or services on their own behalf is not a money transmitter, and exchanges may accept them if they verify identities. The IRS treats it like other digital assets: as property for tax." },
    { q: "Is Monero legal in the UK?", a: "Owning it is not banned; the FCA's money laundering rules apply to cryptoasset businesses, which must register. Buying is harder: Kraken's UK entity no longer supports XMR and converted UK balances to BTC on 30 July 2024." },
    { q: "Is Monero legal in the EU?", a: "Yes for individuals; EU rules restrict regulated firms, and MiCA already bars trading platforms from admitting coins with a built-in anonymisation function unless holders can be identified. From 10 July 2027, AMLR Article 79 prohibits crypto-asset service providers from handling anonymity-enhancing coins." },
    { q: "Is Monero legal in Australia?", a: "We found no Australian rule against individuals owning Monero and no national rule specific to privacy coins. Exchanges are supervised by AUSTRAC, so check its register and the ATO's crypto guidance before you buy or sell." },
    { q: "Is Monero legal in Canada?", a: "We found no Canadian rule against individuals owning Monero; businesses that exchange virtual currency must register with FINTRAC. Buying is harder: Kraken disabled XMR trading on 2 September 2025, citing Canadian compliance requirements." },
    { q: "Is Monero banned?", a: "Not for individuals in the countries we checked, with Russia's new limits on self-custody transfers as the main exception. Some regulators ban licensed firms from handling privacy coins, including Japan's exchange body, South Korea, Dubai and the DIFC, and the EU from July 2027." },
    { q: "Why was Monero removed from some exchanges?", a: "Usually because of compliance. Privacy features make it harder for an exchange to run the monitoring checks regulators expect, and some rules now bar licensed firms from handling privacy coins. The coin itself keeps working in your own wallet." },
    { q: "Do I have to pay tax on Monero?", a: "In most countries we checked, yes, when you sell, swap or spend it, and Monero is treated like other crypto. Each row in our table links the tax authority's own guidance. Ask a local tax professional for your situation." },
  ],
  sources: [
    { label: "FinCEN: Guidance on convertible virtual currency, FIN-2019-G001 (9 May 2019)", href: "https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf" },
    { label: "Regulation (EU) 2024/1624 (AMLR): Article 79, applies from 10 July 2027", href: "https://eur-lex.europa.eu/eli/reg/2024/1624/oj" },
    { label: "ESMA: MiCA Article 76, operation of a trading platform", href: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-76-operation-trading-platform-crypto" },
    { label: "UK FCA: Cryptoasset AML/CTF regime", href: "https://www.fca.org.uk/firms/financial-crime/money-laundering-terrorist-financing/cryptoassets-aml-ctf-regime" },
    { label: "Kraken: UK Monero (XMR) conversion FAQ", href: "https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" },
    { label: "Kraken: Notice of delisting XMR in Canada", href: "https://support.kraken.com/articles/notice-of-delisting-xmr-canada" },
    { label: "Kraken: Support for Monero (XMR) in Europe", href: "https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" },
    { label: "VARA: Virtual Asset Issuance Rulebook, prohibited virtual assets", href: "https://rulebooks.vara.ae/entiresection/293" },
    { label: "DFSA Rulebook GEN 3A.2.2: privacy tokens", href: "https://dfsaen.thomsonreuters.com/rulebook/gen-3a22" },
    { label: "Korea Financial Services Commission: enforcement decree announcement (February 2021)", href: "https://www.fsc.go.kr/no010101/75408" },
    { label: "Bank of Russia: Cryptocurrency questions and answers (Federal Law 282-FZ)", href: "https://www.cbr.ru/develop/cryptocurrency/" },
    { label: "MAS: Reply to parliamentary question on cryptocurrency (October 2022)", href: "https://www.mas.gov.sg/news/parliamentary-replies/2022/reply-to-parliamentary-question-on-prevalence-and-regulation-of-cryptocurrency-transactions" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Is Monero legal? For individuals, <mark>yes in almost every country we checked</mark>: of 15 jurisdictions, none bans
        owning it, though Russia now restricts moving crypto to your own wallet. What has changed is access. Japan, South Korea,
        Dubai and the DIFC keep it off licensed platforms, and the EU follows from July 2027. Below is a dated, sourced table,
        country by country. It is general information, not legal advice, and laws change.
      </p>

      <Takeaways items={[
        "In the 15 jurisdictions we checked, none bans individuals from owning Monero. Russia restricts self-custody transfers.",
        "Most restrictions target exchanges and licensed platforms, not personal ownership.",
        "Japan, South Korea, Dubai and the DIFC already keep privacy coins off licensed platforms; the EU follows on 10 July 2027.",
        "Every row in our table links a primary source and was checked on 15 October 2026.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        For regular people in most countries, <mark>holding and using Monero is legal</mark>, in the same general way that using cash is legal.
        The headlines you may have seen are usually about exchanges deciding not to list it, or about rules for licensed
        financial companies. They are not usually about making it a crime to own.
      </p>
      <p>
        That said, the word &quot;most&quot; is doing real work in that sentence. Russia&apos;s new crypto law is the clearest
        exception in our table: the Bank of Russia says individuals may not transfer crypto to non-custodial wallets or to each
        other. Some countries we did not cover restrict crypto broadly, and those rules would include Monero.
      </p>

      <h2 id="countries">Is Monero legal? Country by country</h2>
      <p>
        Each row below was checked against the linked primary source on 15 October 2026: a regulator, a tax authority, the
        law itself, or, for delistings, the exchange&apos;s own notice. Where a source did not settle a point, we say
        &quot;unclear&quot; rather than guess. Jump to:{" "}
        {LEGALITY_ROWS.map((r, i) => (
          <span key={r.id}>{i > 0 ? ", " : ""}<a href={`#${r.id}`}>{r.country}</a></span>
        ))}.
      </p>
      <LegalityTable />
      <p>
        &quot;No rule found&quot; means we found no rule against individuals on the official pages we checked. It is not a
        guarantee. If your country is missing, the <a href="#check">checklist below</a> shows how to find its rules.
      </p>

      <h2 id="holding">Holding is different from buying</h2>
      <p>
        It helps to separate two things. Owning Monero and sending it between wallets is generally unrestricted for individuals (Russia is the exception in our table).
        Buying and selling it for regular money through a licensed company <mark>is where the rules bite</mark>, because those companies have to
        follow financial regulations such as identity checks and transaction monitoring.
      </p>
      <p>
        That is why <Link href="/buy-monero">buying Monero</Link> can be harder in some places even where owning it
        is perfectly fine. <mark>The difficulty is about the on-ramp</mark>, not about whether you are allowed to hold the coin once you have it.
      </p>

      <h2 id="delist">Why some exchanges delisted it</h2>
      <p>
        A number of exchanges removed Monero to simplify their regulatory position. Because Monero hides senders, receivers, and
        amounts by default, an exchange cannot use the same blockchain-tracing tools it uses for Bitcoin. Some exchanges decided
        that was too much compliance risk and stopped listing privacy coins.
      </p>
      <p>
        Many of these were <mark>business and compliance decisions</mark> by the platforms, such as Kraken citing compliance
        requirements when it delisted XMR in Canada. In a few places the regulator decided for them: South Korea, Dubai and the
        DIFC bar licensed firms from handling privacy coins, and Japan&apos;s exchange association does not allow coins whose
        transfers cannot be traced. Either way, the effect on you is narrower access, not a ban on holding the coin.
      </p>

      <h2 id="eu-2027">The EU&apos;s 2027 rule</h2>
      <p>
        The biggest change on the calendar is in the EU. The Anti-Money Laundering Regulation,{" "}
        <a href="https://eur-lex.europa.eu/eli/reg/2024/1624/oj" rel="noopener">Regulation (EU) 2024/1624</a>, says in Article
        79 that banks, financial institutions and crypto-asset service providers may not keep anonymous accounts, or accounts
        that allow anonymisation or increased obfuscation of transactions, including through anonymity-enhancing coins. <mark>It applies from 10 July 2027</mark>. It is aimed at those firms, not at
        individuals holding coins in their own wallets.
      </p>
      <p>
        In practice that means fewer regulated places to buy or sell XMR in the EU, on top of the delistings that already
        happened. Our guide to <Link href="/monero-eu-2027">Monero and the EU&apos;s 2027 rules</Link> explains what changes,
        what does not, and what to do before the date.
      </p>
      <Callout title="Not legal advice">
        This article is general information. It is not legal advice, and it cannot account for your specific country or situation.
        If the legal status matters for your decision, check official sources or a qualified professional where you live.
      </Callout>

      <h2 id="compare">Privacy is not the same as illegal</h2>
      <p>
        Financial privacy is a normal expectation in daily life. Cash, sealed envelopes, and private conversations are all legal.
        Monero brings a similar level of privacy to digital payments. <mark>Choosing a private tool is not evidence of wrongdoing</mark>, and
        that is the position many privacy advocates take.
      </p>
      <p>
        At the same time, privacy tools can be misused, which is why regulators pay attention to them. The law generally cares about
        what you do, such as fraud, tax evasion, or evading sanctions, not about the fact that you used a private payment method.
        <mark>Using Monero does not exempt you from any law</mark> that would apply to the same activity with cash or a bank transfer.
      </p>

      <h2 id="taxes">Taxes and reporting</h2>
      <p>
        Many countries tax crypto when you sell it, trade it for another asset, or spend it, and they may expect you to keep
        records. Monero is usually treated like other crypto for this purpose. The privacy of the blockchain does not remove your
        duty to report where the law requires it.
      </p>
      <p>
        Because Monero hides your history from outsiders, <mark>you are responsible for keeping your own records</mark>. A simple habit is to
        note the date, amount, and purpose of each purchase, sale, and payment as you go. Ask a local tax professional what applies
        to you.
      </p>

      <h2 id="wallets">Does using a wallet break any rules?</h2>
      <p>
        A wallet is software that holds keys and builds transactions. A non-custodial wallet like{" "}
        <Link href={walletUrl}>MonkStash</Link> does not hold your money or ask for identity documents, because it never has custody
        of your funds. In most places, running such software is not restricted. What matters is the legal context around your
        activity, such as the rules for buying and selling and any tax duties.
      </p>
      <p>
        Because the wallet is non-custodial, you are in charge of your own funds and your own compliance. We cannot reverse a
        payment, and we cannot look up your balance for you.
      </p>

      <h2 id="check">How to check your own rules</h2>
      <ol>
        <li>Look for official guidance from your financial regulator or tax authority on cryptocurrency.</li>
        <li>Check the terms of any exchange you plan to use, since each has its own list of supported coins and countries.</li>
        <li>If large sums or a business are involved, speak to a qualified local professional.</li>
        <li>Recheck from time to time. Rules in this area have been changing, and a page that was right last year may be out of date.</li>
      </ol>

      <h2 id="bottom">The bottom line</h2>
      <p>
        For most people, Monero is legal to hold and use, and the practical question is usually where to buy it rather than whether
        you are allowed to own it. If you are new, start with <Link href="/what-is-monero">what Monero is</Link> and how its{" "}
        <Link href="/is-monero-traceable">privacy actually works</Link>. When you are ready to get some, read{" "}
        <Link href="/buy-monero">how to buy Monero</Link>, and see our <Link href="/faq">FAQ</Link> for other
        common questions.
      </p>
    </>
  );
}
