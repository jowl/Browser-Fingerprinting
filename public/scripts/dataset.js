

function get_all_attrs(obj,parent)
{
    var qname;
    var list = $('<ul>').addClass('inputs-list');
    for ( var k in obj )
    {
	if ( parent ) qname = parent+'.'+k;
	else qname = k
	var attr = $('<li>');
	if ( typeof obj[k] === 'object' && !(obj[k] instanceof Date) && !(obj[k] instanceof Array) )
	{
	    attr.html('<b>' + k + '</b>');
	    attr.append(get_all_attrs(obj[k],qname));
	}
	else
	{

	    var t = typeof obj[k];
	    if ( t == 'object' )
	    {
		if ( obj[k] instanceof Date )
		    t = 'date';
		else if ( obj[k] instanceof Array )
		    t = 'array';
	    }
	    attr.html(
		$('<label>').append(
		    $('<input>').attr({'type':'checkbox','value':qname})
		).append(
		    $('<span>').html(k + ' <i>('+t+')')
		)
	    );
	}

	list.append(attr);
    }
    
    return list;

}


function update_datatable(attrs)
{
    return function(data)
    {
	var table = $('#data');

	table.children().remove();
	var tr = $('<tr>').append($('<th>').text('#'));

	for ( var a in attrs )
	{
	    if ( attrs[a] )
		tr.append($('<th>').text(a));
	}

	table.append($('<thead>').append(tr));

	var tbody = $('<tbody>');
	for ( var i in data )
	{
	    tr = $('<tr>').append($('<td>').text(parseInt(i)+1));
	    for ( var a in attrs )
	    {
		if ( attrs[a] )
		{
		    var tmp = data[i];
		    var fields = a.split('.');
		    for ( var j in fields )
		    {
			if ( tmp !== undefined )
			    tmp = tmp[fields[j]];
		    }
		    if ( tmp === undefined )
			tmp = 'undefined';
		    else if ( tmp instanceof Array )
			tmp = tmp.length;
		    tr.append($('<td>').text(tmp.toString()));
		}
	    }
	    tbody.append(tr);
	}
	table.append(tbody);
	table.tablesorter();
	$('#pacman').fadeOut('fast');
    };
}
