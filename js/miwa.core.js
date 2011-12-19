/*
* "init" - Initialize the framework
*/
(function(){

	// Initial Setup
	// -------------
	var root = this;

	var previousMiwa = root.Miwa;

	var $ma = Miwa = {};

	// Current version of the library. Keep in sync with `package.json`.
	Miwa.VERSION = '0.0.1';

	if (typeof exports !== 'undefined') {
		$ma = exports;
	} else {
		$ma = root.$ma = {};
	}
	$app = root.$app = {};

	// Require Underscore, if we're on the server, and it's not already present.
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;
	var $ = root.Zepto || root.jQuery;
	var $bb = root.$bb = root.Backbone;
	if (!$bb && (typeof require !== 'undefined')) $bb = require('backbone').Backbone;

	// initialize underscore
	_.templateSettings = {
        evaluate: /\{%([\s\S]+?)%\}/g,
        interpolate: /\{\{([\s\S]+?)\}\}/g,
	    escape      : /\{-([\s\S]+?)\}\}>/g
	};

	var	$html = $( "html" ),
		$head = $( "head" ),
		$window = $( root );

	$( window.document ).trigger( "miwainit" );

	$html.addClass( "ui-mobile ui-mobile-rendering" );

	_.extend($ma, $bb.Events, {

		tmpls: {}, views: {}, models: {}, colls: {},
		controllers: [],

		// turn on/off page loading message.
		showPageLoadingMsg: function() {
			if ( $.mobile.loadingMessage ) {
				var activeBtn = $( "." + $.mobile.activeBtnClass ).first();

				$loader
					.find( "h1" )
						.text( $.mobile.loadingMessage )
						.end()
					.appendTo( $.mobile.pageContainer )
					// position at y center (if scrollTop supported), above the activeBtn (if defined), or just 100px from top
					.css({
						top: $.support.scrollTop && $window.scrollTop() + $window.height() / 2 ||
						activeBtn.length && activeBtn.offset().top || 100
					});
			}

			$html.addClass( "ui-loading" );
		},

		hidePageLoadingMsg: function() {
			$html.removeClass( "ui-loading" );
		},

		log: function(o){ console.log(o); },

		controller: function(properties, classProperties){
			this.controllers.push($bb.Router.extend(properties, classProperties));
		},

		initializeApp: function() {
			//create classes
			var ma = this;
			_.each(['model', 'view', 'coll'], function(m){
				ma.trigger('new:'+m+'.Base', ma[m+'s'].Base);
			});
			$('#app-init').remove();
			_.each(this.controllers, function(ccls){ new ccls();});
			if($bb.history != undefined){$bb.history.start();}
			else{this.log('no route defined!!')}
		}
	});
	_.each(['model', 'view', 'coll'], function(m){
		$ma[m] = function(name, base, ps, cps){
			this.bind('new:'+m+'.'+base, function(cls){
				if(typeof(ps) == 'function'){ var newCls = ps(cls); }
				else{ var newCls = cls.extend(ps, cps);}
				
				this[m+'s'][name] = newCls;
				this.trigger('new:'+m+'.'+name, newCls);
			}, this);
		}
	});

	$ma.models.Base = $bb.Model.extend({});
	$ma.colls.Base = $bb.Collection.extend({});
	$ma.views.Base = $bb.View.extend({});

	// check which scrollTop value should be used by scrolling to 1 immediately at domready
	// then check what the scroll top is. Android will report 0... others 1
	// note that this initial scroll won't hide the address bar. It's just for the check.
	$(function() {

		var cont = "user-scalable=no",
			meta = $( "meta[name='viewport']" );
		if( meta.length ){meta.attr( "content", meta.attr( "content" ) + ", " + cont );}
		else{$( "head" ).prepend( "<meta>", { "name": "viewport", "content": cont } );}

		window.scrollTo( 0, 1 );
		
		$ma.initializeApp();
	});

}).call(this);
