import styles from "./wallet-preview.module.css";

/**
 * Static, art-directed mock of the wallet dashboard for the marketing pages.
 * Pure markup, no engine, no data. It mirrors the real UI's structure and tokens.
 */
export function WalletPreview() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.chrome}>
        <span className={styles.dots}><i /><i /><i /></span>
        <span className={styles.url}>wallet.monkstash.com</span>
        <span className={styles.badge}>SYNCED</span>
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Balance</span>
          <span className={styles.net}><span className={styles.dot} /> mainnet</span>
        </div>
        <div className={styles.balance}>14.284<span>19</span> <em>XMR</em></div>
        <div className={styles.fiat}>≈ $2,106.44, 14.284190 spendable</div>

        <div className={styles.spark}>
          <svg viewBox="0 0 320 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--mint)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--mint)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 46 L40 42 L80 44 L120 30 L160 34 L200 20 L240 24 L280 12 L320 16" fill="none" stroke="var(--mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 46 L40 42 L80 44 L120 30 L160 34 L200 20 L240 24 L280 12 L320 16 L320 60 L0 60 Z" fill="url(#g)" />
          </svg>
        </div>

        <div className={styles.tabs}><span className={styles.active}>Receive</span><span>Send</span><span>Activity</span></div>

        <div className={styles.txs}>
          <div className={styles.tx}>
            <span className={`${styles.tdir} ${styles.tin}`}>↓</span>
            <div><strong>Received</strong><span>3 confirmations</span></div>
            <span className={styles.tamt}>+0.5000</span>
          </div>
          <div className={styles.tx}>
            <span className={styles.tdir}>↑</span>
            <div><strong>Sent</strong><span>Yesterday</span></div>
            <span className={styles.tamtOut}>−1.2500</span>
          </div>
          <div className={styles.tx}>
            <span className={`${styles.tdir} ${styles.tin}`}>↓</span>
            <div><strong>Received</strong><span>2 days ago</span></div>
            <span className={styles.tamt}>+3.5000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
