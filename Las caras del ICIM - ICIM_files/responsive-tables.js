/* eslint-disable no-var */
( function( $, Tablesaw ) {
	var init = function( context ) {
		if ( ! context ) {
			context = '';
		}
		$( '.wp-block-table table', context ).each( function( i, obj ) {
			if ( $( this ).find( 'thead' ).length ) {
				$( this ).addClass( 'tablesaw tablesaw-stack' );
				$( this ).attr( 'data-tablesaw-mode', 'stack' );
				Tablesaw.init( obj );
			}
		} );
	};
	init();
	$( 'body' ).on( 'shown.bs.modal', function( event ) {
		init( '.modal' );
	} );
}( jQuery, Tablesaw ) );
