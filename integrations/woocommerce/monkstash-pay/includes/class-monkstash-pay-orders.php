<?php
/**
 * Keeps WooCommerce orders in step with their MonkStash Pay invoices. The invoice status always
 * comes from the MonkStash Pay API, never from a webhook body alone, so a forged or replayed
 * webhook cannot mark an order paid.
 */

defined( 'ABSPATH' ) || exit;

class MonkStash_Pay_Orders {

	const META_INVOICE  = '_monkstash_invoice_id';
	const META_CHECKOUT = '_monkstash_checkout_url';
	const META_LAST     = '_monkstash_last_status';
	/** Earlier invoices of this order (replaced by a newer one), as invoice id => last status seen. */
	const META_PREVIOUS = '_monkstash_previous_invoices';

	/** Hashes of locked payments (any invoice of this order) already noted on the order. */
	const META_LOCKED = '_monkstash_locked_seen';

	/** How many earlier invoices to remember per order. */
	const MAX_PREVIOUS = 20;

	/**
	 * Seconds after expiresAt during which a payment still counts as on time. Mirrors
	 * EXPIRY_GRACE_MS in MonkStash Pay (3 minutes).
	 */
	const EXPIRY_GRACE = 180;

	/** Orders fetched per page by the fallback check. */
	const POLL_PAGE = 100;

	/** Upper bound on pages per run, so one cron run cannot go on for ever. */
	const POLL_MAX_PAGES = 50;

	public static function init(): void {
		add_action( 'monkstash_pay_poll', array( __CLASS__, 'poll' ) );
	}

	/**
	 * Fallback for missed webhooks: re-checks every open MonkStash order from the last 7 days,
	 * page by page, and any earlier invoices those orders had. Also re-checks orders from the
	 * last 24 hours that were marked paid while their payment was unconfirmed (status `paid` at
	 * 0 confirmations, or `confirming`), so a payment that was double-spent is caught even when
	 * the invoice.reverted webhook never arrived.
	 */
	public static function poll(): void {
		$client = MonkStash_Pay_Client::from_settings();
		if ( ! $client ) {
			return;
		}
		// Collect the ids first: applying a status can move an order out of the filtered list,
		// which would shift later pages and skip orders.
		$ids = self::order_ids( array( 'pending', 'on-hold' ), time() - 7 * DAY_IN_SECONDS );
		foreach ( self::order_ids( array( 'processing' ), time() - DAY_IN_SECONDS ) as $order_id ) {
			$order = wc_get_order( $order_id );
			if ( $order && in_array( (string) $order->get_meta( self::META_LAST ), array( 'paid', 'confirming' ), true ) ) {
				$ids[] = $order_id;
			}
		}

		foreach ( array_unique( array_map( 'absint', $ids ) ) as $order_id ) {
			$order = wc_get_order( $order_id );
			if ( ! $order ) {
				continue;
			}
			$id = (string) $order->get_meta( self::META_INVOICE );
			if ( '' !== $id ) {
				try {
					self::apply( $order, $client->get_invoice( $id ) );
				} catch ( Exception $e ) {
					// The server may be briefly unreachable, or still syncing after a restart (HTTP
					// 503). Nothing changes on the order; the next run tries again.
					continue;
				}
			}
			foreach ( self::previous_invoices( $order ) as $old_id => $last ) {
				if ( in_array( $last, array( 'paid', 'late' ), true ) ) {
					continue; // Already reported; nothing more can change that needs a person.
				}
				try {
					self::apply( $order, $client->get_invoice( (string) $old_id ) );
				} catch ( Exception $e ) {
					continue;
				}
			}
		}
	}

	/**
	 * Ids of MonkStash orders in the given statuses created after $since, page by page.
	 *
	 * @param string[] $statuses
	 * @return int[]
	 */
	private static function order_ids( array $statuses, int $since ): array {
		$ids  = array();
		$page = 1;
		do {
			$batch = wc_get_orders(
				array(
					'payment_method' => MONKSTASH_PAY_GATEWAY_ID,
					'status'         => $statuses,
					'date_created'   => '>' . $since,
					'limit'          => self::POLL_PAGE,
					'paged'          => $page,
					'orderby'        => 'ID',
					'order'          => 'ASC',
					'return'         => 'ids',
				)
			);
			$batch = is_array( $batch ) ? $batch : array();
			$ids   = array_merge( $ids, array_map( 'absint', $batch ) );
			++$page;
		} while ( count( $batch ) === self::POLL_PAGE && $page <= self::POLL_MAX_PAGES );
		return $ids;
	}

	/**
	 * Earlier invoices of an order, as invoice id => last status key seen ('' if none yet).
	 *
	 * @return array<string, string>
	 */
	public static function previous_invoices( WC_Order $order ): array {
		$list = $order->get_meta( self::META_PREVIOUS );
		if ( ! is_array( $list ) ) {
			return array();
		}
		$out = array();
		foreach ( $list as $id => $last ) {
			$id = (string) $id;
			if ( preg_match( '/^[A-Za-z0-9_-]{16,64}$/', $id ) ) {
				$out[ $id ] = (string) $last;
			}
		}
		return $out;
	}

	/**
	 * Called when an order gets a new invoice: remembers the one it replaces, so a payment that
	 * still arrives for it is noticed instead of ignored. Does not save the order.
	 */
	public static function replace_invoice( WC_Order $order, string $new_id, string $checkout_url ): void {
		$old = (string) $order->get_meta( self::META_INVOICE );
		if ( '' !== $old && $old !== $new_id ) {
			$list = self::previous_invoices( $order );
			if ( ! isset( $list[ $old ] ) ) {
				$list[ $old ] = (string) $order->get_meta( self::META_LAST );
			}
			// Keep the newest entries (PHP arrays keep insertion order).
			if ( count( $list ) > self::MAX_PREVIOUS ) {
				$list = array_slice( $list, -self::MAX_PREVIOUS, null, true );
			}
			$order->update_meta_data( self::META_PREVIOUS, $list );
		}
		$order->update_meta_data( self::META_INVOICE, $new_id );
		$order->update_meta_data( self::META_CHECKOUT, $checkout_url );
		// The new invoice starts with a clean slate; otherwise its first status could be skipped
		// as "nothing new" because the old invoice ended the same way.
		$order->update_meta_data( self::META_LAST, '' );
	}

	/**
	 * True when the invoice asks for this order's current total in its currency. Guards against
	 * an order total that changed after the invoice was made (an edited order, a reused invoice).
	 *
	 * @param array<string, mixed> $invoice
	 */
	public static function matches_order( WC_Order $order, array $invoice ): bool {
		$currency = $order->get_currency();
		$amount   = isset( $invoice['amount'] ) && is_array( $invoice['amount'] ) ? $invoice['amount'] : array();
		if ( 'XMR' === $currency ) {
			return isset( $amount['xmr'] ) && self::same_decimal( (string) $amount['xmr'], wc_format_decimal( $order->get_total(), 12 ) );
		}
		$fiat = isset( $amount['fiat'] ) && is_array( $amount['fiat'] ) ? $amount['fiat'] : array();
		return isset( $fiat['currency'], $fiat['amount'] )
			&& (string) $fiat['currency'] === $currency
			&& self::same_decimal( (string) $fiat['amount'], wc_format_decimal( $order->get_total(), 2 ) );
	}

	/** Compares two decimal strings exactly ("12.5" equals "12.50"), without floating point. */
	private static function same_decimal( string $a, string $b ): bool {
		$norm = static function ( string $s ): string {
			if ( ! preg_match( '/^(\d+)(?:\.(\d+))?$/', trim( $s ), $m ) ) {
				return 'invalid:' . $s;
			}
			$int  = ltrim( $m[1], '0' );
			$frac = rtrim( isset( $m[2] ) ? $m[2] : '', '0' );
			return ( '' === $int ? '0' : $int ) . ( '' === $frac ? '' : '.' . $frac );
		};
		return $norm( $a ) === $norm( $b );
	}

	/**
	 * True when a partly paid invoice's price hold and grace period are over: the customer was
	 * told to stop paying, and it can no longer become paid on time.
	 *
	 * @param array<string, mixed> $invoice
	 */
	private static function partial_is_over( array $invoice ): bool {
		if ( empty( $invoice['expired'] ) || empty( $invoice['expiresAt'] ) ) {
			return false;
		}
		$expires = strtotime( (string) $invoice['expiresAt'] );
		return false !== $expires && time() >= $expires + self::EXPIRY_GRACE;
	}

	/**
	 * The status key stored per invoice, so each change is handled once.
	 *
	 * @param array<string, mixed> $invoice
	 */
	private static function status_key( array $invoice ): string {
		$status   = isset( $invoice['status'] ) ? (string) $invoice['status'] : '';
		$received = isset( $invoice['received'] ) ? (string) $invoice['received'] : '0';
		if ( 'partial' === $status ) {
			return ( self::partial_is_over( $invoice ) ? 'partial-expired:' : 'partial:' ) . $received;
		}
		return $status;
	}

	/**
	 * Puts an order on hold with a note. When it is already on hold, WooCommerce would drop the
	 * note (there is no status change to attach it to), so it is added on its own.
	 */
	private static function hold( WC_Order $order, string $note ): void {
		if ( $order->has_status( 'on-hold' ) ) {
			$order->add_order_note( $note );
		} else {
			$order->update_status( 'on-hold', $note );
		}
	}

	/**
	 * Notes payments the sender locked for later (an unlock time). MonkStash Pay never counts
	 * them, so the invoice status does not change; without this the shop would never hear that
	 * money arrived. Each payment is noted once, and an unpaid order goes on hold so it is not
	 * cancelled while a person decides. Saves the order when something was noted.
	 *
	 * @param array<string, mixed> $invoice
	 */
	private static function note_locked( WC_Order $order, array $invoice ): void {
		if ( empty( $invoice['lockedPayments'] ) || ! is_array( $invoice['lockedPayments'] ) ) {
			return;
		}
		$seen = $order->get_meta( self::META_LOCKED );
		$seen = is_array( $seen ) ? $seen : array();
		$new  = false;
		foreach ( $invoice['lockedPayments'] as $p ) {
			$hash = is_array( $p ) && isset( $p['txHash'] ) ? (string) $p['txHash'] : '';
			if ( ! preg_match( '/^[0-9a-f]{64}$/', $hash ) || in_array( $hash, $seen, true ) ) {
				continue;
			}
			$seen[] = $hash;
			$new    = true;
			$note   = sprintf(
				/* translators: 1: XMR amount, 2: transaction hash */
				__( 'A Monero payment of %1$s XMR arrived for this order, but the sender locked the coins so they cannot be spent until a later block or date (transaction %2$s). It does not count as payment. Do not deliver the order for it; contact the customer.', 'monkstash-pay' ),
				isset( $p['amount'] ) ? (string) $p['amount'] : '?',
				$hash
			);
			if ( $order->is_paid() ) {
				$order->add_order_note( $note );
			} else {
				self::hold( $order, $note );
			}
		}
		if ( $new ) {
			$order->update_meta_data( self::META_LOCKED, array_slice( $seen, -50 ) );
			$order->save();
		}
	}

	/**
	 * Applies an invoice (as returned by the API) to its order. Handles the order's current
	 * invoice and any earlier invoice it had; ignores invoices that belong to other orders.
	 *
	 * @param array<string, mixed> $invoice
	 */
	public static function apply( WC_Order $order, array $invoice ): void {
		$id = isset( $invoice['id'] ) ? (string) $invoice['id'] : '';
		if ( '' === $id ) {
			return;
		}
		$is_current = $id === (string) $order->get_meta( self::META_INVOICE );
		if ( $is_current || array_key_exists( $id, self::previous_invoices( $order ) ) ) {
			self::note_locked( $order, $invoice );
		}
		if ( ! $is_current ) {
			// Not the current invoice: it may be one this order had before.
			if ( array_key_exists( $id, self::previous_invoices( $order ) ) ) {
				self::apply_previous( $order, $id, $invoice );
			}
			return;
		}
		$status   = isset( $invoice['status'] ) ? (string) $invoice['status'] : '';
		$received = isset( $invoice['received'] ) ? (string) $invoice['received'] : '0';
		$key      = self::status_key( $invoice );
		$last     = (string) $order->get_meta( self::META_LAST );
		if ( $key === $last && ( 'paid' !== $status || $order->is_paid() ) ) {
			return; // Nothing new (the poll re-checks recently paid orders every few minutes).
		}

		// A payment the order was reported paid, confirming or late with has disappeared (an
		// unconfirmed payment dropped from the network, for example by a double spend).
		if ( in_array( $last, array( 'paid', 'confirming', 'late' ), true ) && in_array( $status, array( 'waiting', 'partial', 'expired' ), true ) ) {
			$note = sprintf(
				/* translators: %s: XMR amount */
				__( 'The Monero payment for this order disappeared before it was confirmed (it may have been double-spent). %s XMR is now received. Do not deliver the order until the payment is complete; check your wallet.', 'monkstash-pay' ),
				$received
			);
			if ( $order->is_paid() || 'partial' !== $status ) {
				self::hold( $order, $note );
			} else {
				$order->add_order_note( $note );
			}
		}

		switch ( $status ) {
			case 'paid':
				if ( ! $order->is_paid() && ! self::matches_order( $order, $invoice ) ) {
					// Paid, but for a different total than the order now has: a person decides.
					if ( 'paid' === $last ) {
						break; // Already flagged.
					}
					self::hold(
						$order,
						sprintf(
							/* translators: %s: XMR amount */
							__( 'Monero payment of %s XMR received, but the order total or currency changed after the payment request was made. Check the amount before completing the order.', 'monkstash-pay' ),
							$received
						)
					);
					break;
				}
				if ( ! $order->is_paid() ) {
					$order->payment_complete( $id );
					$note = sprintf( /* translators: %s: XMR amount */ __( 'Monero payment complete: %s XMR received.', 'monkstash-pay' ), $received );
					if ( isset( $invoice['overpaid'] ) && '0' !== (string) $invoice['overpaid'] ) {
						$note .= ' ' . sprintf( /* translators: %s: XMR amount */ __( 'The customer overpaid by %s XMR.', 'monkstash-pay' ), (string) $invoice['overpaid'] );
					}
					$order->add_order_note( $note );
				}
				break;

			case 'confirming':
				if ( 'paid' === $last && $order->is_paid() ) {
					// Paid before, now short of confirmations again: the block with the payment was
					// replaced (a chain reorganization). Hold the order until it confirms again; the
					// next `paid` status completes it as usual.
					self::hold(
						$order,
						sprintf(
							/* translators: 1: XMR amount, 2: confirmations needed */
							__( 'The Monero payment of %1$s XMR for this order lost its confirmations (the block it was in was replaced). The order is on hold until the payment has %2$d confirmation(s) again. Do not deliver it before then.', 'monkstash-pay' ),
							$received,
							isset( $invoice['requiredConfirmations'] ) ? (int) $invoice['requiredConfirmations'] : 0
						)
					);
					break;
				}
				$order->add_order_note(
					sprintf(
						/* translators: 1: XMR amount, 2: confirmations needed */
						__( 'Monero payment of %1$s XMR seen; waiting for %2$d confirmation(s).', 'monkstash-pay' ),
						$received,
						isset( $invoice['requiredConfirmations'] ) ? (int) $invoice['requiredConfirmations'] : 0
					)
				);
				break;

			case 'partial':
				if ( self::partial_is_over( $invoice ) ) {
					self::hold(
						$order,
						sprintf(
							/* translators: 1: XMR received, 2: XMR amount due */
							__( 'The Monero price hold ended with only part of the payment received: %1$s XMR of %2$s XMR. The customer was told not to send more. Refund the part paid (ask the customer for a refund address), or agree the rest with them.', 'monkstash-pay' ),
							$received,
							isset( $invoice['amount']['xmr'] ) ? (string) $invoice['amount']['xmr'] : '?'
						)
					);
					break;
				}
				self::hold(
					$order,
					sprintf(
						/* translators: 1: XMR received, 2: XMR remaining */
						__( 'Partial Monero payment: %1$s XMR received, %2$s XMR still to pay.', 'monkstash-pay' ),
						$received,
						isset( $invoice['remaining'] ) ? (string) $invoice['remaining'] : '?'
					)
				);
				break;

			case 'late':
				self::hold(
					$order,
					sprintf(
						/* translators: %s: XMR amount */
						__( 'Monero payment of %s XMR arrived after the price hold expired. Review it: accept the order, or refund (ask the customer for a refund address).', 'monkstash-pay' ),
						$received
					)
				);
				break;

			case 'expired':
				if ( $order->has_status( 'pending' ) ) {
					$order->update_status( 'cancelled', __( 'Monero payment request expired without payment.', 'monkstash-pay' ) );
				}
				break;
		}

		$order->update_meta_data( self::META_LAST, $key );
		$order->save();
	}

	/**
	 * An earlier invoice of this order (replaced when the customer started the payment again)
	 * received money. Never completes the order automatically: the customer may have paid twice,
	 * or paid the old amount. A person checks.
	 *
	 * @param array<string, mixed> $invoice
	 */
	private static function apply_previous( WC_Order $order, string $id, array $invoice ): void {
		$status   = isset( $invoice['status'] ) ? (string) $invoice['status'] : '';
		$received = isset( $invoice['received'] ) ? (string) $invoice['received'] : '0';
		$key      = self::status_key( $invoice );
		$list     = self::previous_invoices( $order );
		if ( isset( $list[ $id ] ) && $list[ $id ] === $key ) {
			return; // Nothing new.
		}
		if ( in_array( $status, array( 'paid', 'confirming', 'partial', 'late' ), true ) ) {
			$note = sprintf(
				/* translators: 1: invoice id, 2: XMR amount, 3: invoice status */
				__( 'Money arrived for an earlier Monero payment request of this order (%1$s): %2$s XMR, status %3$s. The order has a newer payment request, so the customer may have paid twice or paid an old amount. Check before completing the order, and refund any extra (ask the customer for a refund address).', 'monkstash-pay' ),
				$id,
				$received,
				$status
			);
			if ( $order->is_paid() ) {
				$order->add_order_note( $note );
			} else {
				self::hold( $order, $note );
			}
		}
		$list[ $id ] = $key;
		$order->update_meta_data( self::META_PREVIOUS, $list );
		$order->save();
	}
}
