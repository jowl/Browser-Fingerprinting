$(get_dataset);


function get_dataset()
{
    var query = location.search;
    var fields = query.substring(1).split('&');
    //[ 'useragent_name', 'useragent_version', 'ip', 'fonts' , 'mime_types' , 'plugins', 'resolution',  'timezone', 'timestamp', 'uid' ];

    $.get('/dataset.json'+query, function(data){
        var fingerprints = $.parseJSON(data);
	var old = $('#dataset>tr');
	if ( old.length > 0 ) old.remove();
	var tr = $('<tr>');
	for ( var i in fields )
	{
	    tr.append($('<th>').text(fields[i]));
	}
	$('#dataset').append(tr);

	for ( var i in fingerprints )
	{
	    var fingerprint = fingerprints[i];
	    var tr = $('<tr>');
	    for ( var i in fields) 
	    {
		var val;
		try
		{
		    val = eval('fingerprint.'+fields[i]).toString();
		    if ( fields[i] == 'timestamp' )
			val = new Date(+val).toString().substring(4,24);

		}
		catch(e)
		{
		    val = 'n/a';
		}
		finally
		{
		    tr.append($('<td>').text(val));
		}
	    }

            $('#dataset').append(tr);
	}
    });

}
