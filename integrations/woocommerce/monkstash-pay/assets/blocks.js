/* MonkStash Pay: registers "Monero (XMR)" in the WooCommerce block checkout. No build step. */
( function () {
	var registry = window.wc && window.wc.wcBlocksRegistry;
	var settings = window.wc && window.wc.wcSettings;
	if ( ! registry || ! settings || ! window.wp || ! window.wp.element ) {
		return;
	}
	var el = window.wp.element.createElement;
	var decode = ( window.wp.htmlEntities && window.wp.htmlEntities.decodeEntities ) || function ( s ) { return s; };
	var data = settings.getSetting( 'monkstash_pay_data', {} );
	var title = decode( data.title || 'Monero (XMR)' );
	var Content = function () {
		return el( 'p', null, decode( data.description || '' ) );
	};
	registry.registerPaymentMethod( {
		name: 'monkstash_pay',
		label: el( 'span', null, title ),
		ariaLabel: title,
		content: el( Content ),
		edit: el( Content ),
		canMakePayment: function () { return true; },
		supports: { features: data.supports || [ 'products' ] },
	} );
} )();
