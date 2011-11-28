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
	var control = null;
	try {
	    control = new ActiveXObject(plugObj.id);
	} catch (e) {
	}
	if (control) {
	    isInstalled = true;
	    version = control.versionInfo;
	    fingerprint.plugin.push({'name' : plugObj.name,
				     'version' : version});
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

    var iePlugins = [{'name' : 'Windows Media Player', 'id' : 'WMPlayer.OCX'},
		     {'name' : 'Adobe Reader', 'id' : 'PDF.PdfCtrl'}
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
