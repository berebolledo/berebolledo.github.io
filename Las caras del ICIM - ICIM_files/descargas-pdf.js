(function($){
	$(document).ready(function(){
		$('a[href$=".pdf"]').click(function(){
			var trackers = _gat._getTrackers(),
				specific_tracker = trackers[ trackers.length - 1 ],
				dl_url = $(this).attr('href'),
				tracked = specific_tracker._trackEvent('Descargas', 'PDF', dl_url);
				if ( typeof console.log == 'function' ) console.log( specific_tracker._getName(), tracked, dl_url );
		}).addClass('pdf-download');
	});
})(jQuery);