<?php
/**
 * Removes the plugin's settings (including the API key and webhook secret) when it is deleted.
 * Order notes and order meta are kept: they are part of your order history.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'woocommerce_monkstash_pay_settings' );
wp_clear_scheduled_hook( 'monkstash_pay_poll' );
