"use client";
/**
 * The payer's view of a payment request. Everything comes from the link's #fragment, which
 * the browser never sends to our server, and is read only on this device.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildPaymentFragment, buildPaymentUri, formatXmr, parsePaymentUri, PaymentRequestError, shortAddress, type NetworkType, type PaymentLinkExtras } from "@quietmint/wallet-core";
import { CopyButton } from "@/components/wallet/CopyButton";
import { Qr } from "@/components/wallet/Qr";
import styles from "./pay.module.css";
import { walletUrl } from "@/lib/site";

type Parsed = PaymentLinkExtras & { uri: string; address: string; amount?: bigint; note?: string; name?: string; network: NetworkType };

function moneyText(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

/** The request with its MonkStash extras, rebuilt from what parsed cleanly (falls back to the plain URI). */
function fullFragment(r: Parsed): string {
  try {
    return buildPaymentFragment({ address: r.address, amount: r.amount, note: r.note, name: r.name, expiresAt: r.expiresAt, fiat: r.fiat, returnUrl: r.returnUrl, invoiceId: r.invoiceId });
  } catch {
    return r.uri;
  }
}

export function PayRequest() {
  const [state, setState] = useState<{ ok: true; r: Parsed } | { ok: false; reason: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const read = () => {
      // Keep the fragment encoded: each field is decoded on its own, so an "&" or "=" inside the
      // note cannot be mistaken for a separator.
      const hash = window.location.hash.slice(1);
      if (!hash) return setState({ ok: false, reason: "This link has no payment details. Ask the person who sent it for the full link." });
      try {
        const p = parsePaymentUri(hash);
        // The QR and "open in wallet" get the plain standard URI, without MonkStash extras.
        setState({ ok: true, r: { ...p, uri: buildPaymentUri({ address: p.address, amount: p.amount, note: p.note, name: p.name }) } });
      } catch (err) {
        setState({ ok: false, reason: err instanceof PaymentRequestError ? err.message : "This payment link could not be read." });
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (state === null) return <div className={styles.card} aria-busy="true"><p className={styles.muted}>Reading the payment request…</p></div>;

  if (!state.ok) {
    return (
      <div className={styles.card}>
        <span className={styles.kicker}>Payment request</span>
        <h1 className={styles.title}>This link does not work</h1>
        <p className={styles.muted}>{state.reason}</p>
        <p className={styles.muted}>Want to ask someone for Monero yourself? Open the <Link href={walletUrl}>MonkStash wallet</Link> and choose Receive, then Request a payment.</p>
      </div>
    );
  }

  const r = state.r;
  const testNet = r.network !== "mainnet";
  // MonkStash gets the extras too (price hold, way back to the shop, invoice id); other wallets do not.
  const walletLink = `${walletUrl}#pay=${encodeURIComponent(fullFragment(r))}`;
  const expired = r.expiresAt !== undefined && now >= r.expiresAt;
  const until = r.expiresAt ? new Date(r.expiresAt).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;
  const backTo = r.returnUrl ? new URL(r.returnUrl).host : null;

  if (expired) {
    return (
      <div className={styles.card}>
        <span className={styles.kicker}>Monero payment request{r.name ? ` from ${r.name}` : ""}</span>
        <h1 className={styles.title}>This request has expired</h1>
        <p className={styles.muted}>
          It was valid until {until}{r.fiat ? `, because the ${r.fiat.currency} price was converted at that day's rate` : ""}. Please do not pay it now: ask{" "}
          {r.name ?? "the person who sent it"} for a new link.
        </p>
        {r.returnUrl ? <a className="btn btn-secondary btn-lg" href={r.returnUrl} rel="noopener noreferrer">Back to {backTo}</a> : null}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className={styles.kicker}>Monero payment request{r.name ? ` from ${r.name}` : ""}</span>
      {testNet ? (
        <div className="notice notice-warn" role="alert">
          <span><strong>Test network ({r.network}).</strong> This request is for practice coins with no value. Do not send real Monero to it.</span>
        </div>
      ) : null}
      <h1 className={styles.title}>
        {r.fiat && r.amount ? <span className={styles.amount}>{moneyText(r.fiat.amount, r.fiat.currency)}</span>
          : r.amount ? <><span className={styles.amount}>{formatXmr(r.amount)}</span> <span className={styles.unit}>XMR</span></> : "Any amount"}
      </h1>
      {r.fiat && r.amount ? (
        <p className={styles.sub}>
          Pay <strong>{formatXmr(r.amount)} XMR</strong>, converted at {moneyText(r.fiat.rate, r.fiat.currency)} per XMR when this request was made.
        </p>
      ) : null}
      {until ? <p className={styles.sub}>Please pay by <strong>{until}</strong>.</p> : null}
      {r.note ? <p className={styles.note}>{r.note}</p> : null}

      <div className={styles.grid}>
        <div className={styles.qrBox}>
          <Qr value={r.uri} label="QR code with this payment request" size={208} />
          <p className={styles.small}>Scan with any Monero wallet. It fills in the address{r.amount ? " and amount" : ""}.</p>
        </div>
        <div className={styles.side}>
          <a className="btn btn-primary btn-lg btn-block" href={r.uri}>Open in my wallet</a>
          <Link className="btn btn-secondary btn-lg btn-block" href={walletLink}>Pay with MonkStash</Link>
          {r.returnUrl ? <a className="btn btn-ghost btn-block" href={r.returnUrl} rel="noopener noreferrer">Paid? Back to {backTo}</a> : null}
          <div className={styles.field}>
            <span className={styles.label}>Send to this address</span>
            <code className={styles.addr}>{r.address}</code>
            <div className={styles.row}>
              <CopyButton value={r.address} label="Copy address" />
              {r.amount ? <CopyButton value={formatXmr(r.amount)} label="Copy amount" /> : null}
            </div>
            <span className={styles.small}>Check the first and last characters: <b className="mono">{shortAddress(r.address, 6)}</b></span>
          </div>
        </div>
      </div>

      <div className={styles.safety}>
        <strong>Before you pay</strong>
        <ul>
          <li>Only pay requests from people you trust. Anyone can make a payment link, and Monero payments cannot be reversed.</li>
          <li>MonkStash does not hold or check this payment. It goes straight from your wallet to theirs.</li>
          <li>This page read the request from the link on your device. Our servers never saw it.</li>
        </ul>
      </div>
      <p className={styles.small}>
        New to Monero? <Link href="/what-is-monero">What Monero is</Link>, and how to <Link href="/create-monero-wallet">get a free wallet in two minutes</Link>.
      </p>
    </div>
  );
}
