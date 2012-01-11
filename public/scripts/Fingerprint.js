/**
 * Description: 
 * 
 *   Fingerprint is a singleton object designed to produce a browser fingerprint
 *   by exctracting attributes from the DOM and other client information. 
 * 
 * Dependencies:
 * 
 *   - JQuery (>= 1.6.4)
 *   - JQuery.JSON (>= 2.3)
 *   - (swfobject.js  - used by Fingerprint.initFlash())
 *   - (Fonts.sfw - used by Fingerprint.initFlash())
 *
 * Usage:
 * 
 *   1. The object is initialized by calling Fingerprint.init().  
 *
 *   2. Optionally add onFinish event handler by calling Fingerprint.onFinish(handler).
 *
 *   3. Optionally more information can be gathered by either calling the
 *   auxiliary functions directly or by adding them to the event queue by
 *   calling Fingerprint.events.add(Fingerprint.updateRTT,[k,url]), followed by
 *   Fingerprint.events.run().
 *
 *  4. Generate a DOM representation of the Fingerprint by calling
 *  Fingerprint.generateDOM().
 *
 *  5. Submit the Fingerprint (via AJAX) by calling
 *  Fingerprint.submit(url,error,success).
 * 
 * Example:
 *
 * Fingerprint.init();
 * Fingerprint.onFinish(Fingerprint.submit('/url',error,success));
 * Fingerprint.events.add(Fingerprint.updateRTT,[10,'/url'])
 *                   .add(Fingerprint.initFlash,['/Fonts.swf'])
 *                   .run();
 *
 * // The above example collects info from the DOM, RTT and Flash. When all
 * // scripts are complete, the Fingerprint is submitted to '/url' by the
 * // onFinish event handler.
 *
**/
var Fingerprint = (function()
{

    /**
     * The actual fingerprint object, private object that is only accessible
     * through the API.
     **/

    var fingerprint =
    {
	ip               : undefined,
	uid              : undefined,
	useragent        : undefined,
	navigator        : undefined,
	screen           : undefined,
	window           : undefined,
	timezone         : undefined,
	clock_diff       : undefined,
	fonts            : { flash : [] , css : [] },
	rtts             : [],
	accept           : undefined,
	timestamp        : new Date().getTime()
    };

    return {
	
	/**
	 * Initializes the Fingerprint and collects basic info from DOM. Also
	 * adds the fields from data (optional) to the fingerprint.
	 **/
	init : function(data)
	{
	    if ( data )
		for ( var i in data ) fingerprint[i] = data[i];

	    if ( window.navigator )
	    {
		fingerprint.navigator = 
		    { 
			appCodeName   : window.navigator.appCodeName,
			appName       : window.navigator.appName,
			appVersion    : window.navigator.appVersion,
			cookieEnabled : window.navigator.cookieEnabled,
			language      : window.navigator.language,
			plugins       : [],
			platform      : window.navigator.platform,
			product       : window.navigator.product,
			productSub    : window.navigator.productSub,
			userAgent     : window.navigator.userAgent,
			vendor        : window.navigator.vendor,
			vendorSub     : window.navigator.vendorSub
		    };
	    }

	    if ( window === 'object' )
	    {
		fingerprint.window =
		    {
			innerWidth  : window.innerWidth,
			innerHeight : window.innerHeight,
			outerWidth  : window.outerWidth,
			outerHeight : window.outerHeight
		    };
	    }


	    if ( window.screen )
	    {
		fingerprint.screen = 
		    {
			width          : window.screen.width,
			height         : window.screen.height,
			availWidth     : window.screen.availWidth,
			availHeight    : window.screen.availHeight,
			availLeft      : window.screen.availLeft,
			availTop       : window.screen.availTop,
			colorDepth     : window.screen.colorDepth,
			pixelDepth     : window.screen.pixelDepth,
			updateInterval : window.screen.updateInterval // ie-specific

		    };
	    }

	    fingerprint.timezone = (new Date).getTimezoneOffset();

	    if ( window.localStorage )
	    {
		try
		{
		    var uid = localStorage.getItem('fingerprint');
		    if ( !uid )
			localStorage.setItem('fingerprint',fingerprint.uid);
		    else if ( uid != fingerprint.uid )
			fingerprint.uid = uid;
		}
		catch(e) { }
	    }
	},

	/**
	 * Initalize flash to set LSO and retrieve system fonts.
	 **/
	initFlash : function(url)
	{
	    var callback = function(data)
	    {
		if ( !data.success )
		{
		    Fingerprint.status.done();
		}
	    }
	    if ( $('#FingerprintFlash').length === 0 )
		$('body').prepend( $('<div>').attr('id','FingerprintFlash') );
	    this.status.add('Searching for installed fonts');
	    swfobject.embedSWF(url, 'FingerprintFlash', '0', '0', '9.0.0',
			       undefined,undefined,undefined,undefined,callback);
	 
	},
	
	/**
	 * Updates the list of installed plugins; from the DOM if not IE and by
	 * ActiveX if IE.
	 **/
	updatePlugins : function()
	{
	    function getPlugins()
	    {
		var plugins = [];
		for ( var i = 0 ; i < navigator.plugins.length ; i++ ) 
		{
		    var plugin = navigator.plugins[i];
		    if ( plugin )
		    {
			var mime_types = [];
			for ( var j=0; j < plugin.length; j++) {
			    if ( plugin.item(j) )
				mime_types.push(plugin.item(j).type);
			}
			plugins.push({'name'        : plugin.name,
				      'version'     : plugin.version,
				      'description' : plugin.description,
				      'mime_types'  : mime_types});
		    }
		}

		return plugins;
	    }

	    function getPluginsIE()
	    {
		var plugins = [];
		
		var addIEPlugin = function(plugObj) 
		{
		    if ( window && plugObj && window.ActiveXObject ) 
		    {
			var i = 0;
			var control = null;
			while ( control === null && i < plugObj.ids.length ) 
			{
			    try 
			    {
				control = new ActiveXObject(plugObj.ids[i]);
			    } 
			    catch (e) {}
			    i++;
			}
			if ( control ) 
			{
			    plugins.push({ 'name'    : plugObj.name,
					   'version' : plugObj.getVersion(control,plugObj.ids[i])});
			}
		    } 
		}

		var ieplugins = [
		    {
			name: 'Quicktime',
			ids: ["QuickTimeCheckObject.QuickTimeCheck.1", "QuickTime.QuickTime"],
			getVersion: function(obj, progid) 
			{
			    return obj.QuickTimeVersion.toString(16).replace(/^(.)(.)(.).*/, "$1.$2.$3")
			}
		    },
		    {
			name: 'Acrobat',
			ids: ["PDF.PdfCtrl.7", "PDF.PdfCtrl.6", "PDF.PdfCtrl.5", "PDF.PdfCtrl.4", "PDF.PdfCtrl.3", "AcroPDF.PDF.1"],
			getVersion: function(obj, progid)
			{
			    return progid.replace(/^[a-zA-Z.]+\.([0-9][0-9.]*)/, "$1");
			}
		    },
		    {
			name: 'RealPlayer',
			ids: ["RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "rmocx.RealPlayer G2 Control"],
			getVersion: function(obj, progid) 
			{
			    return obj.GetVersionInfo();
			}
		    },
		    {
			name: 'Flash',
			ids: ["ShockwaveFlash.ShockwaveFlash.9", "ShockwaveFlash.ShockwaveFlash.8.5", "ShockwaveFlash.ShockwaveFlash.8", "ShockwaveFlash.ShockwaveFlash.7", "ShockwaveFlash.ShockwaveFlash.6", "ShockwaveFlash.ShockwaveFlash.5", "ShockwaveFlash.ShockwaveFlash.4"],
			getVersion: function(obj, progid) 
			{
			    return obj.GetVariable("$version").replace(/[a-zA-Z ]*([0-9,]+)/, "$1").replace(/,/g, '.');
			}
		    },
		    {
			name: 'Adobe SVG',
			ids: ["Adobe.SVGCtl"],
			getVersion: function(obj, progid) 
			{
			    return obj.getSVGViewerVersion().replace(/[a-zA-Z; ]*([0-9.]+)/, "$1")
			}
		    },
		    {
			name: 'Windows Media Player',
			ids: ["WMPlayer.OCX", "MediaPlayer.MediaPlayer.1"],
			getVersion: function(obj, progid) { return obj.versionInfo; }
		    },
		    {
			name: 'DivX',
			ids: ["npdivx.DivXBrowserPlugin.1", "npdivx.DivXBrowserPlugin"],
			getVersion: function(obj, progid) {return obj.GetVersion()}
		    },
		    {
			name: 'WPFe (Silverlight)',
			ids: ["AgControl.AgControl"],
			getVersion: function(obj, progid) 
			{
			    var majorVersion = '1';
			    var minorVersion = '0';
			    var minorMinorVersion = '0';
			    while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) 
			    {
				majorVersion++;
			    }
			    majorVersion--;
			    while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) 
			    {
				minorVersion++;
			    }
			    minorVersion--;
			    while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) {
				minorMinorVersion++;
			    }
			    minorMinorVersion--;
			    return majorVersion + '.' + minorVersion + '.' +minorMinorVersion;
			}
		    },
		    {
			name: 'MSXML',
			ids: ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0"],
			getVersion: function(obj, progid) 
			{
			    return progid.replace(/^[a-zA-Z.2]+\.([0-9]+\.[0-9.]+)/, "$1");
			}
		    }
		];
		
		for (var i = 0; i < ieplugins.length; i++) 
		{
		    addIEPlugin(ieplugins[i]);
		}

		return plugins;
	    }
	    
	    if ( fingerprint.navigator && window.navigator )
	    {
		this.status.add('Searching for plugins');
		fingerprint.navigator.plugins = ( window.navigator.userAgent.indexOf('MSIE') == -1 ) 
	            ? getPlugins() 
	            : getPluginsIE();
		this.status.done();
	    }
	},

	/**
	 * Performs k sequential AJAX requests to url, which should return a UNIX timestamp.
	 **/
	updateRTT : function getRTT(k,url)
	{
	    var K = k;
	    
	    var testRTT = function(ct,k,obj)
	    {
		return function(data)
		{
		    var rtt = new Date().getTime() - ct;
		    fingerprint.rtts.push(rtt);
		    var st = parseInt(data,10);
		    var clock_diff = 
			{ 
			    min : Math.min(st - ct - rtt, st - ct),
			    max : Math.max(st - ct - rtt, st - ct)
			};
		    if ( fingerprint.clock_diff === undefined ) fingerprint.clock_diff = clock_diff;
		    else fingerprint.clock_diff = 
			{
			    min : Math.max(clock_diff.min,fingerprint.clock_diff.min),
			    max : Math.min(clock_diff.max,fingerprint.clock_diff.max)
			}

		    if ( k > 0 )
		    {
			$.get(url,testRTT(new Date().getTime(),k-1, obj));
			obj.status.add('Sending RTT request no. ' + (K-k+1));
		    }

		    obj.status.done();

		};
	    }

	    $.get(url,testRTT(new Date().getTime(),k-1,this));
	    this.status.add('Sending RTT request no. ' + (K-k+1));
	},

	/**
	 * Checks for the existance of all the fonts in fontList. Not 100% accurate.
	 **/
	updateCSSFonts : function(fontList)
	{
	    this.status.add('Checking for installed fonts via CSS');
	    var div = $('<div>').attr('id','FingerprintCSSFonts').css( 
		    { 
			'visibility' : 'hidden',
			'position'   : 'absolute',
			'top'        : '0',
			'left'       : '0',
			'zIndex'     : '-1'
		    });
	    
	    $('body').prepend( div );
	    var span = $('<span>').text('abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz')
		.css('fontFamily','non-existing-font').get(0);
	    $(div).append(span);
	    var width = span.offsetWidth; 
	    var height = span.offsetHeight;


	    var checkFont = function(font)
	    {
		span.style.fontFamily = font;
		if ( span.offsetWidth !== width || span.offsetHeight !== height )
		    fingerprint.fonts.css.push(font);
	    };

	    for( var i in fontList )
	    {
		checkFont(fontList[i]);
	    }
	    
	    $(div).remove();
	    this.status.done();	    
	},

	/**
	 * Submit the Fingerprint as JSON by an AJAX request to url. error and
	 * success are callback functions.
	 **/
	submit : function(url,error,success)
	{
	    this.updateTimestamp();
	    $.ajax({
		type: 'POST',
		url: url, 
		data: $.toJSON(fingerprint),
		contentType: 'text/json',
		error: error,
		success: success
	    });
	},

	/**
	 * onFinish(callback) executes callback upon script completion or
	 * immediatly if already finished.
	 **/
	onFinish : function(callback)
	{
	    if ( typeof callback === 'function' )
	    {
		if ( this.status.isDone() ) callback();
		else this.onFinish = callback;
	    }
	},

	/**
	 * Return the UID (from cookie, local storage or LSO).
	 **/
	getUID : function()
	{
	    return fingerprint.uid;
	},

	/**
	 * Returns a DOM representation of the Fingerprint.
	 **/
	generateDOM : function()
	{
	    function display_obj(obj)
	    {
		var elem;
		if ( obj !== undefined )
		{
		    if( typeof obj !== 'object' || obj instanceof Date ) 
			// Object has 'primitive' type, return string representation
		    {
			elem = $('<div>').addClass('value').html(obj.toString());
		    }
		    else if ( obj instanceof Array )
			// Object is array, displayed as <ul>
		    {
			var elem = $('<ul>');
			for( var i in obj )
			    elem.append( $('<li>').addClass('value').html( display_obj(obj[i]) ) );
		    }
		    else
			// Object is hash, displayed as <table>
		    {
			elem = $('<table>').addClass('obj');
			for( var i in obj )
			{
			    if(obj[i] !== null && obj[i] !== '' && obj[i] !== undefined)
			    {
				var name = i.replace(/(^\w|_\w)/g, 
						     function(c) { return c.toUpperCase(); })
				    .replace('_','&nbsp;')+':';
				elem.append($('<tr>')
					    .append($('<th>').html(name))
					    .append($('<td>').html(display_obj(obj[i]))));
			    }
			}
		    }
		}

		return elem;
	    }

	    return  display_obj(fingerprint);
	},

	/**
	 * Provides functions for getting and setting textual status, as well as
	 * determining whether the scripts have completed.
	 **/
	status : (function()
		  { 
		      var pending = -1,
		          status  = [];
		      return {
			  add      : function(msg) 
			  { 
			      status.push(msg); 
			      pending = Math.max(pending+1,1);
			      this.onChange();
			  },
			  done     : function() 
			  { 
			      status.shift(); 
			      pending--;
			      this.onChange();
			      if ( this.isDone() ) Fingerprint.onFinish();
			  },
			  isDone   : function() 
			  { 
			      return pending === 0 && Fingerprint.events.isEmpty(); 
			  },
			  onChange : function() {},
			  get      : function() 
			  {
			      if ( pending > 0 ) 
				  return status[status.length-1];
			      else if ( Fingerprint.events.isEmpty() )
				  return 'Done';
			      else
				  return 'Waiting';
			  }
		      };
		  })(),

	/**
	 * An event queue which runs events on demand and updates
	 * Fingerprint.status accordingly. Add events by
	 * Fingerprint.events.add(function,[arg1,arg2,...]) and run all with
	 * Fingerprint.events.run().
	 **/
	events : (function()
		  {
		      var eventQueue = [];
		      return {
			  add    : function(event,args) 
			  { 
			      if ( args === undefined ) args = [];
			      eventQueue.push({ event : event, args : args}); 
			      return this; 
			  },
			  exec   : function() 
			  { 
			      if ( eventQueue.length > 0 )
			      {
				  var event = eventQueue.shift();
				  Fingerprint.status.add('Triggering event');
				  event.event.apply(Fingerprint,event.args);
				  Fingerprint.status.done();
				  return true;
			      }
			      else return false;		
			  },
			  run     : function () { while ( this.exec() ) {} },
			  isEmpty : function() 
			  { 
			      return !eventQueue.length; 
			  }	
		      };
		  })(),

	/**
	 * Update UID.
	 **/
	updateUID : function(uid)
	{
	    if ( uid != fingerprint.uid )
	    {
		fingerprint.uid = uid;
	    }
	},
	
	/**
	 * This function should not be called manually, it is used by Fonts.swf.
	 **/
	updateFonts : function(fonts)
	{ 
	    fingerprint.fonts.flash = fonts; this.status.done(); 
	},
	
	/**
	 * Set new timestamp for Fingerprint.
	 **/
	updateTimestamp : function()
	{ 
	    fingerprint.timestamp = new Date().getTime(); 
	},

	getFingerprint : function() { return fingerprint; }
    };
})();
