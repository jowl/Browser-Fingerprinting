var fingerprint = 
{
    useragent        : null,
    ip               : null,
    uid              : null,
    resolution       : {},
    plugins          : [],
    timezone         : null,
    cookies_enabled  : null,
    fonts            : [],
    accept_language  : [],
    accept_charset   : [],
    accept_encoding  : [],
    accept_mediatype : [],
    timestamp        : new Date().getTime()
}


/* 
 * Run when entire DOM is loaded
 */

function addIEPlugin(plugObj) {
    if (window.ActiveXObject) {
	var i = 0;
	control = null;
	while (control == null) {
	    try {
		control = new ActiveXObject(plugObj.ids[i]);
	    } catch (e) {
	    }
	    i++;
	}
	if (control) {
	    version = control.versionInfo;
	    fingerprint.plugins.push({'name' : plugObj.name,
				      'version' : plugObj.getVersion(control,plugObj.ids[i])});
	}
    } 
}


$(function()
{

    fingerprint.useragent.description = navigator.userAgent;

    fingerprint.resolution = { 
	width : screen.width, 
	height : screen.height, 
	color_depth :  screen.colorDepth 
    };

    var ieplugins = [
	{name: 'Quicktime',
	 ids: ["QuickTimeCheckObject.QuickTimeCheck.1", "QuickTime.QuickTime"],
	 getVersion: function(obj, progid) {return obj.QuickTimeVersion.toString(16).replace(/^(.)(.)(.).*/, "$1.$2.$3")}
	},
	{name: 'Acrobat',
	 ids: ["PDF.PdfCtrl.7", "PDF.PdfCtrl.6", "PDF.PdfCtrl.5", "PDF.PdfCtrl.4", "PDF.PdfCtrl.3", "AcroPDF.PDF.1"],
	 getVersion: function(obj, progid) {return progid.replace(/^[a-zA-Z.]+\.([0-9][0-9.]*)/, "$1");}
	},
	{name: 'RealPlayer',
	 ids: ["RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "rmocx.RealPlayer G2 Control"],
	 getVersion: function(obj, progid) {return obj.GetVersionInfo();}
	},
	{name: 'Flash',
	 ids: ["ShockwaveFlash.ShockwaveFlash.9", "ShockwaveFlash.ShockwaveFlash.8.5", "ShockwaveFlash.ShockwaveFlash.8", "ShockwaveFlash.ShockwaveFlash.7", "ShockwaveFlash.ShockwaveFlash.6", "ShockwaveFlash.ShockwaveFlash.5", "ShockwaveFlash.ShockwaveFlash.4"],
	 getVersion: function(obj, progid) {return obj.GetVariable("$version").replace(/[a-zA-Z ]*([0-9,]+)/, "$1").replace(/,/g, '.');}
	},
	{name: 'Adobe SVG',
	 ids: ["Adobe.SVGCtl"],
	 getVersion: function(obj, progid) {return obj.getSVGViewerVersion().replace(/[a-zA-Z; ]*([0-9.]+)/, "$1")};
	},
	{name: 'Windows Media Player',
	 ids: ["WMPlayer.OCX", "MediaPlayer.MediaPlayer.1"],
	 getVersion: function(obj, progid) {return obj.versionInfo;}
	},
	{name: 'DivX',
	 ids: ["npdivx.DivXBrowserPlugin.1", "npdivx.DivXBrowserPlugin"],
	 getVersion: function(obj, progid) {return obj.GetVersion()}
	},
	{name: 'WPFe (Silverlight)',
	 ids: ["AgControl.AgControl"],
	 getVersion: function(obj, progid) {return obj.settings.version}
	},
	{name: 'MSXML',
	 ids: ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0"],
	 getVersion: function(obj, progid) {return progid.replace(/^[a-zA-Z.2]+\.([0-9]+\.[0-9.]+)/, "$1");}
	}
    ];
    
    for (var i = 0; i < iePlugins.length; i++) {
	addIEPlugin(iePlugins[i]);
    }

    fingerprint.timezone = new Date().getTimezoneOffset();

    fingerprint.cookies_enabled = navigator.cookieEnabled;

    // Flash is used to retreive list of fonts
    swfobject.embedSWF("/FontList.swf", "flashcontent", "0", "0", "9.0.0");

    update_count();

    
});

function getPluginInfo(plugin) {
	for (var i = 0; i < plugin.progids.length; i++) {
		try {
			var obj = new ActiveXObject(plugin.progids[i]);
		} catch(e) {}
		if (typeof obj == 'object')
			break;
	}
	return obj ? {name: plugin.name, getVersion: function(){return getVersion(obj, plugin.progids[i])}} : null;

	function getVersion(obj, progid) {
		var version = null;
		try {
			version = plugin.getVersion(obj, progid)
		} catch(e) {}
		return version;
	}
}

// Called from FontList.swf
function populateFontList(fontArr){ fingerprint.fonts = fontArr; }

/*
 * Submit fingerprint as JSON object using POST.
 */
function submit()
{
    fingerprint.timestamp = new Date().getTime();
    $.ajax({
        type: 'POST',
	url: '/post', 
        data: $.toJSON(fingerprint),
	contentType: 'text/json',
	error: function (x,s,error){
	    preview(true);
	    $('#response').addClass('red')
		.text(window.translations['submit_error']);
	    setTimeout(function() { $('#response').fadeOut(500); },5000);
	},
        success: function (data,s,x){
	    $('.submit').fadeOut(500,function(){ 
		$(this).css('visibility','hidden').css('display','inline');
	    });
	    preview(true);
	    $('#response').addClass('green')
		.text(window.translations['thankyou_msg']);
	    setTimeout(function() { $('#response').fadeOut(500); },5000);
	    update_count();
	}
    });
}


/*
 * Show / hide fingerprint. #fingerprint-div content is recalculated every time.
 */
function preview(hide)
{

    if ( $('#fingerprint').filter(':visible').size() > 0 || hide )
    {
	$('#fingerprint').fadeOut(500);
	$('body').animate({ scrollTop: 0 },500,function(){
	    $('.preview').text(window.translations['button_preview']);});
	$('#count').show();
    }
    else
    {
	$('#fingerprint').children().remove('table.obj');
	$('#fingerprint').prepend(
	    display_obj(fingerprint).css({margin : 'auto' })
		.prepend('<tr><td colspan=2><h1>'+window.translations['your_fingerprint']+'</h1></td></tr>')
		.css( {paddingTop : '1em'})).fadeIn(500);
	
	$('body').animate({
	    scrollTop: $("#fingerprint").offset().top
	}, 500);
//	$('.preview').text(window.translations['button_hide']);
	$('#count').hide();
    }
}


/*
 * This function produces an HTML element from an object.
 * Calls itself recusively with subobjects.
 */
function display_obj(obj)
{
    var elem;
    if( typeof obj != 'object' || obj instanceof Date ) 
    // Object has 'primitive' type, return string representation
    {
	elem = $('<div>').addClass('value').html(obj.toString());
    }
    else if ( obj instanceof Array )
    // Object is array, displayed as <ul>
    {
	var list = $('<ul>').css('display','none');
	for( var i in obj )
	    list.append( $('<li>').html( display_obj(obj[i]) ) );

	elem = $('<div>').addClass('value').text(obj.length)
	    .append($('<a>').attr('href','#').text('show').click(
		function(event){
		    $(this).next().toggle();
		    if( $(this).next().filter(':visible').size() == 0 )
			$(this).text('show');
		    else 
			$(this).text('hide');
		    return false;
		}))
	    .append(list);
    }
    else 
    // Object is hash, displayed as <table>
    {
	elem = $('<table>').addClass('obj');
	for( var i in obj )
	{
	    if(obj[i])
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

    return elem;
}

function update_count()
{
    $.get('/count',function(data) { $('#count').text(thousands(data)); });
}

/*
 * Insert thousands separator in numeric string
 */
function thousands(i)
{
    return i.replace(/(\d+)(\d{3})/,function(old,a,b) { return thousands(a) + ',' + b; });
}
