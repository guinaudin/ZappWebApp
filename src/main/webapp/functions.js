

if (!('jQuery' in window)) {
	console.log('Fichier jquery.js absent');
}

// ------------------------------------ DEBUGGING ------------------------------------ //

// db(a, b, c);	  // Any variables you want in the console : string | array | obj | fct ...
// idb(pooledValue); // Print a field with a (fast) changing value (string | number)
// dump(obj);		// var_export() hash OBJ in a textearea...

var db   = function() { 'console' in window && 'warn' in console && console.warn.call(console, arguments); return false; },
	$idb = null,
	idb  = function(m) { if (!$idb) $idb = $('<input type="text" style="width:300px;position:absolute;z-index:9999;top:0;left:0;"/>').appendTo('body'); $idb.val(m); },
	dump = function(data) { if (!JSON) return; $('#dumpOptions').remove(); $('<textarea id="dumpOptions" spellcheck="false" style="width:333px;height:500px;position:absolute;z-index:9999;top:0;left:0;opacity:.8;font:11px courier;color:black;">'+JSON.stringify(data, null, 4)+'</textarea>').appendTo('body'); };

// ------------------------------------ FORM ------------------------------------ //

// http://bassistance.de/jquery-plugins/jquery-plugin-validation/
// http://docs.jquery.com/Plugins/Validation/
// http://docs.jquery.com/Plugins/Validation/validate#options

if ('validator' in $) {

	$.validator.setDefaults({
		//debug: true,
		ignore: [], //":hidden", // DECLARE BEFORE DOC READY !!!
		errorPlacement: function(error, element) {
			if ($(element).attr('type') == 'checkbox' || $(element).attr('type') == 'radio') { // Cas particulier pour les inputs radio
				error.insertAfter($(element).closest('.controls')); // L'erreur ce place à la suite du groupe...
			}
			else error.insertAfter($(element));
		},
		highlight: function(label) {
			$(label)
				.closest('.control-group')
				.addClass('error');
		},
		invalidHandler: function(event, validator) {
			$(this).scrollToMe(); // validator.numberOfInvalids();
		},
		success: function(label) {
			$(label)
				.closest('.control-group')
				.removeClass('error')
				//.addClass('success')
				.end()
				.remove();
		}
	});

	$.validator.addMethod(
		"date",
		function ( value, element ) {
			//var bits = value.match(/([0-9]+)/gi), str;
			//if (!bits) return this.optional(element) || false;
			//str = bits[ 1 ] + '/' + bits[ 0 ] + '/' + bits[ 2 ];
			return this.optional(element) || !/Invalid|NaN/.test(new Date( value )); // str
		},
		"Merci de saisir une date au format aaaa-mm-jj"
	);

}

// ------------------------------------ Some GLOBAL functions ------------------------------------ //

var $window        = $(window), // Set in cache, intensive use !
	$document      = $(document),
	$body          = $('body'),
	scrollElement  = 'html, body',
	$scrollElement = null,
	newAnchror     = null;

// Find scrollElement // inspired by http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
$(scrollElement).each(function (i) { // 'html, body' for setter... window for getter... // window.scrollBy(0,0) is native also
	var initScrollTop = parseInt($(this).scrollTop(), 10);
	$window.scrollTop(initScrollTop + 1);
	if ($(this).scrollTop() == initScrollTop + 1) {
		scrollElement = this.nodeName.toLowerCase(); // html OR body
		return false; // Break
	}
});
$scrollElement = $(scrollElement);

// ----------- FUNCTIONS ---------------------------------------------------------------------------------- //

var
	isLocal         = (/localhost\//.test(document.location.host) || /127.0.0.1\//.test(document.location.host)),
	isFirefox       = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
	html2input      = function(str) { return unescape(str+'').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
	inArray         = function(a, b) { return !!~a.indexOf(b); },
	pad             = function(n) { return (n < 10 ? '0'+n : n); },
	escapeURIparam  = function(url) { // http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent/17235463#17235463
		if (encodeURIComponent) url = encodeURIComponent(url);
		else if (encodeURI) url = encodeURI(url);
		else url = escape(url);
		url = url.replace(/\+/g, '%2B'); // Force the replacement of "+"
		return url;
	},
	removeKey       = function (arr) { // removeKey(['three','seven'], 'seven');
		var what, a = arguments, L = a.length, ax;
		while (L > 1 && arr.length){
			what = a[--L];
			while ((ax = arr.indexOf(what)) != -1){
				arr.splice(ax, 1);
			}
		}
		return arr;
	},
	input2html      = function(str) { return (str+'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'); },
	getCss			= function(stylePath) { $('head').append('<'+'link rel="stylesheet" type="text/css" href="'+stylePath+'"/>'); },
	getJs			= function(jsPath) { // getJs('http://other.com/other.js'); // Native external link
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('src', jsPath);
		document.getElementsByTagName('head')[0].appendChild(s);
	},
	callJs			= function(src, async, callback) { // callJs('./other.js', 1, function() { ok(); }); // On-demand same domain JS
		//if (_db_) console.log('callJs(src)', src);
		$.ajax({
			   url:src, async:async || 0, dataType:'script', cache:1,
			   error: function(){ alert('Sorry, some JS file not found : '+src); },
			   success: function(response) { if (callback && typeof callback == 'function') callback(); }
		});
	},
	objSortByTitle	= function (a, b) { var x = a.title.toLowerCase(); var y = b.title.toLowerCase(); return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }, // sites['link'].sort($.objSortByTitle);
	getHash			= function() { return window.location.hash || ''; },
	setHash			= function(hash) { if (hash && getHash() != hash) window.location.hash = hash; },
	getUrlVars 		= (function() {
		var urlVars = null;
		return function() { // index.html?var=foo -> myVal = getUrlVars()['var'];
			if (!urlVars) {
				urlVars = {};
				window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { urlVars[key] = value.split('#')[0]; });
			}
			return urlVars;
		};
	})(),
	getWinWidth		= function() { return $window.width(); }, // iphone ? ((window.innerWidth && window.innerWidth > 0) ? window.innerWidth : $window.width());
	getWinHeight	= function() { return $window.height(); }, // iphone ? ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $window.height());
	getPageWidth	= function() { return $document.width(); },
	getPageHeight	= function() { return $document.height(); },
	getScrollTop	= function() { return parseInt($scrollElement.scrollTop() || $window.scrollTop(), 10); },
	setScrollTop	= function(y) { $scrollElement.stop(true, false).scrollTop(y); },
	myScrollTo = function(y) { // Call page scrolling to a value (like native window.scrollBy(x, y)) // Can be flooded
		console.log('myScrollTo(scrollTop)', y);
		isAnimated = true; // kill waypoint AUTO hash
		y = ( y < 0 ? 0 : y);
		var duration = 500 + (Math.abs(y -  getScrollTop()) * 0.42); // Duration depend on distance...
		if (duration > 2222) duration = 0; // Instant go !! ^^
		$scrollElement
			.stop()
			.animate({scrollTop: y}, {
				duration: duration,
				complete: function() { // Listenner of scroll finish...
					//if (_db_) console.log('myScrollTo.complete');
					setHash(newAnchror); // If new anchor
					newAnchror = '';
					isAnimated = false;
				}
			});
	},
	goToScreen = function(dir) { // fatal error Scroll viewport page by paginette // 1, -1 or factor
		//if (_db_) console.log('goToScreen(dir)', dir);
		var winH = parseInt((getWinHeight() * 0.75) * dir); // 75% de la hauteur visible comme unite
		myScrollTo(getScrollTop() + winH);
	},
	e2key = (function() {
		var event2key = {
			'97':'a', '98':'b', '99':'c', '100':'d', '101':'e', '102':'f', '103':'g', '104':'h', '105':'i', '106':'j', '107':'k', '108':'l', '109':'m',
			'110':'n', '111':'o', '112':'p', '113':'q', '114':'r', '115':'s', '116':'t', '117':'u', '118':'v', '119':'w', '120':'x', '121':'y', '122':'z',
			'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc'
		};
		return function(e) {
			if (!e) return '';
			return event2key[(e.which || e.keyCode)];
		};
	})(),
	rotateArray = function(a, inc){ // var b = rotateArray([1,2,3], -1) // Faster than // "array.unshift(array.pop())" or "array.push(array.shift())".
		for(var l = a.length, inc = (Math.abs(inc) >= l && (inc %= l), inc < 0 && (inc += l), inc), i, x; inc; inc = (Math.ceil(l / inc) - 1) * inc - l + (l = inc))
			for(i = l; i > inc; x = a[--i], a[i] = a[i - inc], a[i - inc] = x);
		return a;
	},
	noEvent = function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	},
	showImg = function() {
		$(this).animate({opacity:1}, 2000);
	},
	getInternetExplorerVersion = function() {
		// Returns the version of Internet Explorer or a -1
		// (indicating the use of another browser).
		var rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
		}
		return rv;
	},
	doBoostrapAlert = function(message) { // var $mod = $.fn.doBoostrapAlert();
		var tpl = '<div class="modal" tabindex="-1" role="dialog" aria-labelledby="Infos" aria-hidden="true">\
			<div class="modal-header">\
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
				<h3 id="myModalLabel">Message d\'information...</h3>\
			</div>\
			<div class="modal-body">\
				<p>'+message+'</p>\
			</div>\
			<div class="modal-footer">\
				<button class="btn" data-dismiss="modal" aria-hidden="true">Fermer</button>\
			</div>\
		</div>';
		return $(tpl).appendTo('body').modal();
	};


var notif = {
	intNotif: null,
	$popUp: null,
	hideNotif: function() {
		if (notif.intNotif) clearTimeout(notif.intNotif);
		$(document).off('click focus', notif.hideNotif);
		notif.intNotif = null;
		notif.$popUp.stop(true, false).animate(
			{top: -(notif.$popUp.height() + 80)+'px'},
			{duration: 900, complete: function() { notif.$popUp.find('.message').html(''); }}
		);
	},
	showNotif: function(message, delay) {
		if (notif.intNotif) clearTimeout(notif.intNotif);
		if (!message) return;
		if (!notif.$popUp) notif.$popUp = $('<div id="notif" style="display:none;"><p class="message">&nbsp;</p></div>').appendTo('body');
		delay = delay || message.length * 82;
		if (delay < 1200) delay = 1200; // min display time
		delay += 900; // anim appear
		notif.$popUp.stop(true, false).find('.message').html(message);
		//$popUp.stop().css('top', -($popUp.outerHeight() + 20)+'px').show();
		notif.$popUp.show().animate({top: '30px'}, 900);
		$(document).on('click focus', notif.hideNotif);
		notif.intNotif = setTimeout(notif.hideNotif, delay);
	}
};

// ------------------------------------ jQuery Extend by molokoloco ------------------------------------ //

(function($){

    $.extend(jQuery.easing, {
		easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; }
	});

	$.easing.jswing = $.easing.swing;
	$.extend($.easing, { // Extract from jQuery UI
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) { return $.easing[$.easing.def](x, t, b, c, d); },
		easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
		easeOutQuad: function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; },
		easeInOutQuad: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; },
		easeInOutCirc: function (x, t, b, c, d) { if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b; return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b; }
	});

	var resizeTimeout;

	$.event.special.smartresize = { // jQuery 1.8 !
		setup: function() {
			$(this).on( "resize", $.event.special.smartresize.handler );
		},
		teardown: function() {
			$(this).off( "resize", $.event.special.smartresize.handler );
		},
		handler: function( event, execAsap ) {
			var context = this,
				args = arguments;
			event.type = 'smartresize'; // set correct event type
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				$.event.handle.apply( context, args );
			}, execAsap === 'execAsap' ? 0 : 100);
		}
	};

	$.tripleclickThreshold = 300;

	$.event.special.tripleclick = {
		setup: function( data ) {
			$(this)
				.data( 'tripleclick', { clicks: 0, last: 0, threshold: data })
				.on( 'click', jQuery.event.special.tripleclick.handler );
		},
		teardown: function() {
			$(this)
				.removeData( 'tripleclick' )
				.off( 'click', jQuery.event.special.tripleclick.handler );
		},
		handler: function(event) {
			var elem = $(this),
				data = elem.data( 'tripleclick' ),
				threshold = data.threshold || $.tripleclickThreshold;
			if ( event.timeStamp - data.last > threshold ) {
				data.clicks = 0;
			}
			data.last = event.timeStamp;
			if ( ++data.clicks === 3 ) {
				elem.triggerHandler( 'tripleclick' );
				data.clicks = 0;
			}
		}
	};

	$.fn.extend({
		center: function (parent) { // I have added the (expanded) source here : http://plugins.jquery.com/project/autocenter
			return this.each(function() {
				var top = ( (parent ? $(this).closest(parent).height() : $(window).height()) - $(this).outerHeight()) / 2;
				var left = ( (parent ? $(this).closest(parent).width() : $(window).width()) - $(this).outerWidth()) / 2;
				$(this).css({position:'absolute', margin:0, top: (top > 0 ? top : 0)+'px', left: (left > 0 ? left : 0)+'px'});
			 });
		},
		styleSwitch: function (stylePath) { // I have added the (expanded) source here : http://plugins.jquery.com/project/AddOrSwitchStylesheet
			var exist = false, disabled = [];
			$('link[@rel*=style][id]').each(function () {
				if (stylePath == $(this).attr('href')) { $(this).removeAttr('disabled'); exist = true; }
				else disabled.push(this);
			});
			if (exist === false) $('head').append('<link rel="stylesheet" type="text/css" href="'+stylePath+'" id="theme'+Math.random()+'"/>');
			setTimeout(function () { $(disabled).each(function () { $(this).attr('disabled', 'disabled'); }); }, 900);
			if ($.cookie) $.cookie('css', stylePath, {expires: 365, path: '/'});
		},
		styleInit: function () {
			if ($.cookie && $.cookie('css')) {
				var isSet = false;
				$('link[rel*=style][id]').each(function () { if ($.cookie('css') == $(this).attr('href')) isSet = true; });
				if (isSet === false) $.fn.styleSwitch($.cookie('css'));
			}
			return $(this).click(function (event) {
				event.preventDefault();
				$.fn.styleSwitch($(this).attr('rel'));
				$(this).blur();
			});
		},
		scrollToMe: function(target) { // Extend jQuery, call page scrolling to a element himself
			return this.each(function() {
				if (target) newAnchror = target; // Update hash, but after scroll anim
				myScrollTo(parseInt($(this).offset().top, 10));
			});
		},
		serializeObject: function() { // Form serialize for POST
			var o = {},
				a = this.serializeArray();
			$.each(a, function() {
				if (o[this.name] !== undefined) {
					if (!o[this.name].push) o[this.name] = [o[this.name]];
					o[this.name].push(this.value || '');
				}
				else o[this.name] = this.value || '';
			});
			return o;
		},
		shuffle: function() {
			var allElems = this.get(),
				getRandom = function(max) {
					return Math.floor(Math.random() * max);
				},
				shuffled = $.map(allElems, function(){
					var random = getRandom(allElems.length),
						randEl = $(allElems[random]).clone(true)[0];
					allElems.splice(random, 1);
					return randEl;
				});
			this.each(function(i){
				$(this).replaceWith($(shuffled[i]));
			});
			return $(shuffled);
		}
	});

})(jQuery);

// Smooth Scrolling ?
/*$('a[href^="#"]').on('click', function(event) {
	if (event.isDefaultPrevented()) return; // Link #top want special event...
	var target  = this.hash, // #anchor
		$target = $(target);
	if (!target || !$target || !$target.is(':visible')) return;
	event.preventDefault();
	$target.scrollToMe(target);
	return false; // don't open a#hash
});*/