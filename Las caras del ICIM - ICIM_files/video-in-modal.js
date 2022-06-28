( function( $ ) {
	$( document ).on( 'click', '.js-udd-video-modal', function( event ) {
		const videoId = $( this ).data( 'video-id' );
		if ( ! videoId ) {
			return true;
		}
		event.preventDefault();
		const videoSrc = 'https://www.youtube.com/embed/' + videoId + '?rel=0&autoplay=1&enablejsapi=1';
		const videoIframe = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" width="960" height="540" src="' + videoSrc + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
		$( '#udd-modal-center .modal-dialog' ).addClass( 'modal-xl' );
		$( '#udd-modal-center' )
			.find( '.modal-content' )
			.html( videoIframe )
			.end()
			.modal()
			.on( 'hide.bs.modal', function() {
				$( '#udd-modal-center .modal-dialog' ).removeClass( 'modal-xl' );
				$( '#udd-modal-center .modal-content' ).html( '' );
			} );
	} );
}( jQuery ) );
