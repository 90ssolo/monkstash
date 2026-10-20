<?php
/**
 * Makes "Monero (XMR)" available in WooCommerce's block-based checkout (the default since 8.3).
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class MonkStash_Pay_Blocks extends AbstractPaymentMethodType {

	protected $name = MONKSTASH_PAY_GATEWAY_ID;

	public function initialize() {
		$this->settings = get_option( 'woocommerce_' . MONKSTASH_PAY_GATEWAY_ID . '_settings', array() );
	}

	public function is_active() {
		$gateways = WC()->payment_gateways() ? WC()->payment_gateways()->payment_gateways() : array();
		return isset( $gateways[ MONKSTASH_PAY_GATEWAY_ID ] ) && $gateways[ MONKSTASH_PAY_GATEWAY_ID ]->is_available();
	}

	public function get_payment_method_script_handles() {
		wp_register_script(
			'monkstash-pay-blocks',
			MONKSTASH_PAY_URL . 'assets/blocks.js',
			array( 'wc-blocks-registry', 'wc-settings', 'wp-element', 'wp-html-entities' ),
			MONKSTASH_PAY_VERSION,
			true
		);
		return array( 'monkstash-pay-blocks' );
	}

	public function get_payment_method_data() {
		return array(
			'title'       => isset( $this->settings['title'] ) ? (string) $this->settings['title'] : __( 'Monero (XMR)', 'monkstash-pay' ),
			'description' => isset( $this->settings['description'] ) ? (string) $this->settings['description'] : '',
			'supports'    => array( 'products' ),
		);
	}
}
