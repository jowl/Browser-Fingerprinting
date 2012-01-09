/** Post-DOM ******************************************************************/

$(function(){

    Fingerprint.events.add(Fingerprint.updateRTT,[10,'/time'])
                      .add(Fingerprint.initFlash,['/Fonts.swf'])
                      .add(Fingerprint.updatePlugins,[])
                      .add(Fingerprint.updateCSSFonts,[cssFontList])
                      .run();

    Fingerprint.status.onChange = updateStatus;

});


/** Functions *****************************************************************/

var statusTimeout;

function submit()
{

    /* hide button and show loading bar here */

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
	'/post',
	function error()
	{
	    /* show error msg (highlight) and return to start page here */

	    $('#status').text('Something went wrong, we are sorry for the inconvinience! Please try again later.');

	});
	    
        },
	function success()
        {
	    /* show thank you message here */
        }
    );

}

function updateStatus()
{
    var status = Fingerprint.status.get();
    $('#status').text(status);
}
