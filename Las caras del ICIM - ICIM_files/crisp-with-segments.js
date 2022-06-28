(function($){
	// el chat debe estar oculto inicialmente
	$crisp.push( [ 'do', 'chat:hide' ] );
	$( function() {
		var $wizard = $('.udd-crisp-wizard');
		var data_requests = [];

		// obtener datos desde portal corporativo
		UDD_Crisp_Segments.remote_ids.forEach( function( remote_id ){
			var this_request = window.fetch(
				UDD_Crisp_Segments.corporate_api + 'wp/v2/career/' + remote_id +'/admissions-info?_embed=true'
			).then( function( response ){
				return response.json();
			} );
			data_requests.push( this_request );
		} );

		/**
		 * Información de los canales
		 * @typedef Channel_Info
		 * @type {object}
		 * @property {string} type - Tipo de canal
		 * @property {number} channel_id - ID del canal
		 * @property {boolean} available - Disponibilidad
		 */

		/**
		 * @type {Channel_Info[]}
		 */
		var channels_info = [];
		var chat_status = {};
		var chat_is_available = false;
		var channel_types = [];
		var channel_locations = [];
		var all_contacts = [];

		var chat_choose_locations = false;
		var chat_choose_types = false;
		var contacts_template = _.template( $('#udd-crisp-wizard__contacts-template').html() );

		// extraer datos significativos
		Promise.all( data_requests ).then( function( career_data ){
			career_data.forEach( function( data ){
				data.contacts.forEach(function(contact){
					all_contacts.push(contact);
				});
				data.chat_channels.forEach( function( channel ){
					var location_data = data._embedded['wp:term'][0][0];
					delete location_data._links;
					channels_info.push( $.extend( channel, { location: location_data } ) );
					if ( channel.available ) {
						chat_is_available = true;
					}
					if ( channel_types.indexOf( channel.type ) === -1 ) {
						channel_types.push( channel.type );
					}
					if ( channel_locations.indexOf( location_data.slug ) === -1 ) {
						channel_locations.push( location_data.slug );
					}
				} );
			} );
			channels_info.forEach( function( channel ){
				if ( typeof chat_status[ channel.type ] === 'undefined' ) {
					chat_status[ channel.type ] = {};
				}
				chat_status[ channel.type ][ channel.location.slug ] = channel.available;
			} );
		} ).then(function(){
			var seen_contacts = [];
			all_contacts = all_contacts.reduce(function(carry, item){
				var hash = item.location.slug + item.type;
				if ( seen_contacts.indexOf( hash ) === -1 ) {
					seen_contacts.push( hash );
					carry.push( item );
				}
				return carry;
			}, []);
			console.log( 'chat data:', { channel_types, channels_info, chat_status, all_contacts });
			if ( channel_types.length > 1 ) {
				chat_choose_types = true;
				$wizard.addClass('udd-crisp-wizard--has-types');
			}
			if ( channel_locations.length > 1 ) {
				chat_choose_locations = true;
				$wizard.addClass('udd-crisp-wizard--has-locations');
			}
			if ( chat_is_available ) {
				$wizard.addClass('udd-crisp-wizard--ready');
				$('body').addClass('has-udd-crisp-wizard');
			}
		} );
		var chosen_type = null;
		var chosen_location = null;

		// abrir el wizard
		$('.udd-crisp-wizard--closed').on('click', '.udd-crisp-wizard__stage--start', function(e){
			e.preventDefault();
			$wizard
				.removeClass('udd-crisp-wizard--closed')
				.addClass('udd-crisp-wizard--open')
			if ( chosen_type ) {
				$wizard
					.addClass('udd-crisp-wizard--has-previous')
					.addClass('udd-crisp-wizard--choose-location')
					.addClass('udd-crisp-wizard--choose-' + chosen_type +'-location');
			} else {
				$wizard.addClass('udd-crisp-wizard--choose-type');
			}
		});

		// cerrar
		$('.udd-crisp-wizard__button-close').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			$wizard
				.removeClass('udd-crisp-wizard--open')
				.removeClass('udd-crisp-wizard--choose-type')
				.removeClass('udd-crisp-wizard--has-previous')
				.addClass('udd-crisp-wizard--closed');
		});

		// botón "volver"
		$('.udd-crisp-wizard__button-back').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			$wizard
				.removeClass('udd-crisp-wizard--choose-location')
				.removeClass('udd-crisp-wizard--choose-' + chosen_type + '-location' )
				.removeClass('udd-crisp-wizard--has-previous')
				.addClass( 'udd-crisp-wizard--choose-type' );
		});

		// siempre puede haber un solo elegido entre mismas alternativas
		$('.udd-crisp-wizard__button').on('click', function(e){
			e.preventDefault();
			$(this)
				.siblings('.udd-crisp-wizard__button--chosen')
				.removeClass('udd-crisp-wizard__button--chosen');
			$(this).addClass('udd-crisp-wizard__button--chosen');
		});

		// seleccionar tipo de contacto
		$('.udd-crisp-wizard__stage--type').on('click', 'button', function(e){
			e.preventDefault();
			chosen_type = $(this).data('type');
			var $chosen_button = $(this);
			$chosen_button.addClass('udd-crisp-wizard__button--loading');
			var mock_timeout = setTimeout( function() {
				$chosen_button.removeClass('udd-crisp-wizard__button--loading');
				$wizard
					.removeClass('udd-crisp-wizard--choose-type');
				if ( chat_choose_locations ) {
					// pasa a seleccionar sede
					$wizard
						.addClass('udd-crisp-wizard--has-previous')
						.addClass('udd-crisp-wizard--choose-location')
						.addClass('udd-crisp-wizard--choose-'+ chosen_type +'-location')
				} else {
					// mostrar el chat
					var selected_chat_channel_id = channels_info.reduce(function( carry, item ){
						if ( item.type === chosen_type ) {
							carry = item.channel_id;
							console.log( 'el canal adecuado es:', item.channel_id, item );
						}
						return carry;
					}, null );
					if ( selected_chat_channel_id ) {
						show_crisp_chat( selected_chat_channel_id );
					}
				}
			}, get_random_int_inclusive( 200, 600 ) );
		});

		// seleccionar sede
		$('.udd-crisp-wizard__stage--location').on('click', 'button', function(e){
			e.preventDefault();
			chosen_type = $(this).data('type');
			chosen_location = $(this).data('location');
			// tenemos los datos que necesitamos, vamos al chat
			$(this).addClass('udd-crisp-wizard__button--loading');
			console.log( 'selecciones', chosen_type, chosen_location );
			var selected_chat_channel_id = channels_info.reduce(function( carry, item ){
				if ( item.type === chosen_type && item.location.slug === chosen_location ) {
					carry = item.channel_id;
					console.log( 'el canal adecuado es:', item.channel_id, item );
				}
				return carry;
			}, null);
			if ( selected_chat_channel_id ) {
				show_crisp_chat( selected_chat_channel_id );
			}
		});

		function get_random_int_inclusive(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
		}

		var show_crisp_chat = function( chat_channel_id ) {
			var chat_channel = channels_info.reduce( function( carry, item ){
				if ( item.channel_id === chat_channel_id ) {
					carry = item;
				}
				return carry;
			}, null );
			var is_available = chat_channel.available;
			var selected_location = chosen_location ? chosen_location : chat_channel.location.slug;
			if ( is_available ) {
				$crisp.push([ "set", "session:data", [ [ [ 'tipo-seleccionado', chosen_type ] ] ] ]);
				$crisp.push([ "set", "session:data", [ [ [ 'sede-seleccionada', selected_location ] ] ] ])
				$crisp.push([ "set", "session:data", [ [ [ 'id-canal', chat_channel_id ] ] ] ])
				var mock_timeout = setTimeout( function(){
					$wizard.removeClass('udd-crisp-wizard--ready');
					$crisp.push(["do", "chat:show"]);
					$crisp.push(["do", "chat:open"]);
				}, get_random_int_inclusive( 200, 1000 ) );
			} else {
				// obtener datos del contacto
				var contact_data = all_contacts.reduce( function( carry, item ){
					if ( item.type === chosen_type && item.location.slug === selected_location ) {
						carry =  item;
					}
					return carry;
				}, null );
				var mock_timeout = setTimeout( function(){
					$('.udd-crisp-wizard__contacts-content').html(
						contacts_template({ data: contact_data })
					);
					$('.udd-crisp-wizard__button--loading').removeClass('udd-crisp-wizard__button--loading');
					$wizard
						.removeClass('udd-crisp-wizard--choose-type')
						.removeClass('udd-crisp-wizard--choose-location')
						.removeClass('udd-crisp-wizard--choose-' + chosen_type + '-location')
						.addClass('udd-crisp-wizard--show-contacts');
				}, get_random_int_inclusive( 200, 700 ) );
			}
		}
	});
})(jQuery);
