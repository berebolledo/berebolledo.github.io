(function(){
	window.addEventListener('message', function( e ){
		if ( e.origin !== UDD_Vecina_Forms.allowed_origin ) {
			return;
		}
		if ( e.data.action === 'getParentUrl' )	{
			// get origin iframe
			var originIframe = document.getElementById( e.data.iframe_id );
			if ( ! originIframe ) {
				throw 'No se encuentra el iframe con id ' + e.data.iframe_id;
			}
			if ( e.data.nonce !== UDD_Vecina_Forms._nonce ) {
				throw 'El código nonce no coincide';
			}
			originIframe.contentWindow.postMessage(
				{
					action: 'sendParentUrl',
					parent_url: location.href
				},
				UDD_Vecina_Forms.allowed_origin
			);
		}
	});
})();
