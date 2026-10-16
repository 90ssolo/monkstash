<?php
/**
 * Talks to the merchant's own MonkStash Pay server over its API.
 */

defined( 'ABSPATH' ) || exit;

class MonkStash_Pay_Client {

	/** @var string */
	private $base;

	/** @var string */
	private $api_key;

	public function __construct( string $base, string $api_key ) {
		$this->base    = untrailingslashit( $base );
		$this->api_key = $api_key;
	}

	/** Builds a client from the gateway settings, or null when it is not configured yet. */
	public static function from_settings(): ?self {
		$settings = get_option( 'woocommerce_' . MONKSTASH_PAY_GATEWAY_ID . '_settings', array() );
		$url      = isset( $settings['server_url'] ) ? trim( (string) $settings['server_url'] ) : '';
		$key      = isset( $settings['api_key'] ) ? trim( (string) $settings['api_key'] ) : '';
		if ( '' === $url || '' === $key ) {
			return null;
		}
		return new self( $url, $key );
	}

	/** True for https URLs, or http on localhost (for development). */
	public static function is_safe_url( string $url ): bool {
		$parts = wp_parse_url( $url );
		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			return false;
		}
		if ( 'https' === $parts['scheme'] ) {
			return true;
		}
		return 'http' === $parts['scheme'] && in_array( $parts['host'], array( 'localhost', '127.0.0.1' ), true );
	}

	/**
	 * @param array<string, mixed> $body
	 * @return array<string, mixed>
	 * @throws Exception With a message safe to show the shop owner.
	 */
	public function create_invoice( array $body ): array {
		return $this->request( 'POST', '/api/invoices', $body, 201 );
	}

	/**
	 * @return array<string, mixed>
	 * @throws Exception
	 */
	public function get_invoice( string $id ): array {
		if ( ! preg_match( '/^[A-Za-z0-9_-]{16,64}$/', $id ) ) {
			throw new Exception( 'Invalid invoice id.' );
		}
		return $this->request( 'GET', '/api/invoices/' . rawurlencode( $id ), null, 200 );
	}

	/**
	 * @return array<string, mixed>
	 * @throws Exception
	 */
	public function health(): array {
		return $this->request( 'GET', '/api/health', null, 200 );
	}

	/**
	 * @param array<string, mixed>|null $body
	 * @return array<string, mixed>
	 * @throws Exception
	 */
	private function request( string $method, string $path, ?array $body, int $expect ): array {
		if ( ! self::is_safe_url( $this->base ) ) {
			throw new Exception( __( 'The MonkStash Pay server address must start with https://.', 'monkstash-pay' ) );
		}
		$args = array(
			'method'      => $method,
			'timeout'     => 20,
			'redirection' => 0,
			'headers'     => array(
				'Authorization' => 'Bearer ' . $this->api_key,
				'Accept'        => 'application/json',
			),
		);
		if ( null !== $body ) {
			$args['headers']['Content-Type'] = 'application/json';
			$args['body']                    = wp_json_encode( $body );
		}
		$res = wp_remote_request( $this->base . $path, $args );
		if ( is_wp_error( $res ) ) {
			throw new Exception( sprintf( /* translators: %s: error message */ __( 'Could not reach the MonkStash Pay server: %s', 'monkstash-pay' ), $res->get_error_message() ) );
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( $code !== $expect || ! is_array( $data ) ) {
			$msg = is_array( $data ) && isset( $data['error'] ) ? (string) $data['error'] : 'HTTP ' . $code;
			// The HTTP status is the exception code: 503 means "busy or still syncing, try later".
			throw new Exception( sprintf( /* translators: %s: error message */ __( 'MonkStash Pay: %s', 'monkstash-pay' ), $msg ), $code );
		}
		return $data;
	}
}
