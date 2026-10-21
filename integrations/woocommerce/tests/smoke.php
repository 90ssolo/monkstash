<?php
/**
 * Smoke test for the MonkStash Pay plugin inside a real WordPress and WooCommerce (wp-env).
 * Run: npx wp-env run cli wp eval-file wp-content/monkstash-tests/smoke.php
 * Feeds invoice objects (as the MonkStash Pay API returns them) to the order logic and checks
 * the resulting order status and notes. No network calls are made.
 */

$failures = 0;
function ms_check( bool $ok, string $what ): void {
	global $failures;
	if ( $ok ) {
		WP_CLI::log( "ok   $what" );
	} else {
		WP_CLI::warning( "FAIL $what" );
		++$failures;
	}
}

function ms_order( string $invoice_id ): WC_Order {
	$order = wc_create_order();
	$order->set_currency( 'EUR' );
	$order->set_payment_method( MONKSTASH_PAY_GATEWAY_ID );
	$order->set_total( '10.00' );
	$order->update_meta_data( MonkStash_Pay_Orders::META_INVOICE, $invoice_id );
	$order->save();
	return wc_get_order( $order->get_id() );
}

function ms_invoice( string $id, string $status, array $extra = array() ): array {
	return array_merge(
		array(
			'id'       => $id,
			'status'   => $status,
			'received' => '0',
			'amount'   => array(
				'xmr'  => '0.05',
				'fiat' => array( 'currency' => 'EUR', 'amount' => '10.00' ),
			),
			'requiredConfirmations' => 1,
		),
		$extra
	);
}

function ms_notes( WC_Order $order ): array {
	return array_map(
		static function ( $n ) {
			return $n->content;
		},
		wc_get_order_notes( array( 'order_id' => $order->get_id() ) )
	);
}

function ms_count_notes( WC_Order $order, string $needle ): int {
	return count(
		array_filter(
			ms_notes( $order ),
			static function ( $c ) use ( $needle ) {
				return false !== strpos( $c, $needle );
			}
		)
	);
}

ms_check( class_exists( 'WooCommerce' ), 'WooCommerce is active' );
ms_check( class_exists( 'MonkStash_Pay_Orders' ), 'MonkStash Pay plugin is loaded' );
$gateways = WC()->payment_gateways()->payment_gateways();
ms_check( isset( $gateways[ MONKSTASH_PAY_GATEWAY_ID ] ), 'gateway is registered' );

// Paid order.
$id    = 'inv_paid_0000000000001';
$order = ms_order( $id );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'paid', array( 'received' => '0.05' ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->is_paid(), 'paid invoice completes the order' );

// Reorg: paid, then back to confirming.
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'confirming', array( 'received' => '0.05' ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->has_status( 'on-hold' ), 'paid then confirming (reorg) puts the order on hold' );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'paid', array( 'received' => '0.05' ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->is_paid(), 'paid again after the reorg completes the order' );

// Locked payment on an unpaid order.
$id     = 'inv_locked_00000000001';
$hash   = str_repeat( 'ab', 32 );
$locked = array(
	'lockedPayments' => array(
		array( 'txHash' => $hash, 'amount' => '0.05', 'unlockTime' => '9999999', 'confirmations' => 3 ),
	),
);
$order = ms_order( $id );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'waiting', $locked ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->has_status( 'on-hold' ), 'locked payment puts an unpaid order on hold' );
ms_check( 1 === ms_count_notes( $order, $hash ), 'locked payment gets one note' );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'waiting', $locked ) );
$order = wc_get_order( $order->get_id() );
ms_check( 1 === ms_count_notes( $order, $hash ), 'locked payment is noted only once' );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'expired', $locked ) );
$order = wc_get_order( $order->get_id() );
ms_check( ! $order->has_status( 'cancelled' ), 'order with a locked payment is not cancelled on expiry' );
ms_check( ! $order->is_paid(), 'locked payment never marks the order paid' );

// Bad hash is ignored.
$id    = 'inv_badhash_0000000001';
$order = ms_order( $id );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'waiting', array( 'lockedPayments' => array( array( 'txHash' => '<script>' ) ) ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->has_status( 'pending' ), 'malformed locked entry is ignored' );

// Plain expiry cancels.
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'expired' ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->has_status( 'cancelled' ), 'expired invoice without payment cancels the order' );

// Partial payment.
$id    = 'inv_partial_0000000001';
$order = ms_order( $id );
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'partial', array( 'received' => '0.02', 'remaining' => '0.03' ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( $order->has_status( 'on-hold' ), 'partial payment puts the order on hold' );

// Total changed after the invoice was made.
$id    = 'inv_mismatch_000000001';
$order = ms_order( $id );
$order->set_total( '12.00' );
$order->save();
MonkStash_Pay_Orders::apply( $order, ms_invoice( $id, 'paid', array( 'received' => '0.05' ) ) );
$order = wc_get_order( $order->get_id() );
ms_check( ! $order->is_paid() && $order->has_status( 'on-hold' ), 'paid invoice for a changed total is held, not completed' );

WP_CLI::log( 'WordPress ' . get_bloginfo( 'version' ) . ', WooCommerce ' . WC()->version . ', PHP ' . PHP_VERSION );
if ( $failures > 0 ) {
	WP_CLI::error( "$failures check(s) failed" );
}
WP_CLI::success( 'All checks passed' );
