/*
 * /////////////////////////////////////////
 *      BBox Lab API - 2013 - V0.0.2
 * /////////////////////////////////////////
 *
 * Site : Julien Guézennec <jguezenn@bouyguestelecom.fr>
 * API & Box : Clément Le Breton / Arthur Saint-Genis
 *
 * /////////////////////////////////////////
 */

$(function() {

	if (window.APP == 'undefined' || window.isLocal == 'undefined') {
		alert('Fichier de configuration absent ./js/app-config.js');
		return;
	}

	// ----------- SOMES VARS ---------------------------------------------------------------------------------- //

	var APP = window.APP;
	APP.values = $.extend(true, {}, APP.defaultValues); // Copy default config into user config (before fetching it)

	var $window           = $(window),
		$document         = $(document),
		$body             = $('body'),
		$page             = $('#mainBox'), // Div page container
		$subPage          = $('#subBox'),
		$menu             = $('#menu'),
		$menuUl           = $menu.find('ul:first'),
		$ssMenu           = $('#ssMenu'),
		$ssMenuUl         = $ssMenu.find('ul:first'),
		$ssMenuTv         = $('#ssMenuTv'),
		$ssMenuUlTv       = $ssMenuTv.find('ul:first'),
		$appMenu          = (APP.isTV ? $menuUl : $ssMenuUl);

	var hash              = getHash(), // HASH
		EVENTS            = [],
		ANIMS             = [],
		winH              = $window.height(),
		winW              = $window.width(),
		userAgent         = navigator.userAgent.toLowerCase(),
		newHash           = null,
		forms             = '',
		selectedDefault   = '',
		$currentFocusItem = null;

	$(APP.isTV ? '#boxADMIN' : '#boxADMINTV').remove();

	// ----------- FUNCTIONS ---------------------------------------------------------------------------------- //

	var getFieldVal = function(field) {
			// if (APP.db) console.log('getFieldVal() field', field);
			var value = APP.values[field.id] || '';
			if (field.values) {
				for (var i = 0, len = field.values.length; i < len; i++) {
					if (field.values[i].id == value)
						value = field.values[i].title;
				}
			}
			if (!value) console.log('No value for ', field.id);
			return value;
		},

		getList = function(field, value) {

			var tpl = '';
			switch(field.id) {
				case 'profilsId':
					var services = '';
					if (value.oauth && typeof(value.oauth) == 'object') {
						for (var j = 0, len2 = value.oauth.length; j < len2; j++) {
							services += value.oauth[j].name+', ';
						}
						if (services) services = services.substring(0, services.length -2);
					}
					var avatar = ( value.avatar ? '<img src="'+value.avatar+'" width="30" />' : '');
					tpl += '<div class="row-fluid borderBottom" data-id="'+value.id+'" >\
						<div class="span1">'+avatar+'</div>\
						<div class="span3">'+value.nickname+'</div>\
						<div class="span4">'+(services || '&nbsp;')+'</div>\
						<div class="span4"><i class="icon-remove removeProfil keynav_box" data-action="remove(\''+field.id+'\', \''+value.id+'\')"></i></div>\
					</div>';
				break;

				case 'applicationsList':
					var img = ( value.img ? '<img src="'+value.img+'" width="30" />' : '');
					tpl += '<div class="row-fluid borderBottom" data-id="'+value.id+'" title="'+value.infos+'">\
						<div class="span1">'+img+'</div>\
						<div class="span3">'+value.name+'</div>\
						<div class="span4">...'+value.url.substring(value.url.length - 20, value.url.length)+'</div>\
						<div class="span4"><i class="icon-remove removeApp keynav_box" data-action="remove(\''+field.id+'\', \''+value.id+'\')"></i></div>\
					</div>';
				break;

				case 'pdsList':
					var img = ( value.img ? '<img src="'+value.img+'" width="30" />' : '');
					tpl += '<div class="row-fluid borderBottom" data-id="'+value.id+'" >\
						<div class="span1">'+img+'</div>\
						<div class="span3">'+value.name+'</div>\
						<div class="span4">...'+value.url.substring(value.url.length - 20, value.url.length)+'</div>\
						<div class="span4"><i class="icon-remove removePds keynav_box" data-action="remove(\''+field.id+'\', \''+value.id+'\')"></i></div>\
					</div>';
				break;
			}

			return tpl;
		},

		clickNavKey = function(e) {
			var action = $(this).data('action');
			if (action) {
				if (APP.db) console.log('action', action);
				e.preventDefault();
				eval(action);
			}
		},

		updateNavKey = function() { // Initialize jQuery arrows keyboard navigation
			$('.keynav_box')
				.off('click', clickNavKey) // Reset ?
				.on('click', clickNavKey)
				.keynav('keynav_focusbox', function() {
					return window.keynavIsActive;
				});
		};

	// ----------- BUILD FORMS ---------------------------------------------------------------------------------- //

	var buildForm = function(config, where, add) {
		if (APP.db) console.log('buildForm(config, where)', config, where);

		forms = '';

		for (var chapter in config) { // Chapitres de l'administration

			forms += '<div class="formChapter row-fluid" id="'+chapter+'" style="display:none;">\
		<form class="form-horizontal bgRadius" id="form-'+chapter+'" name="form-'+chapter+'" action="'+APP.configApi+'" method="post">\
			<input type="hidden" name="action" value="'+chapter+'"/>\
			<fieldset>\
				<div>\
					<legend>'+(add ? 'Create' : 'Configuration interface')+' : '+chapter+'</legend>\
					<!--// <p class="lead">Interface de configuration des paramètres réseau</p> //-->\
				</div>';

			var totalItems  = 0,
				currentItem = 0,
				half		= 0;

			for (var fields in config[chapter]) {
				if (config[chapter][fields].type == 'l') totalItems = totalItems + 2; // liste
				else if (config[chapter][fields].type != 'h') totalItems++; // hidden
			}

			half = Math.floor(totalItems / 2, 10) + 1;

			if (APP.isTV && totalItems >= 4)
				forms += '<div class="row-fluid"><div class="span6">';

			for (var fields in config[chapter]) {  // Les champs d'un chapitre

				var field	  = config[chapter][fields],
					tpl	      = '',
					extraData = '',
                    ctrClass  = '',
                    keyClass  = '';

				if (field.type == 'l') currentItem = currentItem + 2; // liste
				else if (field.type != 'h') currentItem++; // hidden

				if (APP.isTV && totalItems >= 4 && currentItem == half) // Cols
					forms += '</div><div class="span6">';

				switch (field.format) {
					case 'time': extraData += ' data-rule-time="true"'; break;
					case 'date': extraData += ' data-rule-date="true"'; break;
				}

                if (field.temp) ctrClass = 'notActivated';
                else keyClass = 'keynav_box';

				if (field.required) {
					extraData += ' data-rule-required="true"';
					if (field.required == 'url') extraData += ' data-rule-url="true"';
				}

				switch(field.type) {

					case 'h' : // Hidden
						tpl += '<input type="hidden" id="'+field.id+'" name="'+field.id+'" value="'+getFieldVal(field)+'"/>';
					break;

					case 'i' : // Information
						tpl += '<div class="control-group '+ctrClass+'">\
							<label class="control-label" for="'+field.id+'">'+field.title+'</label>\
							<div class="controls">\
								<input type="text" id="'+field.id+'" name="'+field.id+'" value="'+getFieldVal(field)+'" class="input-block-level" disabled/>\
							</div>\
						</div>';
					break;

					case 'l' : // LISTES
						tpl += '<div class="control-group '+ctrClass+'">\
							<label class="control-label" for="'+field.id+'">'+field.title+'</label>\
							<div class="controls" id="'+field.id+'_list">';

						var values = getFieldVal(field);
						for (var i = 0, len = values.length; i < len; i++) {
							tpl += getList(field, values[i]);
						}

						tpl += '<div class="row-fluid borderBottom add '+keyClass+'" data-action="add(\''+field.id+'\')" id="add_'+field.id+'">\
									<div class="span11">Ajouter</div>\
									<div class="span1"><i class="icon-plus"></i></div>\
								</div>\
							</div>\
						</div>';
					break;

					case 'a' : // Action <label class="control-label" for="'+field.id+'">'+field.title+'</label>\
						tpl += '<div class="control-group '+ctrClass+'">\
							<div class="controls">\
								<button class="btn btn-primary '+keyClass+' doAction" id="'+field.id+'"><i class="icon-ok-sign"></i>'+field.title+'</button>\
							</div>\
						</div>';
					break;

					case 'v' : // Valeur
						tpl += '<div class="control-group '+ctrClass+'">\
							<label class="control-label" for="'+field.id+'">'+field.title+'</label>\
							<div class="controls">\
								<input type="text" id="'+field.id+'" name="'+field.id+'" value="'+getFieldVal(field)+'" placeHolder="'+getFieldVal(field)+'" '+extraData+' class="input-block-level '+keyClass+'"/>\
							</div>\
						</div>';
					break;

					case 's' : // Sélection // {type: 's', title: 'DHCP', id: 'dhcp', values: [{id:1, title: 'Statique'}, {id:2, title: 'Auto'}]},
						var tips = '';
						tpl = '<div class="control-group '+ctrClass+'">\
							<label class="control-label" for="'+field.id+'">'+field.title+'</label>\
							<div class="controls">\
								<select id="'+field.id+'" name="'+field.id+'" data-rule-required="true" class="input-block-level '+keyClass+'">';

						for (var vals in field.values) {

							if (field.values[vals].tip) {
								tips += field.values[vals].title+' : '+field.values[vals].tip+'<br />';
							}

							tpl += '<option value="'+(field.values[vals].id ? field.values[vals].id : vals)+'" '+(getFieldVal(field) == field.values[vals].id ? 'selected="selected"' : '')+'>'+field.values[vals].title+'</option>';
						}
						tpl += '</select>';

						if (tips.length) {
							tpl += '<p class="help-block">'+tips+'</p>';
						}

						tpl += '</div>\
						</div>';
					break;
				}

				forms += tpl;

			} // Fin champs d'un chapitre

			if (APP.isTV && totalItems  >= 4)
				forms += '</div></div>';

			forms += '<div class="control-group">\
				<div class="form-actions">\
					<button type="submit" class="btn btn-primary keynav_box"><i class="icon-ok-sign"></i>Enregistrer</button>\
					'+(add ? '<button type="button" class="btn keynav_box cancel"><i class="icon-reply-all"></i>Cancel</button>' : '<button type="button" class="btn keynav_box reset"><i class="icon-reply-all"></i>Ré-initialise configuration</button>')+'\
				</div>\
			</div>\
		</fieldset>\
		</form>\
	</div>';

		}  // Fin Chapitres de l'administration

		$(forms).prependTo(where);
	};



    var buildFormUpload = function(config, where, add) {
        if (APP.db) console.log('buildFormUpload(config, where)', config, where);

        forms = '';

        for (var chapter in config) { // Chapitres de l'administration

            forms += '<div class="formChapter row-fluid" id="'+chapter+'" style="display:none;">\
        <form class="form-horizontal bgRadius" id="form-'+chapter+'" name="form-'+chapter+'" action="'+APP.admin+'Update" enctype="multipart/form-data" method="post">\
            <input type="hidden" name="action" value="'+chapter+'"/>\
            <fieldset>\
                <div>\
                    <legend>Send file : '+chapter+'</legend>\
                    <!--// <p class="lead">Interface de configuration des paramètres réseau</p> //-->\
                </div>';

            var totalItems  = 0,
                currentItem = 0,
                half        = 0;

            for (var fields in config[chapter]) {
                if (config[chapter][fields].type == 'l') totalItems = totalItems + 2; // liste
                else if (config[chapter][fields].type != 'h') totalItems++; // hidden
            }

            half = Math.floor(totalItems / 2, 10) + 1;

            if (APP.isTV && totalItems >= 4)
                forms += '<div class="row-fluid"><div class="span6">';

            for (var fields in config[chapter]) {  // Les champs d'un chapitre

                var field     = config[chapter][fields],
                    tpl       = '',
                    extraData = '',
                    ctrClass  = '',
                    keyClass  = '';

                if (field.type == 'l') currentItem = currentItem + 2; // liste
                else if (field.type != 'h') currentItem++; // hidden

                if (APP.isTV && totalItems >= 4 && currentItem == half) // Cols
                    forms += '</div><div class="span6">';

                switch (field.format) {
                    case 'time': extraData += ' data-rule-time="true"'; break;
                    case 'date': extraData += ' data-rule-date="true"'; break;
                }

                if (field.temp) ctrClass = 'notActivated';
                else keyClass = 'keynav_box';

                if (field.required) {
                    extraData += ' data-rule-required="true"';
                    if (field.required == 'url') extraData += ' data-rule-url="true"';
                }

                switch(field.type) {

                    case 'f' : // Hidden
                        tpl += '<div class="control-group '+ctrClass+'">\
                            <label class="control-label" for="'+field.id+'">'+field.title+'</label>\
                            <div class="controls">\
                                <input type="file" id="'+field.id+'" name="'+field.id+'" '+extraData+' class="input-block-level '+keyClass+'"/>\
                            </div>\
                        </div>';
                    break;
                }

                forms += tpl;

            } // Fin champs d'un chapitre

            if (APP.isTV && totalItems  >= 4)
                forms += '</div></div>';

            forms += '<div class="control-group">\
                <div class="form-actions">\
                    <button type="submit" class="btn btn-primary keynav_box"><i class="icon-ok-sign"></i>Enregistrer</button>\
                    <button type="button" class="btn keynav_box cancel"><i class="icon-reply-all"></i>Cancel</button>\
                </div>\
            </div>\
        </fieldset>\
        </form>\
    </div>';

        }  // Fin Chapitres de l'administration

        $(forms).prependTo(where);
    };

	// ----------- FORMS SUBMIT ---------------------------------------------------------------------------------- //

	var formBackup	= {},
		newParams   = null,
		backupId    = null,
		backUpInt	= null;

	$.ajax({
		statusCode: {
			404: function() { notif.showNotif('Error while saving : Not a valid URL'); },
			400: function() { notif.showNotif('Error while saving : Check your parameters'); },
			500: function() { notif.showNotif('Error while saving : Unknow problem with API'); }
		}
	});

	var formSuccess = function(data, textStatus, jqXHR) {
			if (APP.db) console.log('Success !', data, textStatus, jqXHR);
			var ok = false;
			switch(jqXHR.status) {
				case 200 : ok = true; break; // OK (with content)
				case 204 : ok = true; break; // OK (no content)
			}
            if (ok) $('button.reset').hide();
			if (ok) notif.showNotif('Data saved with success');
            //if (ok) notif.showNotif('Configuration enregistrée<br />Pendant 30s vous pouvez annuler<br />(&quot;Triple click&quot;)', 2000); // ou 3 fois &quot;entrée&quot;

			// backUpInt = setTimeout(function() {
			// 	backUpInt = null;
			// 	formBackup[backupId] = newParams; // New backup !
			// }, 30000);
		},

		undo = function() {
			// if (APP.db) console.log('tripleclick undo()');
			// if (backUpInt) {
			// 	clearTimeout(backUpInt);
			// 	backUpInt = null;
			// }
			// else { // Nothing to undo // Delay gone
			// 	return;
			// }
			// var formCurrentId = $('form:visible:first').attr('id'); // Current undo ID
			// if (!formCurrentId || !formBackup[formCurrentId]) { // hum... nop !
			// 	notif.showNotif('Rien à annuler ?');
			// 	return;
			// }
			// for (var k in formBackup[formCurrentId]) {
			// 	$('#'+k).val(formBackup[formCurrentId][k]);
			// }
			// notif.showNotif('Dernière sauvegarde annulée');
			// setTimeout(function() { // Re-submit
			// 	$('#'+formCurrentId)
			// 		.find('button[type="submit"]')
			// 		.trigger('click');
			// }, 2000);
		},

		submitCallback = function(form) {
			if (APP.db) console.log('submitCallback()');
			var $cform = $(form),
				id	   = $cform.attr('id'),
				type   = $cform.attr('method'),
				action = $cform.attr('action'),
				params = $cform.serializeObject();
			backupId = id;
			params = $.extend(true, APP.values, params); // Met à jour les valeurs par défaut
			newParams = params;
			if (APP.db) console.log('submitCallback() params', {
				type: type,
				url: action,
				data: params,
				crossDomain: true,
				dataType: 'json',
				success: formSuccess,
				error: APP.apiError
			});
			$.ajax({
				type: type,
				url: action,
				data: params,
				crossDomain: true,
				dataType: 'json',
				success: formSuccess,
				error: APP.apiError
			});
			return false;
		},

		initForm = function() {
			if (APP.db) console.log('initForm()');
			$('form').each(function(index, element) {
				// if (APP.db) console.log('validate()');
				var $form  = $(element);
				formBackup[$form.attr('id')] = $form.serializeObject(); // backup formS
				$form.validate({submitHandler: submitCallback});
			});
		},

		// gestion listes : profils, apps, chanels

		remove = function(fieldId, valuesId) {
			if (APP.db) console.log('remove(fieldId, valuesId)', fieldId, valuesId);
			var k = 0;
			for (var fields in APP.values[fieldId]) {
				var cId = APP.values[fieldId][fields].id;
				if (cId == valuesId) {
					$('#'+fieldId+'_list').find('div[data-id="'+cId+'"]').remove();
					APP.values[fieldId].splice(k, 1);
					submitCallback($('form:visible')); // Send updated list to the API
					updateNavKey();
					return;
				}
				k++;
			}
		},

		add = function(fieldId) {
			if (APP.db) console.log('add(fieldId)', fieldId);
			var conf = null,
				id   = null;
			switch(fieldId) {
				case 'profilsId':        id = 'PROFILS';      conf = {PROFILS: APP.addUser}; break;
				case 'applicationsList': id = 'APPLICATIONS'; conf = {APPLICATIONS: APP.addApp}; break;
				case 'pdsList':          id = 'CHANNELS';     conf = {CHANNELS: APP.addChanel}; break;
                case 'upgrade':          id = 'UPGRADE';      conf = {UPGRADE: APP.upgrade}; break;
			}
			if (!conf) return;


            if (fieldId == 'upgrade') {
                buildFormUpload(conf, (APP.isTV ? '#boxADMINTV' : '#boxADMIN'), true);
                /*
                $('#formid').validate({
                    rules: { inputimage: { required: true, accept: "png|jpe?g|gif", filesize: 1048576  }}, ///////// WORK IN PROGRESS TODO !!!!! :-/
                    messages: { inputimage: "File must be JPG, GIF or PNG, less than 1MB" }
                });
                */
            }
            else {
                buildForm(conf, (APP.isTV ? '#boxADMINTV' : '#boxADMIN'), true);
                $('form#form-'+id).validate({submitHandler: submitAddCallback});
            }
            $('div#'+id).show();
			updateNavKey();
		},

		submitAddCallback = function(form) {
			if (APP.db) console.log('submitAddCallback()');
			var $cform  = $(form),
				id	    = $cform.attr('id'),
				type    = $cform.attr('method'),
				action  = $cform.attr('action'),
				params  = $cform.serializeObject(),
				fieldId = null;

			switch(id) {
				case 'form-PROFILS':        fieldId = 'profilsId'; break;
				case 'form-APPLICATIONS':   fieldId = 'applicationsList'; break;
				case 'form-CHANNELS':       fieldId = 'pdsList'; break;
                case 'form-upgrade':        fieldId = 'upgrade'; break;
			}

			params.id = APP.values[fieldId].length + 1;
			APP.values[fieldId].push(params);

			$cform.remove();
			var newRow = getList({id:fieldId}, params);
			$(newRow).insertBefore($('#add_'+fieldId).last());
			submitCallback($('form:visible')); // Send updated list to the API
			updateNavKey();
			return false;
		};

	//$document.on('tripleclick', undo);

	// ----------- MAIN APP LAYOUT ---------------------------------------------------------------------------------- //

	var buildFullNav = function () {
		if (APP.db) console.log('buildFullNav()');

		//if (winH <= 720) $body.css('zoom', winH / 1080);
		//else $('body').css('zoom', 1);
		/*
		<li><a href="index.html#top" class="keynav_box">Administration</a></li>\
			<li><a href="index.html#REMOTE" class="keynav_box">Remote</a></li>\
			<li><a href="index.html#FAQ" class="keynav_box">FAQ</a></li>\
		*/
		var fullNav = '<li class="visible-phone"><a href="#" id="sidr-close" class="btn keynav_box"><b class="icon-remove"></b> Fermer</a></li>';

		if (APP.isTV) { // ON TV
			$body.addClass('tv'); // CSS TV special layout
			$appMenu.append('<li '+(selectedDefault == 'DOC' ? 'class="active"' : '')+' data-text="DOC"><a href="'+APP.docUrl+'" class="keynav_box" target="_blank">DOC</a></li>');
			$ssMenuUlTv.hide().html($menuUl.html() + fullNav);
			$ssMenuUlTv.find('li.active').removeClass('active');
			$('#simple-menu')
				.sidr({
					name: 'sidr-main',
					source: '#ssMenuTv'
				})
				.on('click', function() {
					setTimeout(function() {
						$ssMenuUlTv.find('li:first a').trigger('focus mouseenter');
						$window.trigger('resize');
					}, 1000);
				});
			$('#sidr-id-sidr-close').on('click', function() {
				$.sidr('close', 'sidr-main');
				return false;
			});
		}
		else { // ON DESKTOP // MOBILE...
			$appMenu.html(/*$menuUl.html() + */fullNav);
			$('#simple-menu')
				.addClass('visible-phone')
				.sidr({
					name: 'sidr-main',
					source: '#menu'
				});
			$('#sidr-id-sidr-close').on('click', function() {
				$.sidr('close', 'sidr-main');
				return false;
			});
		}

		/*setTimeout(function () {
			$menu.affix({offset: {top: function () { return ($window.width() <= 980 ? 290 : 210); }}});
		}, 100);*/

	};

	// ----------- PAGE NAV ---------------------------------------------------------------------------------- //

	var pageAction = function(e) { // Gestion de l'action (ENTER) sur un navItem
			if (APP.db) console.log('pageAction()');

			$currentFocusItem = $('.keynav_focusbox:visible');
			if (!$currentFocusItem.length) return;

			var action = $currentFocusItem.data('action');
			if (action) {
				if (APP.db) console.log('action', action);
				e.preventDefault();
				eval(action);
			}
			else if ($currentFocusItem.is('select,input,textarea')) { // Toggle keynav when user enter on an input or a select
                e.preventDefault();
				if (window.keynavIsActive) {
					window.keynavIsActive = false;
                    if ($currentFocusItem.is('select')) {
                        var event = document.createEvent('MouseEvents');
                        if (event) {
                            event.initMouseEvent('mousedown', true, true, window);
                            $currentFocusItem[0].dispatchEvent(event);
                        }
                        else $currentFocusItem.attr({size:$currentFocusItem.find('option').length, multiple:'multiple'});
                    }
				}
				else {
					window.keynavIsActive = true;
                    if ($currentFocusItem.is('select') && !(document.createEvent('MouseEvents'))) $currentFocusItem.attr({size:1, multiple:'0'});
                    $currentFocusItem.blur();
				}
				return false;
			}
			else {
				$currentFocusItem[0].click();
			}
		},

		// Ecouteurs des touches pour la page // Update "pageItemCurrent"
		pageKey = function(event, c) {
            if (event.isPropagationStopped()) return;
			var k = ((c && c.key) ? c.key : e2key(event));
			//if (APP.db) console.log('pageKey()', event.which, k);
			switch(k) {
				case 'left':
				case 'right':
				case 'up':
				case 'down': break;

				case 'esc': window.keynavIsActive = true; break;
				case 'enter': return pageAction(event); break;
			}
		},

		resetPages = function() { // init all elements & clean listeners
			if (APP.db) console.log('resetPages()');

			//hideAlert();
			horlogeRemove();

			// EVENTS.push([document, 'keyup', pageTvKey]); // STOCK LISTENNER !
			/*$(EVENTS).each(function(i, listenner) { $(listenner[0]).unbind(listenner[1], listenner[2]); });
			EVENTS = [];

			$(ANIMS).each(function(i, fct) { fct(); });
			ANIMS = [];*/

			$('.keynav_focusbox').removeClass('keynav_focusbox');
		},

		// Affichage page est finie on ajoute les écouteurs
		pageInitNav = function() {
			if (APP.db) console.log('pageInitNav()');

			horlogeInit();

			for (var chapter in APP.config) { // Chapitres de l'administration
				if (!selectedDefault) selectedDefault = chapter;
				$appMenu.append('<li '+(selectedDefault == chapter ? 'class="active"' : '')+' data-text="'+chapter+'"><a href="#'+chapter+'" class="keynav_box">'+chapter+'</a></li>');
			}

			buildForm(APP.config, (APP.isTV ? '#ADMINTV' : '#ADMIN'));
			initForm();
			buildFullNav();

            window.keynavIsActive = true;
            $('a[href="#'+selectedDefault+'"]:first').addClass('keynav_focusbox');
            $('button.reset').hide();
            updateNavKey();

			// Buttons form
			$('body')
                .delegate('input, select', 'change', function activateReset() {
                    var $notVisibleReset = $('button.reset:not(:visible)');
                    if ($notVisibleReset.length) {
                        $notVisibleReset.show();
                        $window.trigger('resize'); // Reload keynav2
                    }
                })
				.delegate('.cancel', 'click', function() {
					$(this).closest('form').remove();
				})
				.delegate('.reset', 'click', function() {
					window.location.reload();
				})
				.delegate('#NodeLogView', 'click', function(event) {
					event.preventDefault();
                    event.stopPropagation();
					//window.open(APP.nodeLogUrl, '_logs');
                    window.location.href = APP.nodeLogUrl;
					return false;
				})
                .delegate('#UpgradeNow', 'click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    add('upgrade');
                    return false;
                })
				.delegate('.doAction', 'click', function(event) {
                    if (event.isPropagationStopped()) return;
					event.preventDefault();
                    event.stopPropagation();
					APP.get('Admin/'+$(this).attr('id'));
					return false;
				});

			$document.on('keyup', pageKey); // LISTEN KEY EVENTS
			EVENTS.push([document, 'keyup', pageKey]); // STOCK LISTENNER

            window.keynavIsActive = true;
            $('a[href="#'+selectedDefault+'"]:first').addClass('keynav_focusbox');
            $('button.reset').hide();
            updateNavKey();

			setTimeout(function() {
				if (!hash || hash == '#top') setHash(selectedDefault);
				$window.trigger('hashchange');
				$page.scrollTop(0);
				$document.focus();

				// Clavier virtuel ?
				/*callJs('./js/jquery-ui-1.10.3.custom.min.js', true, function() {
					callJs('./js/jquery.keyboard.js', true, function() {
						$document.keyboard({layout:'TV'});
					});
				});*/

			}, 250);
		};

    // ----------- EVENTS ---------------------------------------------------------------------------------- //

    $body.on('wheel', function(event, delta){
        if( delta > 0 ) $document.trigger('keyup', [{key:'up'}]);
        else $document.trigger('keyup', [{key:'down'}]);
    });

    // Redimensionnement window
    $window
        .on('resize', function() {
            if (APP.db) console.log('window.resize()');
            winH = $window.height();
            winW = $window.width();
        })
        .on('unload', function() {
            return resetPages(); // Stop video, for example...
        })
        .on('hashchange', function(event) {
            var newHash = getHash();
            if (APP.db) console.log('hashchange() newHash', newHash);
            if (newHash == '#top') return;

            $.sidr('close', 'sidr-main');

            switch(newHash) {

                case '#REMOTE': // ----------- REMOTE ---------------------------------------------------------------------------------- //
                    $page.hide();
                    $subPage
                        .show()
                        .load('_remote.html', function() {
                            var $buttons = $('#remote button');
                            $userText = $('#userText');

                            $buttons.on('click', function(event) {
                                if (APP.db) console.log('APP.remote()', $(this).data('cmd'));
                                event.preventDefault();
                                APP.remote('Key', $(this).data('cmd'));
                            });

                            $('#sendText').on('click', function(event) {
                                if (APP.db) console.log('APP.remote()', $userText.val());
                                event.preventDefault();
                                APP.remote('Text', $userText.val());
                                $userText.val('');
                            });
                        })
                    break;

                default: // ----------- ADMIN FORM DISPLAY ---------------------------------------------------------------------------------- //

                    newHash = newHash || hash || '#'+selectedDefault;

                    var $e = $(newHash);
                    if ($e.length) {
                        event.preventDefault();
                        $subPage.hide();
                        $('.formChapter').hide(); // Hide all forms
                        $page.show();
                        $e.show(); //$e.scrollToMe(hash); // Show current form
                        $appMenu.find('.active').removeClass('active'); // Unselect active menu
                        $('.keynav_focusbox').removeClass('keynav_focusbox');
                        $('a[href="'+newHash+'"]') // Select active menu
                            .addClass('keynav_focusbox')
                            .parent('li')
                            .addClass('active');
                        hash = newHash;

                        setTimeout(function() {
                            $window.trigger('resize'); // Reload keynav2
                        }, 500);
                        return false;
                    }
                    break;
            }
            return true;
        });

    // ----------- HORLOGE ---------------------------------------------------------------------------------- //

    var $horloge   = $('#horloge'),
        intHorloge = null;

    var horlogeRemove = function() {
            $horloge.stop(true, false).animate({bottom:'-50px'}, 800);
            if (intHorloge) {
                clearTimeout(intHorloge);
                intHorloge = null;
            }
        },
        horlogeTimer = function() {
            var dt = new Date();
            $horloge.find('p').html(pad(dt.getHours())+':'+pad(dt.getMinutes()));
            intHorloge = setTimeout(horlogeTimer, 1000);
        },
        horlogeInit = function() {
            if (APP.db) console.log('horlogeInit()');
            $horloge.stop(true, false).css({bottom:'0'}, 600);
            horlogeTimer();
        };

	// ----------- init ---------------------------------------------------------------------------------- //

	if (APP.db) console.log('Init : Fetching...', APP.configApi);

	$.ajax({
		type: 'get',
		timeout: 2000,
		url: APP.configApi, // './js/app-values.json'
		crossDomain: true,
		success: function(data) { // Fetch user defined values
			if (APP.db) console.log('Init with user values', data);
			APP.values = data;
			pageInitNav();
		},
		error: function() { // Fetch user defined values // Fail if STB not connected
			console.log('Network error while fetching user values');

			pageInitNav();

			//$('.keynav_focusbox').removeClass('keynav_focusbox');
			/*$page.hide();
			$('.keynav_box').hide();

			var $erreur = $($('noscript').text());
			$erreur.find('.modal-body').html('Attention il semble que vous ne soyez pas connecté avec la STB');
			$erreur
				.appendTo('body')
				.find('.btn-primary')
				.addClass('keynav_focusbox');

			$('.keynav_box').keynav('keynav_focusbox');*/
		}
	});

});