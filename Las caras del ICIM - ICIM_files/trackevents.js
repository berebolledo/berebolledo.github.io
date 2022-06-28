jQuery(document).ready(function($){
	$('.btn').on('click', function(){
		var obj = $(this);
		var data = obj.data('params');
		if ( typeof data == 'object' && typeof _gat == 'object' && typeof _gat._getTrackers == 'function' ) {
			var trackers = _gat._getTrackers(),
				site_tracker = trackers[ trackers.length - 1 ];
			var category = data.category;
			var action = data.action;
			var label = data.label;
			var value = data.value;

			if ( site_tracker ) {
				var tracked = site_tracker._trackEvent(category, action, label, value);
				if ( typeof console.log === 'function' ) {
					console.log(site_tracker._getName(), tracked, category, action, label, value);
				}
			}

		}
	});
	$('#dec-inscribete, #dec-brochure').on('click', function(){
		if ( typeof dataLayer !== 'undefined' ) {
			var trackingParams = $.extend({
				'event': 'GAevent',
				'eventAction': 'clic'
			}, $(this).data('params'));
			if ( typeof console.log !== 'undefined' ) {
				console.log( trackingParams );
			}
			dataLayer.push( trackingParams );
		}
	});
	$('#brochure-programa-container').on('click', 'a.banner', function(event){
		var vpv = $(this).closest('#brochure-programa-container').data('vpv');
		if ( typeof dataLayer !== 'undefined' ) {
			dataLayer.push({
				'event': 'sendVirtualPageview',
				'vpv'  : vpv
			});
		}
	});
});