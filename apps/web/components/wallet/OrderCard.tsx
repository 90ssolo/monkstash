"use client";
/**
 * Pay with MonkStash: a shop order opened from a checkout (MonkStash Pay or any link with the
 * same extras). Shows who is asking, the price the shop holds, a live countdown, and, once the
 * hold has ended, the way back to the shop for a fresh price instead of a payment.
 *
 * Everything here comes from the link itself. The shop name and the return address are what the
 * link says, not something MonkStash checked, and the card says so.
 */
import { useEffect, useState } from "react";
import { formatXmr } from "@quietmint/wallet-core";
import { serverNow } from "@/lib/wallet/clock";
import { fiatText } from "@/lib/localCurrency";
import styles from "./wallet.module.css";

export interface Order {
  amount?: bigint;
  note?: string;
  name?: string;
  expiresAt?: number;
  fiat?: { currency: string; amount: string; rate: string };
  returnUrl?: string;
  invoiceId?: string;
}

/** A link from a shop checkout, as opposed to a person's payment request. */
export const isOrder = (o: Order | null | undefined): o is Order => !!o && o.amount !== undefined && !!(o.invoiceId || o.fiat || o.returnUrl);

export const orderExpired = (o: Order | null | undefined): boolean => o?.expiresAt !== undefined && serverNow() >= o.expiresAt;

export const shopHost = (o: Order): string | null => {
  try { return o.returnUrl ? new URL(o.returnUrl).host : null; } catch { return null; }
};

/** "12:04" while under an hour, then the date and time. */
function holdText(left: number, at: number): string {
  if (left >= 3600_000) return `until ${new Date(at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return `for ${m}:${String(s).padStart(2, "0")}`;
}

/** Ticks once a second while a hold is running, and reports the moment it ends. */
function useHold(expiresAt: number | undefined, onExpire?: () => void): number | null {
  const [left, setLeft] = useState<number | null>(() => (expiresAt === undefined ? null : Math.max(0, expiresAt - serverNow())));
  useEffect(() => {
    if (expiresAt === undefined) return;
    let ended = expiresAt - serverNow() <= 0;
    const t = window.setInterval(() => {
      const l = Math.max(0, expiresAt - serverNow());
      setLeft(l);
      if (l === 0 && !ended) { ended = true; onExpire?.(); }
    }, 1000);
    return () => window.clearInterval(t);
  }, [expiresAt, onExpire]);
  return left;
}

export function OrderCard({ order, compact, onExpire }: { order: Order; compact?: boolean; onExpire?: () => void }) {
  const left = useHold(order.expiresAt, onExpire);
  const host = shopHost(order);
  const who = order.name || host || "the shop";
  const expired = left === 0;
  const price = order.fiat ? fiatText(order.fiat.amount, order.fiat.currency) : order.amount !== undefined ? `${formatXmr(order.amount)} XMR` : null;

  return (
    <section className={`${styles.order} ${expired ? styles.orderEnded : ""}`} aria-label="Order">
      <div className={styles.orderTop}>
        <span className={styles.orderWho}>Order from <strong>{who}</strong>{order.note ? <>: {order.note}</> : null}</span>
        {left !== null && !expired ? (
          <span className={styles.orderHold} role="timer" aria-live="off">Price held {holdText(left, order.expiresAt!)}</span>
        ) : null}
      </div>
      {price ? <p className={styles.orderPrice}>{price}</p> : null}
      {order.fiat && order.amount !== undefined ? (
        <p className="small muted" style={{ margin: 0 }}>
          You pay <strong>{formatXmr(order.amount)} XMR</strong>, at {fiatText(order.fiat.rate, order.fiat.currency)} per XMR. The shop set this price and holds it until the timer ends.
        </p>
      ) : null}
      {expired ? (
        <div className={styles.orderEnd} role="alert">
          <strong>The price hold has ended. Do not pay this order now.</strong>
          <span className="small">Nothing was sent. {host ? `Go back to ${host} and start the payment again for a fresh price.` : `Ask ${who} for a new payment link.`}</span>
          {order.returnUrl ? <a className="btn btn-secondary btn-sm" href={order.returnUrl} rel="noopener noreferrer">Get a new price at {host}</a> : null}
        </div>
      ) : null}
      {!compact && !expired ? (
        <p className="small muted" style={{ margin: 0 }}>
          The shop name{host ? " and website" : ""} come from the payment link. Pay only if you started this order yourself{host ? ` on ${host}` : ""}.
        </p>
      ) : null}
    </section>
  );
}
