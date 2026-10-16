/**
 * Country-by-country Monero legality table for /is-monero-legal.
 *
 * Every row was checked against the linked primary source on CHECKED. Only facts seen on that
 * source are stated; where a source did not settle a point the cell says so ("unclear, check
 * local rules"). Recheck rows before changing CHECKED, and never fill a gap from memory or
 * news coverage. `id` is the in-page anchor (/is-monero-legal#uk); never rename one after launch.
 */

export const LEGALITY_CHECKED = "2026-10-15";

export interface LegalLink {
  label: string;
  href: string;
}

export interface LegalityRow {
  id: string;
  country: string;
  /** Can individuals own and use Monero? */
  owning: string;
  /** Can you buy it on licensed platforms there? */
  exchanges: string;
  notable: string;
  tax: string;
  taxLink?: LegalLink;
  source: LegalLink;
  /** Extra primary sources for facts in the row. */
  more?: LegalLink[];
  /** ISO date this row was last rechecked, when later than LEGALITY_CHECKED. */
  checked?: string;
}

export const LEGALITY_ROWS: LegalityRow[] = [
  {
    id: "us",
    country: "United States",
    owning: "Yes. FinCEN's 2019 guidance says a person who uses privacy coins to pay for goods or services on their own behalf is not a money transmitter.",
    exchanges: "Allowed. Exchanges are money services businesses; FinCEN leaves it to each one's risk policy whether to accept privacy coins, and requires identity checks when they do.",
    notable: "FinCEN guidance FIN-2019-G001 (9 May 2019) on convertible virtual currency.",
    tax: "The IRS treats digital assets as property, not currency.",
    taxLink: { label: "IRS: Digital assets", href: "https://www.irs.gov/filing/digital-assets" },
    source: { label: "FinCEN guidance (2019)", href: "https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf" },
  },
  {
    id: "uk",
    country: "United Kingdom",
    owning: "No rule against individuals found. The FCA's money laundering regime applies to businesses, not holders.",
    exchanges: "Limited. Kraken's UK FAQ says its UK entity does not support XMR; UK balances were converted to BTC on 30 July 2024.",
    notable: "Cryptoasset businesses must register with the FCA under the Money Laundering Regulations. From 25 October 2027 they will need full FCA authorisation; applications opened on 30 September 2026.",
    tax: "HMRC publishes a Cryptoassets Manual on how cryptoassets are taxed.",
    taxLink: { label: "HMRC: Cryptoassets Manual", href: "https://www.gov.uk/hmrc-internal-manuals/cryptoassets-manual" },
    source: { label: "FCA: Cryptoasset AML/CTF regime", href: "https://www.fca.org.uk/firms/financial-crime/money-laundering-terrorist-financing/cryptoassets-aml-ctf-regime" },
    more: [
      { label: "Kraken: UK Monero (XMR) conversion FAQ", href: "https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" },
      { label: "FCA: Gateway to regulated crypto opens (30 September 2026)", href: "https://www.fca.org.uk/news/press-releases/fca-opens-gateway-regulated-crypto" },
    ],
    checked: "2026-10-16",
  },
  {
    id: "canada",
    country: "Canada",
    owning: "No rule against individuals found.",
    exchanges: "Limited. Kraken disabled XMR trading on 2 September 2025, citing Canadian compliance requirements.",
    notable: "Businesses that exchange or transfer virtual currency must register with FINTRAC as money services businesses.",
    tax: "The CRA's guide covers reporting income from crypto-asset transactions and GST/HST.",
    taxLink: { label: "CRA: Guide for cryptocurrency users", href: "https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/digital-currency/cryptocurrency-guide.html" },
    source: { label: "Kraken: Notice of delisting XMR (Canada)", href: "https://support.kraken.com/articles/notice-of-delisting-xmr-canada" },
    more: [{ label: "FINTRAC: Money services businesses", href: "https://fintrac-canafe.canada.ca/msb-esm/msb-eng" }],
    checked: "2026-10-16",
  },
  {
    id: "australia",
    country: "Australia",
    owning: "No rule against individuals found.",
    exchanges: "Unclear, check local rules. We found no national rule on privacy coins and no primary source listing which exchanges sell XMR.",
    notable: "Exchanges are supervised by AUSTRAC; check its register before you use one.",
    tax: "See the ATO's guidance on crypto assets and capital gains tax.",
    taxLink: { label: "ATO: Crypto asset investments", href: "https://www.ato.gov.au/individuals-and-families/investments-and-assets/crypto-asset-investments" },
    source: { label: "AUSTRAC: Digital currency exchange register", href: "https://www.austrac.gov.au/digital-currency-exchange-register" },
  },
  {
    id: "eu",
    country: "EU and EEA",
    owning: "Yes. The EU rules restrict regulated firms, not individuals.",
    exchanges: "Shrinking. MiCA Article 76 bars trading platforms from admitting coins with a built-in anonymisation function unless holders and history can be identified. Kraken halted XMR in the EEA on 31 October 2024.",
    notable: "From 10 July 2027, AMLR Article 79 bars crypto-asset service providers from keeping accounts that allow anonymisation, including through anonymity-enhancing coins.",
    tax: "Set by each country. The DAC8 reporting rules for crypto platforms apply from 1 January 2026.",
    taxLink: { label: "European Commission: DAC8", href: "https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/directive-administrative-cooperation-dac/dac8_en" },
    source: { label: "Regulation (EU) 2024/1624 (AMLR)", href: "https://eur-lex.europa.eu/eli/reg/2024/1624/oj" },
    more: [
      { label: "ESMA: MiCA Article 76", href: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-76-operation-trading-platform-crypto" },
      { label: "Kraken: Monero (XMR) in Europe", href: "https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" },
    ],
    checked: "2026-10-16",
  },
  {
    id: "germany",
    country: "Germany",
    owning: "No rule against individuals found. EU rules apply.",
    exchanges: "Only providers with a MiCA licence may offer crypto services, per BaFin. Whether they list XMR: unclear, and the EU limits above apply.",
    notable: "BaFin supervises crypto service providers under MiCA.",
    tax: "Private sales held for one year or less are taxable under § 23 EStG; total gains under €1,000 a year stay tax-free.",
    taxLink: { label: "§ 23 EStG (gesetze-im-internet.de)", href: "https://www.gesetze-im-internet.de/estg/__23.html" },
    source: { label: "BaFin notice (July 2026)", href: "https://www.bafin.de/SharedDocs/Veroeffentlichungen/DE/Meldung/2026/meldung_2026_07_08_fiu_geldwaescherisiken.html" },
    checked: "2026-10-16",
  },
  {
    id: "switzerland",
    country: "Switzerland",
    owning: "Yes. The tax authority treats payment tokens as taxable assets.",
    exchanges: "Unclear, check local rules. FINMA lets supervised firms send tokens only to external wallets of their own identified customers.",
    notable: "FINMA applies a travel rule: client and beneficiary details must travel with token transfers.",
    tax: "Payment tokens are subject to cantonal wealth tax; private capital gains are generally tax-free.",
    taxLink: { label: "ESTV: Taxation of cryptocurrencies", href: "https://www.estv.admin.ch/de/kryptowaehrungen-besteuerung" },
    source: { label: "FINMA (26 August 2019)", href: "https://www.finma.ch/en/news/2019/08/20190826-mm-kryptogwg/" },
  },
  {
    id: "uae",
    country: "UAE (Dubai VARA and DIFC)",
    owning: "No rule against private holding found. The rules below target licensed activity.",
    exchanges: "Effectively none from licensed firms. Dubai's VARA prohibits issuing anonymity-enhanced cryptocurrencies and all virtual asset activities related to them; in the DIFC, DFSA rule GEN 3A.2.2 bans financial services relating to privacy tokens.",
    notable: "VARA Virtual Asset Issuance Rulebook, rule I.B.1; DFSA GEN 3A.2.2.",
    tax: "The UAE government says it does not levy income tax on individuals. Check VAT rules if you trade as a business.",
    taxLink: { label: "UAE government portal: Taxation", href: "https://u.ae/en/information-and-services/finance-and-investment/taxation" },
    source: { label: "VARA Issuance Rulebook", href: "https://rulebooks.vara.ae/entiresection/293" },
    more: [{ label: "DFSA Rulebook GEN 3A.2.2", href: "https://dfsaen.thomsonreuters.com/rulebook/gen-3a22" }],
    checked: "2026-10-16",
  },
  {
    id: "india",
    country: "India",
    owning: "No ban on individuals found. Crypto is taxed as a virtual digital asset.",
    exchanges: "Unclear whether any registered exchange lists XMR. FIU-IND tells providers to treat anonymity-enhanced crypto as a money laundering risk.",
    notable: "Crypto service providers must register with FIU-IND as reporting entities.",
    tax: "Virtual digital assets have their own tax regime; see the Income Tax Department.",
    taxLink: { label: "Income Tax Department: Taxation of VDA", href: "https://incometaxindia.gov.in/w/taxation-of-virtual-digital-asset-vda-" },
    source: { label: "FIU-IND AML/CFT guidelines (2023)", href: "https://fiuindia.gov.in/pdfs/AML_legislation/AMLCFTguidelines10032023.pdf" },
  },
  {
    id: "japan",
    country: "Japan",
    owning: "Yes. Crypto is legal to hold and is taxed.",
    exchanges: "Effectively none. Industry body JVCEA bars members from handling coins whose transfers cannot be traced, and its list of approved coins does not include XMR.",
    notable: "The JVCEA green list of approved coins had 30 entries on 2 October 2026, with no privacy coins among them.",
    tax: "Crypto gains are generally classed as miscellaneous income.",
    taxLink: { label: "National Tax Agency: Crypto assets", href: "https://www.nta.go.jp/law/joho-zeikaishaku/shotoku/shinkoku/171127/01.pdf" },
    source: { label: "JVCEA green list", href: "https://jvcea.or.jp/statistics/document/greenlist/" },
    checked: "2026-10-16",
  },
  {
    id: "south-korea",
    country: "South Korea",
    owning: "No rule against individuals found.",
    exchanges: "None. Licensed providers are prohibited from handling coins whose transfer history is hard to trace (\"dark coins\").",
    notable: "The ban sits in the enforcement decree of the Specific Financial Information Act, announced by the FSC in February 2021.",
    tax: "Crypto income tax is scheduled from 1 January 2027: 20% above a KRW 2.5 million yearly deduction.",
    taxLink: { label: "National Tax Service", href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=238935" },
    source: { label: "Financial Services Commission (February 2021)", href: "https://www.fsc.go.kr/no010101/75408" },
    checked: "2026-10-16",
  },
  {
    id: "russia",
    country: "Russia",
    owning: "Restricted. Crypto is property for tax, but the Bank of Russia says individuals may not transfer crypto to non-custodial wallets or to each other under Federal Law 282-FZ (4 August 2026).",
    exchanges: "Unclear, check local rules. From 1 July 2027, trades must go through Bank of Russia registered intermediaries, which will follow a list of permitted coins.",
    notable: "Peer-to-peer crypto deals between individuals are allowed only until 1 July 2027.",
    tax: "Digital currency is treated as property for tax purposes.",
    taxLink: { label: "Federal Tax Service", href: "https://www.nalog.gov.ru/mining/" },
    source: { label: "Bank of Russia: Cryptocurrency Q&A", href: "https://www.cbr.ru/develop/cryptocurrency/" },
    checked: "2026-10-16",
  },
  {
    id: "south-africa",
    country: "South Africa",
    owning: "No rule against individuals found.",
    exchanges: "Unclear, check local rules. No XMR-specific rule found.",
    notable: "Since 30 April 2025 a travel rule applies to licensed crypto providers, including transfers to and from self-hosted wallets.",
    tax: "SARS says normal income tax rules apply to crypto assets, as income or capital gains.",
    taxLink: { label: "SARS: Crypto assets and tax", href: "https://www.sars.gov.za/individuals/crypto-assets-tax/" },
    source: { label: "FIC Directive 9 (travel rule)", href: "https://www.fic.gov.za/wp-content/uploads/2024/11/Directive-9-Travel-rule-relating-to-crypto-asset-transfers.pdf" },
  },
  {
    id: "brazil",
    country: "Brazil",
    owning: "No rule against individuals found.",
    exchanges: "Unclear, check local rules. Crypto providers need Banco Central authorisation; no XMR-specific rule found.",
    notable: "From 1 January 2027, under BCB Resolution 584, licensed providers must apply a precautionary hold of up to 24 hours on incoming funds before sending them to a self-custody wallet or a foreign platform, when the amount tops US$10,000 in one transfer or in a client's daily total.",
    tax: "Crypto transactions are reported to Receita Federal through the DeCripto return, which replaced IN 1888.",
    taxLink: { label: "Receita Federal: Criptoativos", href: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/criptoativos" },
    source: { label: "Banco Central do Brasil (August 2026)", href: "https://www.bcb.gov.br/conteudo/home-ptbr/TextosApresentacoes/Apresentacao_GabrielGalipolo_FebrabanTech_24.8.2026.pdf" },
    more: [{ label: "Agência Gov: new BCB rules for virtual asset transfers (13 August 2026)", href: "https://agenciagov.ebc.com.br/noticias/202608/bc-reforca-combate-a-fraudes-com-novas-regras-para-transferencias-de-ativos-virtuais" }],
    checked: "2026-10-16",
  },
  {
    id: "singapore",
    country: "Singapore",
    owning: "Yes. No ban for individuals.",
    exchanges: "Not banned. MAS requires licensed providers to apply stronger controls to anonymity-enhanced coins.",
    notable: "Licensed digital payment token providers should not promote their services to the general public.",
    tax: "IRAS taxes gains on disposal only when they are revenue in nature, such as trading; capital gains are not taxed.",
    taxLink: { label: "IRAS e-Tax Guide: Digital tokens", href: "https://www.iras.gov.sg/irashome/uploadedFiles/IRASHome/e-Tax_Guides/etaxguide_CIT_Income%20Tax%20Treatment%20of%20Digital%20Tokens_091020.pdf" },
    source: { label: "MAS parliamentary reply (October 2022)", href: "https://www.mas.gov.sg/news/parliamentary-replies/2022/reply-to-parliamentary-question-on-prevalence-and-regulation-of-cryptocurrency-transactions" },
  },
];
