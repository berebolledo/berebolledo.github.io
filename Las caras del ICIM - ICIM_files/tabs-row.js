jQuery( document ).ready( function( $ ) {
	$( 'body' ).on( 'click', '.js-tab', function( event ) {
		event.preventDefault();
		if ( $( this ).hasClass( 'active' ) ) {
			return false;
		}
		var $oldActive = $( this ).closest( '.js-tabs' ).find( '.active' );
		$oldActive.removeClass( 'active' );
		$( $oldActive.attr( 'href' ) ).removeClass( 'active' );
		$( $( this ).attr( 'href' ) ).addClass( 'active' );
		$( this ).addClass( 'active' );
		if ( $(this).data('uid') && $(this).data('slug') ) {
			var targetUrl = event.currentTarget.href.substring( 0, event.currentTarget.href.indexOf('#') );
			targetUrl = targetUrl + '#!/tab/'+ $(this).data('uid') +'/'+ $(this).data('slug') +'/';
			history.replaceState( {}, '', targetUrl );
		} else {
			history.replaceState( {}, '', event.currentTarget.href );
		}
	} );
	if ( location.hash.indexOf('#!/tab') !== -1 ) {
		var contentUid = location.hash.split('/');
		if ( ! contentUid[2] ) {
			return;
		}
		var $clickedTab = $( '.js-tab' ).filter( '[data-uid="'+ contentUid[2] +'"]' );
		$clickedTab.trigger( 'click' );
		$('html, body').animate( {
			scrollTop: $clickedTab.offset().top - 100
		} );
	}
	if ( location.hash.indexOf('udd-tabs-row') !== -1 && document.getElementById( location.hash.replace( '#', '' ) ) ) {
		var $clickedTab = $( '.js-tab' ).filter( '[href="'+ location.hash +'"]' );
		$clickedTab.trigger( 'click' );
		$('html, body').animate( {
			scrollTop: $clickedTab.offset().top - 100
		} );
	}
} );
