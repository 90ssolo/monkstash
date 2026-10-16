"use client";
import { useMemo, useState } from "react";
import { checkAddressFormat, type AddressKind, type NetworkType } from "@quietmint/wallet-core";
import styles from "./tools.module.css";

const NETWORKS: { id: NetworkType; label: string }[] = [
  { id: "mainnet", label: "Mainnet" },
  { id: "stagenet", label: "Stagenet" },
  { id: "testnet", label: "Testnet" },
];

const KIND_LABEL: Record<AddressKind, string> = {
  primary: "Primary address",
  subaddress: "Subaddress",
  integrated: "Integrated address",
};

const KIND_NOTE: Record<AddressKind, string> = {
  primary: "A main wallet address. It starts with 4 on mainnet.",
  subaddress: "An extra address from the same wallet. It starts with 8 on mainnet. Good for giving each sender a different address.",
  integrated: "A primary address with a built-in payment ID (106 characters).",
};

/** Plain-words next step for each failure reason (display only; the check itself is in wallet-core). */
function hintFor(reason: string | undefined): string {
  if (!reason) return "Check the address with the person or site that gave it to you.";
  if (reason.startsWith("Contains characters")) return "Monero addresses use letters and numbers only, and never 0, O, I or l. Look for a typo, or a space or symbol that came along when you copied it.";
  if (reason.startsWith("Monero addresses are 95")) return "Part of the address may be missing, or extra text came along with it. Copy the whole address again from the source.";
  if (reason.startsWith("This looks like a")) return "Do not send to it. Switch the network above if you meant to test, or ask for a mainnet address if you are paying with real Monero.";
  if (reason.startsWith("Unknown address prefix")) return "Mainnet addresses start with 4 or 8. If it starts with anything else, it was probably copied wrong or is not a Monero address.";
  return "Check the address with the person or site that gave it to you.";
}

export function AddressValidator() {
  const [value, setValue] = useState("");
  const [network, setNetwork] = useState<NetworkType>("mainnet");
  const trimmed = value.trim();
  const result = useMemo(() => (trimmed ? checkAddressFormat(trimmed, network) : null), [trimmed, network]);
  const networkLabel = NETWORKS.find((n) => n.id === network)?.label;
  const bad = Boolean(trimmed) && !result?.ok;

  return (
    <div className={styles.tool}>
      <div className={styles.toolHead}>
        <label htmlFor="addr" className={styles.toolLabel}>Paste a Monero address</label>
        <div className={styles.segment} role="group" aria-label="Network">
          {NETWORKS.map((n) => (
            <button key={n.id} type="button" aria-pressed={network === n.id} className={network === n.id ? styles.segOn : styles.seg} onClick={() => setNetwork(n.id)}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.inputWrap}>
        <textarea
          id="addr"
          className={`input mono ${styles.addrInput}`}
          placeholder="4… , 8… , or an integrated address"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="addr-result"
          aria-invalid={bad ? true : undefined}
        />
        <div className={styles.inputMeta}>
          <span className={styles.count}>{trimmed.length} characters</span>
          {value ? <button type="button" className={styles.clear} onClick={() => setValue("")}>Clear</button> : null}
        </div>
      </div>

      <div id="addr-result" aria-live="polite" className={styles.result}>
        {!trimmed ? (
          <p className={styles.resultIdle}>Waiting for an address. The result shows up here as you paste.</p>
        ) : result?.ok ? (
          <div className={`${styles.resultCard} ${styles.resultOk}`}>
            <span className={styles.resultBadgeOk}>Valid format</span>
            <dl className={styles.resultMeta}>
              <div><dt>Type</dt><dd>{result.kind ? KIND_LABEL[result.kind] : "Address"}</dd></div>
              <div><dt>Network</dt><dd>{networkLabel}</dd></div>
              <div><dt>Length</dt><dd>{trimmed.length} characters</dd></div>
            </dl>
            {result.kind ? <p className={styles.resultNote}>{KIND_NOTE[result.kind]}</p> : null}
          </div>
        ) : (
          <div className={`${styles.resultCard} ${styles.resultBad}`}>
            <span className={styles.resultBadgeBad}>Not a valid {networkLabel} address</span>
            <p className={styles.resultReason}>{result?.reason}</p>
            <p className={styles.resultNote}>{hintFor(result?.reason)}</p>
          </div>
        )}
      </div>

      <p className={styles.toolDisclaimer}>
        This tool decodes a Monero address and checks its checksum, network and type, so typos and wrong-network addresses
        are caught. It cannot tell whether the address belongs to the person you mean to pay, so before sending real funds,
        always confirm the full address with them.
      </p>
    </div>
  );
}
