var FP = function()
{

// script and flash url -------------------------------------------------------

    var _URL = 'http://take-a-bite.org/fp'
    var _FLASH_URL = 'FP.swf';

// fingerprint object ---------------------------------------------------------
    var fp = 
	{
	    uid       : '',
	    navigator : {},
	    screen    : {},
	    fonts     : {}
	};


// auxiliary functions --------------------------------------------------------
    var stringify = function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
	    if (t == "string") obj = '"'+obj+'"';
	    return String(obj);
	}
	else {
	    var n, v, json = [], arr = (obj && obj.constructor == Array);
	    for (n in obj) {
		v = obj[n]; t = typeof(v);
		if (t == "string") v = '"'+v+'"';
		else if (t == "object" && v !== null) v = stringify(v);
		json.push((arr ? "" : '"' + n + '":') + String(v));
	    }
	    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
    };

    var base64_encode = function(data) {
	if (typeof btoa == 'function')
	    return btoa(data);
	
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	enc = "",
	tmp_arr = [];

	if (!data) {
            return data;
	}

	do { // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');
	
	var r = data.length % 3;
	
	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

    }

    var updatePlugins = function()
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
		    for ( var j=0; j < plugin.length; j++) 
		    {
			if ( typeof plugin.item == 'function' )
			{
			    if ( plugin.item(j) )
				mime_types.push(plugin.item(j).type);
			}
			else
			{
			    if ( plugin[j] )
				mime_types.push(plugin[j].type);
			}
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
	
	if ( window.navigator )
	{
	    fp.navigator.plugins = ( window.navigator.userAgent.indexOf('MSIE') == -1 ) 
		? getPlugins() 
		: getPluginsIE();
	}
    }

    var generateUID = function()
    {
	var uid = '';
	for ( var i=0 ; i < 12 ; i++ )
	    uid += Math.round(Math.random()*36).toString(36);
	return uid;
    }

// submit function ------------------------------------------------------------
    var submitted = false;

    var submit = function()
    {
	try
	{
	    if ( !submitted )
	    {
		submitted = true;

		if ( fp.uid.length === 0 )
		{
		    for ( var i=0 ; i < 12 ; i++ )
			fp.uid = generateUID();
		    
		}

		var exdate = new Date;
		exdate.setDate(exdate.getDate()+90);
		
		document.cookie = 'fpid='+fp.uid+' ; expires='+exdate.toUTCString()+' ; path=/';
		if ( window.localStorage ) 
		{
		    try
		    {
			localStorage.setItem('fpid',fp.uid);
		    }catch(e) {}
		}
		
		var fp_str = base64_encode(stringify(fp))+'.';

		var session = generateUID();
		for ( var i = 0 ; i*2000 < fp_str.length ; i++ )
		{
		    var script = document.createElement('script');
		    script.src = _URL+'?no='+i+'&ts='+(new Date).getTime()+'&sid='+session+'&fp='+fp_str.substr(i*2000,2000);
		    document.getElementsByTagName('body')[0].appendChild(script);
		}
		
//		document.getElementById('debug').innerHTML = stringify(fp);

	    }
	}catch(e) { }
    }

// main script ----------------------------------------------------------------

    var main = function(){

	try
	{
	
	    var cookies = document.cookie.split(';');
	    for ( var i in cookies )
	    {
		var kvp = cookies[i].split('=');
		if ( kvp.length == 2 && kvp[0] == 'fpid' )
		{
		    fp.uid = kvp[1]; break;
		}
		
	    }

	    if ( window['localStorage'] )
	    {
		try
		{
		    var uid = localStorage.getItem('fpid');
		    if (  typeof uid === 'string' && uid.length > 0 )
			fp.uid = uid;
		}
		catch(e) { }
	    }
	    
	    fp.navigator['userAgent'] = window.navigator.userAgent;
	    updatePlugins();
	    fp.screen['availHeight'] = window.screen.availHeight;
	    
	    setTimeout(submit,2000);
	    
	    var flash = document.createElement('object');
	    document.getElementsByTagName('body')[0].appendChild(flash);
		
	    if ( navigator.userAgent.indexOf('MSIE') == -1)
	    {
		flash.id="FPflash";
		flash.width=1;
		flash.height=1;
		flash.type = 'application/x-shockwave-flash';
		flash.data = _FLASH_URL;
		var param = document.createElement('param');
		param.name = 'AllowScriptAccess';
		param.value = 'always';
		flash.appendChild(param);
	    }
	    else
	    {
		flash.outerHTML = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" type="application/x-shockwave-flash" data="Fonts.swf" width="1" height="1" id="FPflash"><param name="AllowScriptAccess" value="always"/><param name="movie" value="'+_FLASH_URL+'"></object>';

	    }

	
	}catch(e) { }


    }

    if ( document.addEventListener ) {
	// A fallback to window.onload, that will always work
	window.addEventListener( "load", main, false );
	
	// If IE event model is used
    } else if ( document.attachEvent ) {
	// A fallback to window.onload, that will always work
	window.attachEvent( "onload", main );
    }


// exported functions (for flash callback) ------------------------------------
    return {
	f : function (fonts)
	{
	    fp.fonts['flash'] = fonts;
	    submit();
	},
	
	i : function()
	{
	    return fp.uid;
	},
	
	s : function (uid)
	{
	    if ( typeof uid === 'string' && uid.length == 12 )
		fp.uid = uid;
	}
    };
}();
