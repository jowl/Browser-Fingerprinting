/** Post-DOM ******************************************************************/

$(function(){

     Fingerprint.init(tmp);

 //   Fingerprint.status.onChange = updateStatus;

    Fingerprint.events.add(Fingerprint.initFlash,['/scripts/Fonts.swf'])
                      .add(Fingerprint.updatePlugins,[])
                      .add(Fingerprint.updateCSSFonts,[cssFontList])
	              .add(Fingerprint.updateRTT,[10,'/time'])
                      .run();

});


/** Functions *****************************************************************/

var statusTimeout;

function submit()
{

    /* hide button and show loading bar here */
    $('#share').hide();
    $('#loading').show();
//    statusTimeout = setTimeout(onFinish,10000);
    Fingerprint.onFinish(onFinish);

}

function onFinish()
{
    clearTimeout(statusTimeout);
    Fingerprint.onFinish = function() {};
    Fingerprint.status.onChange = function() {};

    $('#status').text('Sending data...');
    Fingerprint.submit(
	'/post',
	function error()
	{
	    Fingerprint.status.onChange = updateStatus;
	    $('#loading').hide();
	    $('#error').show();
	    /* show error msg (highlight) and return to start page here */
    
        },
	function success()
        {
	    setTimeout(function(){
		$('#loading').hide();
		$('#thanks').show();
		$('#cookie').attr('src','/img/cookie_eaten.png');
	    },1000);
	    /* show thank you message here */
        }
    );

}

function updateStatus()
{
    	var status = Fingerprint.status.get();
	$('#status').text(status); 
    
}
