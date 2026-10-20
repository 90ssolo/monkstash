"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { addressNetwork, buildPaymentUri, checkAddressFormat, NAME_MAX, NOTE_MAX, parseXmr, PaymentRequestError, xmrAmountProblem } from "@quietmint/wallet-core";
import styles from "./page.module.css";

const QR_DARK = "#121a17";
const QR_LIGHT = "#ffffff";

type Built = { uri: string; network: "mainnet" | "stagenet" | "testnet" } | { error: string } | null;

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Builds a standard monero: payment URI and its QR code, entirely in the browser. */
export function QrGenerator() {
  const id = useId();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  // The PNG is kept with the URI it encodes, so a stale code is never offered for download.
  const [png, setPng] = useState<{ uri: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addr = address.trim();
  const amt = amount.trim();
  const parsedAmount = amt ? parseXmr(amt) : undefined;
  const amountError = amt && (parsedAmount === null || parsedAmount === undefined || parsedAmount <= 0n)
    ? (xmrAmountProblem(amt) ?? "Enter an amount in XMR, like 0.5. Use a dot for decimals, up to 12 places.")
    : null;

  const built: Built = useMemo(() => {
    if (!addr) return null;
    const network = addressNetwork(addr);
    if (!network) return { error: checkAddressFormat(addr, "mainnet").reason ?? "That is not a valid Monero address." };
    if (amountError) return null;
    try {
      return { uri: buildPaymentUri({ address: addr, amount: parsedAmount ?? undefined, name, note }), network };
    } catch (e) {
      return { error: e instanceof PaymentRequestError ? e.message : "Could not build the payment request." };
    }
  }, [addr, parsedAmount, amountError, name, note]);

  const uri = built && "uri" in built ? built.uri : null;

  useEffect(() => {
    setCopied(false);
    setPng(null);
    if (!uri) return;
    let alive = true;
    QRCode.toDataURL(uri, { margin: 2, width: 1024, errorCorrectionLevel: "M", color: { dark: QR_DARK, light: QR_LIGHT } })
      .then((url) => { if (alive) setPng({ uri, url }); })
      .catch(() => { if (alive) setPng(null); });
    return () => { alive = false; };
  }, [uri]);

  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);

  const pngUrl = png && png.uri === uri ? png.url : null;

  const fileBase = "monero-payment-qr";

  async function onCopy() {
    if (!uri) return;
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function onPng() {
    if (pngUrl) download(pngUrl, `${fileBase}.png`);
  }

  async function onSvg() {
    if (!uri) return;
    const svg = await QRCode.toString(uri, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: QR_DARK, light: QR_LIGHT } });
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    download(url, `${fileBase}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const addrError = built && "error" in built ? built.error : null;
  const testNet = built && "uri" in built && built.network !== "mainnet" ? built.network : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.badge}>Runs in your browser</span>
        <h2 className={styles.cardTitle}>Make a Monero payment QR code</h2>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${id}-addr`}>Your Monero address</label>
        <textarea
          id={`${id}-addr`}
          className={`textarea mono ${styles.addr}`}
          placeholder="Paste an address that starts with 4 or 8"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-invalid={addrError ? true : undefined}
          aria-describedby={`${id}-addr-msg`}
        />
        <div id={`${id}-addr-msg`}>
          {addrError ? <p className={styles.err}>{addrError}</p>
            : testNet ? <p className={styles.warn}>This is a {testNet} address, for testing only. It cannot receive real XMR.</p>
            : <p className={styles.help}>A subaddress (starts with 8) is a good choice: it keeps this QR separate from your other payments.</p>}
        </div>
      </div>

      <div className={styles.pair}>
        <div className={styles.group}>
          <label htmlFor={`${id}-amt`}>Amount in XMR <span className={styles.opt}>(optional)</span></label>
          <input
            id={`${id}-amt`}
            className={`input ${styles.field}`}
            inputMode="decimal"
            placeholder="Leave empty for any amount"
            autoComplete="off"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={`${id}-amt-msg`}
          />
          <p id={`${id}-amt-msg`} className={amountError ? styles.err : styles.help}>{amountError ?? "Empty lets the payer choose, which suits donations."}</p>
        </div>
        <div className={styles.group}>
          <label htmlFor={`${id}-name`}>Recipient name <span className={styles.opt}>(optional)</span></label>
          <input id={`${id}-name`} className={`input ${styles.field}`} maxLength={NAME_MAX} placeholder="For example Lena's Bakery" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${id}-note`}>Description <span className={styles.opt}>(optional)</span></label>
        <input id={`${id}-note`} className={`input ${styles.field}`} maxLength={NOTE_MAX} placeholder="For example Invoice 1042" autoComplete="off" value={note} onChange={(e) => setNote(e.target.value)} />
        <p className={styles.help}>Anyone who scans the code can read the name and description. Keep private details out.</p>
      </div>

      <div className={styles.out}>
        <div className={styles.qrBox}>
          {pngUrl ? <img src={pngUrl} alt={`QR code for a Monero payment request${amt && !amountError ? ` of ${amt} XMR` : ""}`} width={180} height={180} />
            : <span className={styles.qrEmpty}>Your QR code appears here once the address is valid.</span>}
        </div>
        <div className={styles.group}>
          <label htmlFor={`${id}-uri`}>Payment request (monero: URI)</label>
          <textarea id={`${id}-uri`} className={`textarea ${styles.uri}`} readOnly value={uri ?? ""} placeholder="monero:..." onFocus={(e) => e.currentTarget.select()} />
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onCopy} disabled={!uri}>{copied ? "Copied" : "Copy URI"}</button>
            <button type="button" className={styles.btnGhost} onClick={onPng} disabled={!pngUrl}>Download PNG</button>
            <button type="button" className={styles.btnGhost} onClick={onSvg} disabled={!uri}>Download SVG</button>
          </div>
          <p className={styles.help} aria-live="polite">{copied ? "The payment request is on your clipboard." : uri ? "Scan it with a Monero wallet to check it before you share it." : ""}</p>
        </div>
      </div>

      <p className={styles.source}>Everything happens on this page. The address, amount and QR code are never sent to MonkStash or anyone else.</p>
    </div>
  );
}
