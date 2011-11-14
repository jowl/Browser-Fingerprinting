$(get_dataset);

function get_dataset()
{
    var fields = [ 'useragent_name', 'useragent_version', 'ip', 'fonts' , 'mime_types' ,'resolution',  'timezone', 'timestamp', 'uid' ];

    $.get('/dataset.json', function(data){
        var fingerprints = $.parseJSON(data);
	var old = $('#dataset>tr:not(.heading)');
	if ( old.length > 0 ) old.remove();
	for ( var i in fingerprints )
	{
	    var fingerprint = fingerprints[i];
	    var tr = $('<tr>');
/*	    for ( var key in fingerprint )
	    {
		tr.append($('<td>').text(fingerprint[key]));  
	    } */
	    for ( var i = 0; i < fields.length; i++) {
		tr.append($('<td>').text(fingerprint[fields[i]]));
	    }

            $('#dataset').append(tr);
	}
    });

}
