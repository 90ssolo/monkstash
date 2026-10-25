"use client";
/**
 * The emergency kit: one or two printed pages that let you, or someone you trust, get this wallet
 * back without this device and without MonkStash. Made in this page and handed to the browser's
 * print dialog (print on paper, or "Save as PDF"): nothing is uploaded and no file is written
 * unless the person saves one. By default the word boxes are left blank to be filled in by hand;
 * printing the words needs the password, and the words leave the page as soon as printing ends.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { estimateDateOfHeight, type WalletPublic } from "@quietmint/wallet-core";
import { Credentials, type SettingsActions } from "./WalletSettings";
import { site } from "@/lib/site";
import styles from "./wallet.module.css";
import kit from "./kit.module.css";

const PRINT_CLASS = "kit-printing";
const NOTE_MAX = 600;

interface KitContent { words: string[] | null; count: number; note: string; made: Date }

/** Groups of 4 characters, so an address can be compared by eye. */
const grouped = (s: string) => s.match(/.{1,4}/g)?.join(" ") ?? s;

export function EmergencyKitForm({ pub, actions }: { pub: WalletPublic; actions: SettingsActions }) {
  const [withWords, setWithWords] = useState(false);
  const [note, setNote] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState<KitContent | null>(null);

  // Print once the kit is on the page; afterwards take it (and any words) off the page again.
  useEffect(() => {
    if (!content) return;
    const root = document.documentElement;
    const done = () => {
      root.classList.remove(PRINT_CLASS);
      setContent(null);
    };
    root.classList.add(PRINT_CLASS);
    window.addEventListener("afterprint", done, { once: true });
    // Some phone browsers never send afterprint: the words also leave the page when it is closed,
    // and a minute after the print dialog opened at the latest.
    window.addEventListener("pagehide", done, { once: true });
    let fallback = 0;
    // Let the browser lay the kit out before the dialog takes a snapshot of it.
    const t = window.setTimeout(() => {
      window.print();
      fallback = window.setTimeout(done, 60_000);
    }, 50);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(fallback);
      window.removeEventListener("afterprint", done);
      window.removeEventListener("pagehide", done);
      root.classList.remove(PRINT_CLASS);
    };
  }, [content]);
  useEffect(() => () => setContent(null), []);

  if (actions.kind === "view-only") {
    return <p className="small muted">The emergency kit is for wallets with recovery words. This watch-only wallet can only watch, so there is nothing to recover from it.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let words: string[] | null = null;
    if (withWords) {
      setBusy(true);
      try {
        words = (await actions.revealSeed(pw, code)).trim().split(/\s+/);
        setPw("");
        setCode("");
      } catch (err) {
        setError((err as Error).message);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setContent({ words, count: words?.length ?? actions.seedWords ?? 25, note: note.trim().slice(0, NOTE_MAX), made: new Date() });
  }

  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <p className="small muted">
        One or two pages that let you, or someone you trust, get this wallet back if this device is lost or you are not around.
        It works without MonkStash: any Monero wallet can restore it. Made on this device and sent straight to your printer
        (or saved as a PDF from the print dialog).
      </p>
      <fieldset className={styles.kitChoice}>
        <legend className={styles.fieldLabel}>Recovery words on the kit</legend>
        <label className="check">
          <input type="radio" name="kit-words" checked={!withWords} onChange={() => setWithWords(false)} />
          <span>Leave them blank, I will write them by hand. <span className="muted">The safest: the words never pass through a printer or a file.</span></span>
        </label>
        <label className="check">
          <input type="radio" name="kit-words" checked={withWords} onChange={() => setWithWords(true)} />
          <span>Print them. <span className="muted">Use your own printer, not a shared one. If you save a PDF, keep it offline (a USB stick in a safe place), not in email or cloud storage.</span></span>
        </label>
      </fieldset>
      <div className="field">
        <label htmlFor="kit-note">A note for whoever uses it (optional)</label>
        <textarea id="kit-note" className="input" rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="For example: the passphrase is in the blue envelope. Ask Sam for help with the computer." />
        <span className="hint">Printed on the kit only. Not saved anywhere.</span>
      </div>
      {withWords ? <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="kit" /> : null}
      {error ? <p className="error small" role="alert">{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy || (withWords && !pw)}>{busy ? "Checking…" : "Print the emergency kit"}</button>
      {content ? createPortal(<KitPages pub={pub} content={content} passphrase={!!actions.seedPassphrase} />, document.body) : null}
    </form>
  );
}

function KitPages({ pub, content, passphrase }: { pub: WalletPublic; content: KitContent; passphrase: boolean }) {
  const { words, count, note, made } = content;
  const polyseed = count === 16;
  const startDate = pub.network === "mainnet" && pub.restoreHeight > 0 ? estimateDateOfHeight(pub.restoreHeight) : null;
  const dateText = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return (
    <div id="kit-print" className={kit.kit} translate="no">
      <section className={kit.page}>
        <header className={kit.head}>
          <p className={kit.brand}>MonkStash emergency kit</p>
          <h1>{pub.name}</h1>
          <p>Made {dateText(made)}. Monero {pub.network === "mainnet" ? "" : `${pub.network} (test network) `}wallet.</p>
        </header>

        <div className={kit.warn}>
          <strong>Anyone who has these words can take the money.</strong> Keep this sheet like cash: in a safe place, never as a
          photo, never in email or cloud storage. Nobody from MonkStash will ever ask for it.
        </div>

        <h2>Recovery words ({count}{polyseed ? ", Polyseed" : ""})</h2>
        <ol className={kit.words} aria-label="Recovery words">
          {Array.from({ length: count }, (_, i) => (
            <li key={i}><span className={kit.num}>{i + 1}</span><span className={kit.word}>{words?.[i] ?? ""}</span></li>
          ))}
        </ol>
        {!words ? <p className={kit.small}>Write the words in order, in pen, exactly as the wallet shows them (Settings, Show recovery words).</p> : null}

        {passphrase ? (
          <div className={kit.box}>
            <strong>This wallet also needs its seed passphrase.</strong> The words alone open a different, empty wallet. The passphrase is
            not on this sheet. Where it is kept: <span className={kit.line} />
          </div>
        ) : null}

        <h2>Wallet details</h2>
        <dl className={kit.facts}>
          <dt>Main address</dt><dd className={kit.mono}>{grouped(pub.primaryAddress)}</dd>
          <dt>Restore from</dt>
          <dd>
            {pub.restoreHeight > 0
              ? <>Block {pub.restoreHeight.toLocaleString()}{startDate ? ` (around ${dateText(startDate)})` : ""}. Scanning from here is much faster than from the start, and nothing older is missed.</>
              : "The start of the network (block 0): this wallet was restored without a date, so a restore scans everything."}
          </dd>
        </dl>
        {note ? (
          <>
            <h2>Note</h2>
            <p className={kit.note}>{note}</p>
          </>
        ) : (
          <>
            <h2>Notes</h2>
            <div className={kit.lines}><span /><span /><span /></div>
          </>
        )}
      </section>

      <section className={kit.page}>
        <h2>How to get the money back</h2>
        <ol className={kit.steps}>
          <li>
            <strong>Pick a Monero wallet.</strong> MonkStash ({site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}), Feather (desktop), Cake Wallet (phone) and the
            official Monero GUI wallet all restore these words. Download a wallet only from its official site, never from an ad or a link in a message.
          </li>
          <li>
            <strong>Choose to restore a wallet</strong> (&quot;Restore from recovery words&quot;, &quot;Restore from seed&quot;) and type the {count} words in order.
            {polyseed ? " These 16 words are a Polyseed: Cake Wallet, Feather and MonkStash read them; some older wallets do not." : ""}
            {passphrase ? " Enter the seed passphrase where the wallet asks for one (Cake: passphrase, Feather and Monero GUI: seed offset)." : ""}
          </li>
          <li>
            <strong>Give the restore height:</strong> block {pub.restoreHeight.toLocaleString()}{startDate ? `, or the date ${dateText(startDate)}` : ""}{pub.restoreHeight > 0 ? "" : " (leave it empty or 0)"}.
            {polyseed ? " A Polyseed carries its own date, so most wallets will not ask." : ""}
          </li>
          <li>
            <strong>Check the main address.</strong> When the wallet opens, its main address must start with <span className={kit.mono}>{pub.primaryAddress.slice(0, 8)}</span> and
            end with <span className={kit.mono}>{pub.primaryAddress.slice(-8)}</span>. If it does not, a word is wrong{passphrase ? " or the passphrase is missing" : ""}.
          </li>
          <li><strong>Wait for the scan to finish.</strong> The balance appears once the wallet has caught up with the network. It can take a while.</li>
        </ol>

        <h2>For whoever finds this</h2>
        <ul className={kit.steps}>
          <li>This is a key to money in Monero, a private digital currency. MonkStash never held this money and cannot recover it: these words are the only way in.</li>
          <li>Be careful of anyone who offers to help in exchange for the words. Restore the wallet yourself, or with someone you trust in person.</li>
          <li>To move the money somewhere else, restore it first, then send it from the wallet.</li>
        </ul>
        <p className={kit.foot}>Made on this device by MonkStash. Nothing on this page was sent to a server.</p>
      </section>
    </div>
  );
}
