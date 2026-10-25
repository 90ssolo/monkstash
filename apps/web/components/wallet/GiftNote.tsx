/**
 * The note that comes with a gift, in the wallet: the same paper note as on the gift page, small.
 * Used where a gift is waiting, being claimed or taken back, and as a preview for the sender.
 */
import { formatXmr } from "@quietmint/wallet-core";
import { BrandMark } from "@/components/BrandMark";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
import styles from "./gift.module.css";

export function GiftNote({ amount, message, kicker = "A gift for you", hidden = false }: {
  /** What the sender paid in, when known (links made before amounts were added have none). */
  amount?: bigint | null;
  message: string;
  kicker?: string;
  /** The wallet's "hide amounts" setting. */
  hidden?: boolean;
}) {
  return (
    <div className={styles.giftNote}>
      <span className={styles.giftNoteSeal} aria-hidden="true"><BrandMark className={styles.giftNoteMark} /></span>
      <p className={styles.noteKicker}>{kicker}</p>
      <p className={styles.giftNoteAmount}>
        {amount ? <span className="tnum">{hidden ? "••••" : formatXmr(amount)}</span> : null}
        <span className={styles.unit}><MoneroSymbol size={22} /> {amount ? "XMR" : "Monero"}</span>
      </p>
      {message ? (
        <blockquote className={styles.giftNoteMsg}><span className="visually-hidden">Message from the sender: </span>{message}</blockquote>
      ) : null}
    </div>
  );
}
