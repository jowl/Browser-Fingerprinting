/** Post-DOM ******************************************************************/

function init(){

     Fingerprint.init(tmp);

 //   Fingerprint.status.onChange = updateStatus;

    Fingerprint.events.add(Fingerprint.initFlash,['/scripts/Fonts.swf'])
                      .add(Fingerprint.updatePlugins,[])
	              .add(Fingerprint.updateRTT,[10,'/time'])
                      .add(Fingerprint.updateCSSFonts,[cssFontList])
	              .run();

}

$(function(){
    if( window.navigator.userAgent.toLowerCase().indexOf('android') > -1 )
    {
	$('h1,h2').css({'-webkit-mask':'none'});
    }

});

if (window.addEventListener) { window.addEventListener("load", init, false); }
else if (window.attachEvent) { window.attachEvent("onload",init); }
else window.onload = init;

/** Functions *****************************************************************/

var statusTimeout;
function test() {
    return  'More information';
}
function submit()
{
    /* hide button and show loading bar here */
    $('#share').fadeToggle('fast',function(){
	$('#loading').fadeToggle('fast').promise().done(function(){
	    statusTimeout = setTimeout(onFinish,10000);
	    setTimeout(function(){Fingerprint.onFinish(onFinish);},500);
	});
    });

}

function onFinish()
{
    clearTimeout(statusTimeout);
    Fingerprint.onFinish = function() {};
    Fingerprint.status.onChange = function() {};
    trackFinish();

    $('#status').text('Sending data...');
    Fingerprint.submit(
	'/post',
	function error()
	{
	    Fingerprint.status.onChange = updateStatus;
	    $('#loading').fadeToggle('fast',function(){
		$('#error').fadeToggle('fast');
	    });
	    /* show error msg (highlight) and return to start page here */
	    
	},
	function success()
	{
	    $('#cookie').attr('src','/img/cookie_eaten.gif');
	    $('#loading').fadeToggle('fast',function(){
		$('#thanks').fadeToggle('fast');
	    });
	    /* show thank you message here */
	}
    );
}

function updateStatus()
{
    	var status = Fingerprint.status.get();
	$('#status').text(status); 
    
}
