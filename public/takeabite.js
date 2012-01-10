/** Post-DOM ******************************************************************/

$(function(){

    //Fingerprint.status.onChange = updateStatus;

    Fingerprint.events.add(Fingerprint.initFlash,['/Fonts.swf'])
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
    $('#status').show();
    $('#loading').show();
    $('#error').hide();
    statusTimeout = setTimeout(onFinish,10000);
    Fingerprint.onFinish(onFinish);

}

function onFinish()
{
    clearTimeout(statusTimeout);
    Fingerprint.onFinish = function() {};
    Fingerprint.status.onChange = function() {};

    $('#status').text('Sending data...');
    Fingerprint.submit(
	'/pot',
	function error()
	{
	    Fingerprint.status.onChange = updateStatus;
	    $('#status').hide();
	    $('#loading').hide();
	    $('#error').show();
	    /* show error msg (highlight) and return to start page here */
    
        },
	function success()
        {
	    /* show thank you message here */
        }
    );

}

function updateStatus()
{
    /*	var status = Fingerprint.status.get();
	$('#status').text(status); */
    
}
