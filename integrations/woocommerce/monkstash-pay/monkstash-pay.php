<?php
/**
 * Plugin Name:       MonkStash Pay
 * Plugin URI:        https://monkstash.com/
 * Description:       Accept Monero (XMR) on WooCommerce through your own MonkStash Pay server. Non-custodial: payments go straight to your wallet, with a fresh address for every order.
 * Version:           0.1.1
 * Requires at least: 6.4
 * Requires PHP:      7.4
 * WC requires at least: 8.0
 * WC tested up to:   11.2
 * Author:            The MonkStash developers
 * License:           New BSD License
 * License URI:       https://opensource.org/licenses/BSD-3-Clause
 * Text Domain:       monkstash-pay
 */

defined( 'ABSPATH' ) || exit;

define( 'MONKSTASH_PAY_VERSION', '0.1.1' );
define( 'MONKSTASH_PAY_FILE', __FILE__ );
define( 'MONKSTASH_PAY_DIR', plugin_dir_path( __FILE__ ) );
define( 'MONKSTASH_PAY_URL', plugin_dir_url( __FILE__ ) );
define( 'MONKSTASH_PAY_GATEWAY_ID', 'monkstash_pay' );

// Declare compatibility with WooCommerce's order tables (HPOS) and the block checkout.
add_action(
	'before_woocommerce_init',
	static function () {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
		}
	}
);

add_action(
	'plugins_loaded',
	static function () {
		if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
			return; // WooCommerce is not active.
		}
		require_once MONKSTASH_PAY_DIR . 'includes/class-monkstash-pay-client.php';
		require_once MONKSTASH_PAY_DIR . 'includes/class-monkstash-pay-orders.php';
		require_once MONKSTASH_PAY_DIR . 'includes/class-monkstash-pay-gateway.php';
		require_once MONKSTASH_PAY_DIR . 'includes/class-monkstash-pay-webhook.php';

		add_filter(
			'woocommerce_payment_gateways',
			static function ( $methods ) {
				$methods[] = 'MonkStash_Pay_Gateway';
				return $methods;
			}
		);

		MonkStash_Pay_Webhook::init();
		MonkStash_Pay_Orders::init();
	}
);

// Block checkout support.
add_action(
	'woocommerce_blocks_loaded',
	static function () {
		if ( ! class_exists( \Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType::class ) ) {
			return;
		}
		require_once MONKSTASH_PAY_DIR . 'includes/class-monkstash-pay-blocks.php';
		add_action(
			'woocommerce_blocks_payment_method_type_registration',
			static function ( $registry ) {
				$registry->register( new MonkStash_Pay_Blocks() );
			}
		);
	}
);

// A five-minute schedule for the fallback status check (in case a webhook is missed).
add_filter(
	'cron_schedules',
	static function ( $schedules ) {
		$schedules['monkstash_pay_five_minutes'] = array(
			'interval' => 300,
			'display'  => __( 'Every five minutes (MonkStash Pay)', 'monkstash-pay' ),
		);
		return $schedules;
	}
);

register_activation_hook(
	__FILE__,
	static function () {
		if ( ! wp_next_scheduled( 'monkstash_pay_poll' ) ) {
			wp_schedule_event( time() + 300, 'monkstash_pay_five_minutes', 'monkstash_pay_poll' );
		}
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		wp_clear_scheduled_hook( 'monkstash_pay_poll' );
	}
);
