/**
 * Dependencies:
 *  - JQuery (>= 1.6.4)
 *  - JQuery.JSON (>= 2.3)
 *  - swfobject.js
 *  - Fonts.sfw
**/
var Fingerprint =
{

    pending : 
    { 
	pending : 0,
	add    : function() { this.pending = Math.max(this.pending+1,1); },
	done   : function() { this.pending--; },
	isDone : function() { return this.pending == 0; }
    },

    fingerprint :
    {
	ip               : undefined,
	uid              : undefined,
	useragent        : undefined,
	navigator        : undefined,
	screen           : undefined,
	window           : undefined,
	timezone         : undefined,
	clock_diff       : undefined,
	rtts             : [],
	fonts            : [],
	accept           : undefined,
	timestamp        : new Date().getTime()
    },
    
    init : function()
    {
	if ( navigator )
	{
	    this.fingerprint.navigator = 
		{ 
		    appCodeName   : navigator.appCodeName,
		    appName       : navigator.appName,
		    appVersion    : navigator.appVersion,
		    cookieEnabled : navigator.cookieEnabled,
		    language      : navigator.language,
		    plugins       : [],
		    platform      : navigator.platform,
		    product       : navigator.product,
		    productSub    : navigator.productSub,
		    userAgent     : navigator.userAgent,
		    vendor        : navigator.vendor,
		    vendorSub     : navigator.vendorSub
		};
	}

	if ( window )
	{
	    this.fingerprint.window =
		{
		    innerWidth  : window.innerWidth,
		    innerHeight : window.innerHeight,
		    outerWidth  : window.outerWidth,
		    outerHeight : window.outerHeight
		};
	}


	if ( screen ) 
	{
	    this.fingerprint.screen = 
		{
		    width          : screen.width,
		    height         : screen.height,
		    availWidth     : screen.availWidth,
		    availHeight    : screen.availHeight,
		    availLeft      : screen.availLeft,
		    availTop       : screen.availTop,
		    colorDepth     : screen.colorDepth,
		    pixelDepth     : screen.pixelDepth,
		    updateInterval : screen.updateInterval // ie-specific

		};
	}

	this.fingerprint.timezone = (new Date).getTimezoneOffset();
    },

    
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
		    control = null;
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
	
	if ( this.fingerprint.navigator && navigator )
	{
	    this.pending.add();
	    this.fingerprint.navigator.plugins = ( navigator.userAgent.indexOf('MSIE') == -1 ) 
	        ? getPlugins() 
	        : getPluginsIE();
	    this.pending.done();
	}
    },

    /**
      * Performs k sequential AJAX requests to url, which should return a UNIX timestamp.
     **/
    updateRTT : function getRTT(k,url)
    {
	var testRTT = function(ct,k,obj)
	{
	    return function(data)
	    {
		var rtt = new Date().getTime() - ct;
		obj.fingerprint.rtts.push(rtt);
		var st = parseInt(data,10);
		var clock_diff = 
		    { 
			min : Math.min(st - ct - rtt, st - ct),
			max : Math.max(st - ct - rtt, st - ct)
		    };
		if ( obj.fingerprint.clock_diff === undefined ) obj.fingerprint.clock_diff = clock_diff;
		else obj.fingerprint.clock_diff = 
		    {
			min : Math.max(clock_diff.min,obj.fingerprint.clock_diff.min),
			max : Math.min(clock_diff.max,obj.fingerprint.clock_diff.max)
		    }

		obj.pending.done();

		if ( k > 0 )
		{
		    $.get(url,testRTT(new Date().getTime(),k-1, obj));
		    obj.pending.add();
		}
	    };
	}

	$.get(url,testRTT(new Date().getTime(),k-1,this));
	this.pending.add();
    },
	
    updateFonts : function(fonts){ this.fingerprint.fonts = fonts; this.pending.done(); },
    
    updateTimestamp : function()
    { 
	this.fingerprint.timestamp = new Date().getTime(); 
    },

    submit : function(url,error,success)
    {
	this.updateTimestamp();
	$.ajax({
	    type: 'POST',
	    url: url, 
	    data: $.toJSON(this.fingerprint),
	    contentType: 'text/json',
	    error: error,
	    success: success
	});
    },

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

	return  display_obj(this.fingerprint);
    },

    initFlash : function(url)
    {
	if ( $('#FingerprintFlash').length == 0 )
	    $('body').prepend( $('<div>').attr('id','FingerprintFlash') );
	swfobject.embedSWF(url, 'FingerprintFlash', '0', '0', '9.0.0');
	this.pending.add();
    },

    set : function(key,value)
    {
	this.fingerprint[key] = value;
    },

    onFinish : function(callback,wait,obj)
    {

	if ( this.pending.isDone() ) callback();
	else 
	{
	    if ( !wait ) wait = 125;
	    if ( !obj ) obj = this;
	    setTimeout(function(){ obj.onFinish(callback,wait*2,obj); },wait);
	}

    },
    getUID : function()
    {
	return this.fingerprint.uid;
    },
    updateUID : function(uid)
    {
	if ( uid != this.fingerprint.uid )
	{
	    this.fingerprint.uid = uid;
	}
    }

}