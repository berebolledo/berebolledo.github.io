/* eslint-disable no-var */
/* eslint-disable camelcase */
/* eslint-disable comma-dangle */
( function( $ ) {
	var api_base = $( document ).find( 'link[rel="https://api.w.org/"]' ).attr( 'href' );
	var $modal;
	var original_url = window.location.href.replace( window.location.hash, '' );
	var this_domain = window.location.hostname;
	var showInModal = function( content ) {
		$( 'body' ).removeClass( 'is-loading' );
		$modal
			.find( '.modal-content' )
			.html( content );
		$modal.modal( 'show' )
			.animate( {
				scrollTop: 0
			} );
	};
	$( document ).ready( function() {
		var postid;
		$modal = $( '#udd-modal' ).modal( {
			show: false
		} ).on( 'hidden.bs.modal', function() {
			window.history.replaceState( null, '', original_url );
		} );

		if ( $( 'body' ).hasClass( 'modal-open' ) ) {
			$modal.modal( 'show' );
		}

		// Ver si la URL actual corresponde a un modal conocido
		if ( window.location.hash.indexOf( '#!/modal' ) === 0 ) {
			postid = window.location.hash.split( '/' )[ 2 ];
			// Solicitar y mostrar
			$.getJSON(
				api_base + 'udd-blocks/v1/services/get-modal/' + postid
			).then( function( data, textStatus, jqXHR ) {
				showInModal( data );
			} );
		}
	} );
	$( document ).on( 'click', '.js-show-in-modal a', function( event, trigger_reload ) {
		var clickedElement = $( this );
		// intentar obtener id del contenido al que se enlaza
		var postid = clickedElement.data( 'postid' );
		var has_data_url = !! clickedElement.data( 'url' );
		var full_url = clickedElement.data( 'url' ) ? clickedElement.data( 'url' ) : clickedElement.attr( 'href' );
		// normalizar URL clickeada
		var relative_url = full_url.replace( 'http://', '' ).replace( 'https://', '' );
		var link_domain = relative_url.split( '/' )[ 0 ];
		var path = relative_url.replace( this_domain, '' ).split( '?' )[ 0 ].split( '#' )[ 0 ].replace( /\/$/, '' ).replace( /^\//, '' );

		// si la URL solicitada no es parte de este dominio, ingresar directamente a la URL.
		if ( ( typeof trigger_reload !== 'undefined' && !! trigger_reload ) || this_domain !== link_domain ) {
			return true;
		}
		event.preventDefault();

		// @todo por acá se podría implementar un caché local

		// prepararse...
		$( 'body' ).addClass( 'is-loading' );
		if ( postid ) {
			// enviar petición por $post->ID del contenido
			$.getJSON(
				api_base + 'udd-blocks/v1/services/get-modal/' + postid
			).then( function( data, textStatus, jqHXR ) {
				var post_name = jqHXR.getResponseHeader( 'X-Post-Name' );
				showInModal( data );
				window.history.replaceState( null, '', original_url + '#!/modal/' + postid + '/'+ post_name );
			} ).fail( function() {
				window.location.href = clickedElement.attr( 'href' );
			} );
		} else if ( has_data_url ) {
			// enviar petición por $post->ID del contenido
			$.getJSON(
				api_base + 'udd-blocks/v1/services/get-modal/',
				{
					url: full_url
				}
			).then( function( data, textStatus, jqXHR ) {
				var post_name = jqXHR.getResponseHeader( 'X-Post-Name' );
				var post_id = jqXHR.getResponseHeader( 'X-Post-ID' );
				showInModal( data );
				window.history.replaceState( null, '', original_url + '#!/modal/' + post_id + '/' + post_name );
			} ).fail( function() {
				window.location.href = clickedElement.attr( 'href' );
			} );
		} else {
			// no sabemos el ID, intentemos el método antiguo
			$.getJSON(
				api_base + 'wp/v2/pages/post-name/' + encodeURIComponent( path )
			).then( function( data ) {
				showInModal( data.content.rendered );
				window.history.replaceState( null, '', original_url + '#!/' + path );
			} ).fail( function( ) {
				window.location.href = clickedElement.attr( 'href' );
			} );
		}
	} );
}( jQuery ) );
