<?php
/**
 * Receives MonkStash Pay webhooks at /wp-json/monkstash-pay/v1/webhook.
 *
 * The signature is checked first (HMAC-SHA256 of "<t>.<raw body>", 5-minute window). Even then,
 * the order is only changed after asking the MonkStash Pay API for the invoice's real status.
 */

defined( 'ABSPATH' ) || exit;

class MonkStash_Pay_Webhook {

	const TOLERANCE = 300;

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register' ) );
	}

	public static function url(): string {
		return rest_url( 'monkstash-pay/v1/webhook' );
	}

	public static function register(): void {
		register_rest_route(
			'monkstash-pay/v1',
			'/webhook',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle' ),
				// Public by design: authenticity comes from the signature, checked in handle().
				'permission_callback' => '__return_true',
			)
		);
	}

	/** Checks the X-MonkStash-Signature header against the raw body. */
	public static function verify( string $secret, string $header, string $raw_body, ?int $now = null ): bool {
		$now   = null === $now ? time() : $now;
		$parts = array();
		foreach ( explode( ',', $header ) as $pair ) {
			$kv = explode( '=', trim( $pair ), 2 );
			if ( 2 === count( $kv ) ) {
				$parts[ $kv[0] ] = $kv[1];
			}
		}
		if ( ! isset( $parts['t'], $parts['v1'] ) || ! ctype_digit( $parts['t'] ) ) {
			return false;
		}
		if ( abs( $now - (int) $parts['t'] ) > self::TOLERANCE ) {
			return false;
		}
		$expected = hash_hmac( 'sha256', $parts['t'] . '.' . $raw_body, $secret );
		return hash_equals( $expected, $parts['v1'] );
	}

	public static function handle( WP_REST_Request $request ): WP_REST_Response {
		$settings = get_option( 'woocommerce_' . MONKSTASH_PAY_GATEWAY_ID . '_settings', array() );
		$secret   = isset( $settings['webhook_secret'] ) ? trim( (string) $settings['webhook_secret'] ) : '';
		$raw      = (string) $request->get_body();
		$header   = (string) $request->get_header( 'x_monkstash_signature' );

		if ( strlen( $secret ) < 32 || ! self::verify( $secret, $header, $raw ) ) {
			return new WP_REST_Response( array( 'error' => 'invalid signature' ), 401 );
		}

		$event = json_decode( $raw, true );
		if ( ! is_array( $event ) || empty( $event['data']['id'] ) ) {
			return new WP_REST_Response( array( 'error' => 'bad payload' ), 400 );
		}

		// Our metadata carries the order id; the invoice id must match what the order stored.
		$meta     = isset( $event['data']['metadata'] ) ? json_decode( (string) $event['data']['metadata'], true ) : null;
		$order_id = is_array( $meta ) && isset( $meta['order_id'] ) ? absint( $meta['order_id'] ) : 0;
		$order    = $order_id ? wc_get_order( $order_id ) : false;
		if ( ! $order || MONKSTASH_PAY_GATEWAY_ID !== $order->get_payment_method() ) {
			// Not ours (or deleted): acknowledge so the server stops retrying.
			return new WP_REST_Response( array( 'ok' => true, 'ignored' => true ), 200 );
		}

		$client = MonkStash_Pay_Client::from_settings();
		if ( ! $client ) {
			return new WP_REST_Response( array( 'error' => 'not configured' ), 503 );
		}
		try {
			// Do not trust the webhook body: fetch the authoritative status.
			MonkStash_Pay_Orders::apply( $order, $client->get_invoice( (string) $event['data']['id'] ) );
		} catch ( Exception $e ) {
			// Ask the server to retry later.
			return new WP_REST_Response( array( 'error' => 'could not confirm status' ), 503 );
		}
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}
}
