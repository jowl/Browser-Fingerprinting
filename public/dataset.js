$(get_dataset);

function get_dataset()
{
    $.get('/dataset.json', function(data){
        var fingerprints = $.parseJSON(data);
	var old = $('#dataset>tr:not(.heading)');
	if ( old.length > 0 ) old.remove();
	for ( var i in fingerprints )
	{
	    var fingerprint = fingerprints[i];
	    var tr = $('<tr>');
	    for ( var key in fingerprint )
	    {
		tr.append($('<td>').text(fingerprint[key]));
	    }
            $('#dataset').append(tr);
	}
    });

}
