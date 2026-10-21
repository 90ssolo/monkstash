<?php
/**
 * The "Monero (XMR)" payment method. On checkout it asks the shop's MonkStash Pay server for an
 * invoice (a fresh address and a held price) and sends the customer to its checkout page.
 */

defined( 'ABSPATH' ) || exit;

class MonkStash_Pay_Gateway extends WC_Payment_Gateway {

	/** Currencies MonkStash Pay can price in (ECB reference currencies, plus XMR). */
	const CURRENCIES = array(
		'XMR', 'EUR', 'USD', 'JPY', 'BGN', 'CZK', 'DKK', 'GBP', 'HUF', 'PLN', 'RON', 'SEK', 'CHF', 'ISK', 'NOK', 'TRY',
		'AUD', 'BRL', 'CAD', 'CNY', 'HKD', 'IDR', 'ILS', 'INR', 'KRW', 'MXN', 'MYR', 'NZD', 'PHP', 'SGD', 'THB', 'ZAR',
	);

	public function __construct() {
		$this->id                 = MONKSTASH_PAY_GATEWAY_ID;
		$this->method_title       = __( 'MonkStash Pay (Monero)', 'monkstash-pay' );
		$this->method_description = __( 'Accept Monero through your own MonkStash Pay server. Payments go straight to your wallet; every order gets its own address.', 'monkstash-pay' );
		$this->has_fields         = false;
		$this->supports           = array( 'products' );

		$this->init_form_fields();
		$this->init_settings();

		$this->title       = $this->get_option( 'title' );
		$this->description = $this->get_option( 'description' );

		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'woocommerce_thankyou_' . $this->id, array( $this, 'thankyou' ) );
	}

	public function init_form_fields(): void {
		$this->form_fields = array(
			'enabled'        => array(
				'title'   => __( 'Enable', 'monkstash-pay' ),
				'type'    => 'checkbox',
				'label'   => __( 'Accept Monero with MonkStash Pay', 'monkstash-pay' ),
				'default' => 'no',
			),
			'title'          => array(
				'title'   => __( 'Title', 'monkstash-pay' ),
				'type'    => 'text',
				'default' => __( 'Monero (XMR)', 'monkstash-pay' ),
			),
			'description'    => array(
				'title'   => __( 'Description', 'monkstash-pay' ),
				'type'    => 'textarea',
				'default' => __( 'Pay privately with Monero from any wallet. You will see a QR code and the exact amount on the next page.', 'monkstash-pay' ),
			),
			'server_url'     => array(
				'title'       => __( 'MonkStash Pay server', 'monkstash-pay' ),
				'type'        => 'text',
				'placeholder' => 'https://pay.yourshop.com',
				'description' => __( 'The HTTPS address of your MonkStash Pay server (PAY_PUBLIC_URL).', 'monkstash-pay' ),
			),
			'api_key'        => array(
				'title'       => __( 'API key', 'monkstash-pay' ),
				'type'        => 'password',
				'description' => __( 'The PAY_API_KEY from your MonkStash Pay settings.', 'monkstash-pay' ),
			),
			'webhook_secret' => array(
				'title'       => __( 'Webhook secret', 'monkstash-pay' ),
				'type'        => 'password',
				/* translators: %s: webhook URL */
				'description' => sprintf( __( 'The PAY_WEBHOOK_SECRET from your MonkStash Pay settings. Set PAY_WEBHOOK_URL there to: %s', 'monkstash-pay' ), '<code>' . esc_html( MonkStash_Pay_Webhook::url() ) . '</code>' ),
			),
			'trusted_proxy'  => array(
				'title'       => __( 'Behind a trusted proxy', 'monkstash-pay' ),
				'type'        => 'checkbox',
				'label'       => __( 'This shop is behind a proxy or CDN that sets the visitor address header', 'monkstash-pay' ),
				'description' => __( 'Only turn this on if every request reaches your shop through a proxy you control (for example Cloudflare or a load balancer). Otherwise visitors could fake their address to get around the limit on new payment requests.', 'monkstash-pay' ),
				'default'     => 'no',
			),
		);
	}

	/** Saves settings, then checks the connection so mistakes show up right away. */
	public function process_admin_options() {
		$saved = parent::process_admin_options();
		$url   = trim( (string) $this->get_option( 'server_url' ) );
		if ( '' === $url || '' === trim( (string) $this->get_option( 'api_key' ) ) ) {
			return $saved;
		}
		if ( ! MonkStash_Pay_Client::is_safe_url( $url ) ) {
			WC_Admin_Settings::add_error( __( 'MonkStash Pay: the server address must start with https://.', 'monkstash-pay' ) );
			return $saved;
		}
		if ( strlen( trim( (string) $this->get_option( 'webhook_secret' ) ) ) < 32 ) {
			WC_Admin_Settings::add_error( __( 'MonkStash Pay: add the webhook secret (32+ characters), or orders will only update every few minutes.', 'monkstash-pay' ) );
		}
		try {
			$health = ( new MonkStash_Pay_Client( $url, (string) $this->get_option( 'api_key' ) ) )->health();
			WC_Admin_Settings::add_message(
				sprintf(
					/* translators: 1: network, 2: block height */
					__( 'MonkStash Pay connected: %1$s, synced to block %2$s.', 'monkstash-pay' ),
					esc_html( (string) ( $health['network'] ?? '?' ) ),
					esc_html( (string) ( $health['height'] ?? '?' ) )
				)
			);
		} catch ( Exception $e ) {
			WC_Admin_Settings::add_error( esc_html( $e->getMessage() ) );
		}
		return $saved;
	}

	public function is_available() {
		if ( ! parent::is_available() ) {
			return false;
		}
		if ( '' === trim( (string) $this->get_option( 'server_url' ) ) || '' === trim( (string) $this->get_option( 'api_key' ) ) ) {
			return false;
		}
		return in_array( get_woocommerce_currency(), self::CURRENCIES, true );
	}

	/**
	 * Creates the invoice and sends the customer to the MonkStash Pay checkout page.
	 *
	 * @param int $order_id
	 * @return array<string, string>
	 */
	public function process_payment( $order_id ) {
		$order  = wc_get_order( $order_id );
		$client = MonkStash_Pay_Client::from_settings();
		if ( ! $order || ! $client ) {
			wc_add_notice( __( 'Monero payments are not available right now.', 'monkstash-pay' ), 'error' );
			return array( 'result' => 'failure' );
		}

		// Reuse a still-open invoice if the customer comes back to pay the same order (and the
		// order still costs the same).
		$existing = (string) $order->get_meta( MonkStash_Pay_Orders::META_INVOICE );
		if ( '' !== $existing ) {
			try {
				$inv = $client->get_invoice( $existing );
				if ( in_array( $inv['status'] ?? '', array( 'waiting', 'partial', 'confirming' ), true ) && ( empty( $inv['expired'] ) || 'confirming' === ( $inv['status'] ?? '' ) ) && ! empty( $inv['checkoutUrl'] ) && MonkStash_Pay_Orders::matches_order( $order, $inv ) && MonkStash_Pay_Client::is_safe_url( (string) $inv['checkoutUrl'] ) ) {
					return array( 'result' => 'success', 'redirect' => (string) $inv['checkoutUrl'] );
				}
			} catch ( Exception $e ) {
				// Fall through and create a new invoice.
			}
		}

		// Each invoice reserves a fresh address on the shop's server: limit how many one visitor
		// can create, and how many the whole shop creates, so fake checkouts cannot flood it.
		$ip = self::client_ip( 'yes' === $this->get_option( 'trusted_proxy', 'no' ) );
		if ( ! self::take( 'monkstash_pay_rl_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 32 ), 10, 10 * MINUTE_IN_SECONDS ) ) {
			wc_add_notice( __( 'Too many payment attempts. Please wait a few minutes and try again.', 'monkstash-pay' ), 'error' );
			return array( 'result' => 'failure' );
		}
		/**
		 * Most new Monero payment requests the whole shop creates in 10 minutes. Keeps one attacker
		 * with many addresses from using up the payment server's limit on open invoices
		 * (PAY_MAX_OPEN_INVOICES). Raise it for a busy shop.
		 *
		 * @param int $max Default 100.
		 */
		$shop_max = max( 1, (int) apply_filters( 'monkstash_pay_max_invoices_per_10_minutes', 100 ) );
		if ( ! self::take( 'monkstash_pay_rl_shop', $shop_max, 10 * MINUTE_IN_SECONDS ) ) {
			wc_add_notice( __( 'Monero payments are very busy right now. Please try again in a few minutes, or choose another payment method.', 'monkstash-pay' ), 'error' );
			return array( 'result' => 'failure' );
		}

		try {
			$invoice = $client->create_invoice(
				array(
					'amount'    => wc_format_decimal( $order->get_total(), 'XMR' === $order->get_currency() ? 12 : 2 ),
					'currency'  => $order->get_currency(),
					'reference' => sprintf( /* translators: %s: order number */ __( 'Order %s', 'monkstash-pay' ), $order->get_order_number() ),
					'metadata'  => wp_json_encode( array( 'order_id' => $order->get_id() ) ),
					'returnUrl' => $this->get_return_url( $order ),
				)
			);
		} catch ( Exception $e ) {
			wc_add_notice( __( 'We could not start the Monero payment. Please try again in a minute, or choose another payment method.', 'monkstash-pay' ), 'error' );
			$order->add_order_note( esc_html( $e->getMessage() ) );
			return array( 'result' => 'failure' );
		}

		$checkout = isset( $invoice['checkoutUrl'] ) ? (string) $invoice['checkoutUrl'] : '';
		if ( empty( $invoice['id'] ) || ! MonkStash_Pay_Client::is_safe_url( $checkout ) ) {
			wc_add_notice( __( 'We could not start the Monero payment.', 'monkstash-pay' ), 'error' );
			return array( 'result' => 'failure' );
		}

		// Remembers the invoice this one replaces, so money that still arrives for it is noticed.
		MonkStash_Pay_Orders::replace_invoice( $order, (string) $invoice['id'], $checkout );
		$order->add_order_note(
			sprintf(
				/* translators: 1: XMR amount, 2: expiry time */
				__( 'Waiting for a Monero payment of %1$s XMR (price held until %2$s).', 'monkstash-pay' ),
				esc_html( (string) ( $invoice['amount']['xmr'] ?? '?' ) ),
				esc_html( (string) ( $invoice['expiresAt'] ?? '?' ) )
			)
		);
		$order->update_status( 'pending' );
		$order->save();
		WC()->cart->empty_cart();

		return array( 'result' => 'success', 'redirect' => $checkout );
	}

	/**
	 * The visitor's address for rate limiting. Headers like X-Forwarded-For are set by the client
	 * and can be faked, so they are only used when the shop says it is behind a trusted proxy;
	 * otherwise the address of the connection itself counts.
	 */
	private static function client_ip( bool $behind_proxy ): string {
		if ( $behind_proxy && class_exists( 'WC_Geolocation' ) ) {
			return (string) WC_Geolocation::get_ip_address();
		}
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		return false !== filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '';
	}

	/**
	 * Fixed-window counter in a transient: allows $max hits per $window seconds, counted from
	 * the first hit. Returns false once the window is full. Keys hold no personal data (visitor
	 * addresses are hashed by the caller).
	 */
	private static function take( string $key, int $max, int $window ): bool {
		$now = time();
		$hit = get_transient( $key );
		if ( ! is_array( $hit ) || ! isset( $hit['n'], $hit['reset'] ) || (int) $hit['reset'] <= $now ) {
			$hit = array(
				'n'     => 0,
				'reset' => $now + $window,
			);
		}
		if ( (int) $hit['n'] >= $max ) {
			return false;
		}
		$hit['n'] = (int) $hit['n'] + 1;
		set_transient( $key, $hit, max( 1, (int) $hit['reset'] - $now ) );
		return true;
	}

	/** Order-received page: tells the customer where things stand. */
	public function thankyou( $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		if ( $order->is_paid() ) {
			echo '<p>' . esc_html__( 'Your Monero payment is complete. Thank you!', 'monkstash-pay' ) . '</p>';
			return;
		}
		$checkout = (string) $order->get_meta( MonkStash_Pay_Orders::META_CHECKOUT );
		echo '<p>' . esc_html__( 'We are waiting for your Monero payment to arrive. This page updates when you reload it; we will also email you when the order is paid.', 'monkstash-pay' ) . '</p>';
		if ( $checkout && MonkStash_Pay_Client::is_safe_url( $checkout ) && $order->has_status( 'pending' ) ) {
			echo '<p><a class="button" href="' . esc_url( $checkout ) . '">' . esc_html__( 'Open the payment page again', 'monkstash-pay' ) . '</a></p>';
		}
	}
}
