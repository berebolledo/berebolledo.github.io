( function( $ ) {
	/**
	 * Reajustar las posiciones de los avisos descartables
	 */
	function reflowNotices() {
		const windowWidth = $( window ).width();
		let baseTop = 0;

		// cosas que se pueden sumar:
		// altura de la navegación (.breadcrumb)
		if ( $( '.breadcrumb' ).length ) {
			// en tablets y escritorio
			if ( windowWidth > 768 ) {
				baseTop += $( '#page-navigation' ).height();
			} else {
				baseTop += $( '.breadcrumb' ).height();
			}
		}

		// altura del admin-bar: sólo si navegador > 600px
		if ( windowWidth > 600 && $( '.admin-bar' ).length ) {
			baseTop += $( '#wpadminbar' ).height();
		}

		// altura de campanita chula de la home
		if ( $( '.udd-alert__wrap' ).length ) {
			$( '.udd-alert__wrap' ).each( function() {
				if ( $( this ).css( 'position' ) !== 'static' ) {
					baseTop += 52;
				}
			} );
		}

		$( '.disposable-sticky:visible' ).each(
			function( index, element ) {
				const dfd = $.Deferred();
				const $element = $( element );
				const wasBelow = $element.hasClass( 'sps--blw' );
				dfd.done(
					function() {
						$element.removeClass( 'sps--blw' );
					},
					function() {
						const topDistance = $element.offset().top;
						$element.attr( 'data-sps-offset', topDistance );
						$element[ 0 ].style.setProperty( '--top-size', baseTop + 'px' );
						baseTop += $( this ).height();
					},
					function() {
						if ( wasBelow ) {
							$element.addClass( 'sps--blw' );
						}
					}
				);
				dfd.resolve();
			}
		);
	}

	if ( $( '.disposable-sticky' ).length > 0 ) {
		$( '.disposable-close, .js-close-alert' ).on( 'click', function() {
			_.delay( function() {
				reflowNotices();
			}, 100 );
		} );
		$( window ).on( 'load', function() {
			reflowNotices();
		} ).on( 'resize', _.debounce( function() {
			reflowNotices();
		}, 350 ) );
	}
}( jQuery ) );
