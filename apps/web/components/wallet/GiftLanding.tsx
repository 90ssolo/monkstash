"use client";
/**
 * The page a gift link opens (/gift#gift=...). It shows the gift (amount, message) from the link
 * itself, before any wallet exists: nothing is scanned or sent anywhere here. The code moves from
 * the address bar into this tab's storage (giftInbox), so "Claim your gift" opens the wallet with
 * the gift waiting on its first screen, whether the visitor has a wallet yet or not.
 */
import { useEffect, useState } from "react";
import { atomicToFiat, decodeGift, formatXmr, GiftLinkError, type GiftPayload } from "@quietmint/wallet-core";
import { BrandMark } from "@/components/BrandMark";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
import { fetchPriceFeed } from "@/lib/prices";
import { giftPageUrl, siteHref, walletUrl } from "@/lib/site";
import { giftInInbox, takeGiftFromUrl } from "@/lib/wallet/giftInbox";
import { useApplyWalletTheme } from "@/lib/wallet/theme";
import { fiatText, OFF, useCurrencyPref } from "./FiatValue";
import styles from "./gift.module.css";

/** The gift page's address as people see it (no scheme), to compare with the address bar. */
const giftPageText = giftPageUrl.replace(/^https?:\/\//, "");

type Opened = { state: "loading" } | { state: "none" } | { state: "bad"; message: string } | { state: "ok"; gift: GiftPayload };

function useGiftFromLink(): Opened {
  const [opened, setOpened] = useState<Opened>({ state: "loading" });
  useEffect(() => {
    takeGiftFromUrl();
    const code = giftInInbox();
    if (!code) return setOpened({ state: "none" });
    try {
      setOpened({ state: "ok", gift: decodeGift(code) });
    } catch (e) {
      setOpened({ state: "bad", message: e instanceof GiftLinkError ? e.message : "This gift link could not be read." });
    }
  }, []);
  return opened;
}

/** Today's value of the gift in the visitor's currency, from our own price feed (no wallet data sent). */
function useGiftValue(atomic: bigint | null): string | null {
  const [currency] = useCurrencyPref();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (atomic === null || currency === OFF) return;
    let alive = true;
    fetchPriceFeed()
      .then((feed) => {
        const rate = feed.rates[currency];
        if (alive && rate) setValue(fiatText(atomicToFiat(atomic, rate), currency));
      })
      .catch(() => { /* the value is a nicety: the amount in XMR stands on its own */ });
    return () => { alive = false; };
  }, [atomic, currency]);
  return value;
}

export function GiftLanding() {
  useApplyWalletTheme();
  const opened = useGiftFromLink();
  const gift = opened.state === "ok" ? opened.gift : null;
  const atomic = gift?.amount ? BigInt(gift.amount) : null;
  const value = useGiftValue(gift?.network === "mainnet" ? atomic : null);

  return (
    <div className={styles.page} data-wallet-root="">
      <header className={styles.bar}>
        <a href={siteHref("/")} className="brand"><BrandMark /><span>MonkStash</span></a>
        <span className={styles.barNote}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          Keys stay on your device
        </span>
      </header>

      <main id="main" className={styles.main}>
        {opened.state === "loading" ? <section className={styles.hero} aria-busy="true"><Envelope gift={null} value={null} opening={false} /></section> : null}
        {opened.state === "none" || opened.state === "bad" ? <NoGift problem={opened.state === "bad" ? opened.message : null} /> : null}
        {gift ? (
          <>
            <section className={styles.hero} aria-labelledby="gift-h">
              <Envelope gift={gift} value={value} opening />
              <div className={styles.pitch}>
                <h1 id="gift-h" className={styles.h1}>Someone sent you <span className={styles.h1Accent}>Monero</span>.</h1>
                <p className={styles.lead}>
                  It is waiting in this link. Claim it into a wallet that only you control: no account, no email, nothing to install.
                </p>
                <a className={`btn btn-primary btn-lg ${styles.cta}`} href={walletUrl}>
                  Claim your gift
                  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <p className={styles.ctaNote}>Free, and it takes about a minute. Already use MonkStash in this browser? Your wallet opens with the gift ready.</p>
                <p className={styles.bearer}>
                  <strong>Claim it soon, and keep the link to yourself.</strong> Whoever claims first gets the gift, and until then the sender can still take it back.
                </p>
              </div>
            </section>

            <section className={styles.steps} aria-labelledby="steps-h">
              <h2 id="steps-h" className={styles.h2}>Three steps, about a minute</h2>
              <ol className={styles.stepList}>
                <li>
                  <span className={styles.stepNo} aria-hidden="true">1</span>
                  <div>
                    <h3>Make your wallet</h3>
                    <p>Right here in your browser. You pick a password that unlocks it on this device.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepNo} aria-hidden="true">2</span>
                  <div>
                    <h3>Write down your 25 words</h3>
                    <p>They are the master key to your money. On paper, never in a photo or a chat. <a href={siteHref("/monero-seed-phrase")}>Why it matters</a></p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepNo} aria-hidden="true">3</span>
                  <div>
                    <h3>Claim it</h3>
                    <p>The gift moves to your own address. A small network fee, usually under 0.0001 XMR, comes out of it.</p>
                  </div>
                </li>
              </ol>
            </section>

            <About />
          </>
        ) : null}
      </main>

      <footer className={styles.foot}>
        <p>
          The real gift page is always at <strong>{giftPageText}</strong>. MonkStash will never ask for your recovery words in an email, a chat or a form. <a href={siteHref("/monero-phishing-sites")}>Spotting fake wallets</a>
        </p>
        <nav aria-label="MonkStash">
          <a href={siteHref("/about")}>About</a>
          <a href={siteHref("/what-is-monero")}>What is Monero?</a>
          <a href={siteHref("/verify")}>Verify this build</a>
        </nav>
      </footer>
    </div>
  );
}

/** The sealed envelope; with `opening`, the flap lifts and the note rises out of it once. */
function Envelope({ gift, value, opening }: { gift: GiftPayload | null; value: string | null; opening: boolean }) {
  const atomic = gift?.amount ? BigInt(gift.amount) : null;
  const test = gift && gift.network !== "mainnet";
  return (
    <figure className={`${styles.env} ${opening ? styles.envOpen : ""}`} aria-label={gift ? "Your gift" : "Opening your gift"}>
      <div className={styles.envBack} aria-hidden="true" />
      <svg className={styles.envFlap} viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 0 H100 L56 46 Q50 51 44 46 Z" />
      </svg>
      <div className={styles.note}>
        {gift ? (
          <>
            <p className={styles.noteKicker}>A gift for you</p>
            {atomic !== null ? (
              <p className={styles.amount}>
                <span className="tnum">{formatXmr(atomic)}</span>
                <span className={styles.unit}><MoneroSymbol size={30} /> XMR</span>
              </p>
            ) : (
              <p className={styles.amount}><span className={styles.unit}><MoneroSymbol size={30} /> Monero</span></p>
            )}
            <p className={styles.value}>
              {test ? <span className={styles.testChip}>Test network ({gift.network}): these coins have no value</span>
                : atomic === null ? "You see the amount when you claim it."
                : value ? <>About {value} today</> : " "}
            </p>
            {gift.message ? (
              <blockquote className={styles.message}>
                <p>{gift.message}</p>
              </blockquote>
            ) : null}
          </>
        ) : <p className={styles.noteKicker}>Opening your gift…</p>}
      </div>
      <div className={styles.pocket} aria-hidden="true">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" focusable="false"><path d="M0 0 L50 24 L100 0 V40 H0 Z" /></svg>
        <span className={styles.sentWith}><BrandMark className={styles.sentMark} />Sent with MonkStash</span>
      </div>
      <span className={styles.seal} aria-hidden="true"><BrandMark className={styles.sealMark} /></span>
    </figure>
  );
}

function About() {
  return (
    <section className={styles.about} aria-labelledby="about-h">
      <div className={styles.aboutHead}>
        <p className="eyebrow">Who made this envelope</p>
        <h2 id="about-h" className={styles.h2}>MonkStash: a quiet wallet for private money</h2>
        <p className={styles.aboutLead}>
          We are an independent, open-source project building a Monero wallet that runs in your browser, so private money is as easy to
          use as a web page, without handing your keys to anyone. Including us.
        </p>
      </div>
      <ul className={styles.facts}>
        <li>
          <strong>Your keys never leave your device.</strong>
          <span>Your recovery words, password and balance stay in this browser, encrypted. We never see them.</span>
        </li>
        <li>
          <strong>No accounts, no tracking.</strong>
          <span>Nothing to sign up for, and no analytics on wallet pages. There is nothing about you for us to keep.</span>
        </li>
        <li>
          <strong>Never locked in.</strong>
          <span>Your 25 words also restore your money in other Monero wallets, such as Feather, Cake Wallet and the official Monero GUI.</span>
        </li>
        <li>
          <strong>Open code you can check.</strong>
          <span>Every line is public, and anyone can check that this page runs exactly that code. <a href={siteHref("/verify")}>How to verify</a></span>
        </li>
      </ul>
    </section>
  );
}

function NoGift({ problem }: { problem: string | null }) {
  return (
    <section className={styles.empty} aria-labelledby="none-h">
      <span className={styles.emptySeal} aria-hidden="true"><BrandMark className={styles.sealMark} /></span>
      <h1 id="none-h" className={styles.h2}>{problem ? "This gift link does not open" : "No gift in this link"}</h1>
      <p>{problem ?? "A gift link ends with #gift= and a long code. Open the whole link exactly as it was sent to you."}</p>
      <p className="small muted">Chat apps sometimes cut long links in two. Ask the sender to send it again, or to show it as a QR code.</p>
      <a className="btn btn-secondary" href={walletUrl}>Open MonkStash</a>
    </section>
  );
}
