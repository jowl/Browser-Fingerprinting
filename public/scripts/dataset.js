

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
	    attr.html($('<b>').text(k).css('cursor','pointer').click(function(){
		var inputs = $(this).siblings('ul').find('input:checkbox');
		inputs.attr('checked',inputs.filter(':checked').length === 0);
	    }));
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
    var show_rtts = function(rtts)
    {
	var sum = 0;
	for ( var i in rtts )
	    sum += rtts[i];
	return sum / rtts.length + "ms";
    };

    var show_accepts = function(accepts)
    {
	var res = '';
	for ( var i in accepts )
	{
	    res += accepts[i].name+';'+accepts[i].qvalue+',';
	}
	return res.substr(0,res.length-1);
    };
    
    var show_timestamp = function(timestamp)
    {
	try
	{
	    var date = new Date(timestamp);
	    var y = date.getFullYear();
	    var m = ('0'+(date.getMonth()+1)).slice(-2);
	    var d = ('0'+date.getDate()).slice(-2);
	    var h = ('0'+date.getHours()).slice(-2);
	    var n = ('0'+date.getMinutes()).slice(-2);
	    var s = ('0'+date.getSeconds()).slice(-2);
	    return y+'-'+m+'-'+d+' '+h+':'+n+':'+s;
	}
	catch(e) { return timestamp.toString(); }
    }

    var show_timezone = function(timezone)
    {
	var tz = -timezone/60 + '';
	if ( tz.indexOf('-') < 0 ) tz = '+' + tz;
	return 'GMT'+tz;
    };

    var set_filterInfo = function(visible,total)
    {
	$('#filter-info').text('Displaying ' + visible + ' of ' + total);
    };

    return function(data)
    {

	$('#data').empty();

	var table = $('<table>');

	table.empty();
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
		    var val = data[i];
		    var fields = a.split('.');
		    for ( var j in fields )
		    {
			if ( val !== undefined )
			    val = val[fields[j]];
		    }

		    // make value more readable
		    if ( val === undefined )
			val = 'undefined';
		    else if ( val instanceof Array )
		    {
			if ( a == 'rtts' )
			    val = show_rtts(val);
			else if ( a.indexOf('accept.') > -1 )
			    val = show_accepts(val);
			else
			    val = val.length;
		    }
		    else if ( a == 'timestamp' )
			val = show_timestamp(val);
		    else if ( a == 'timezone' )
			val = show_timezone(val);
		    else
			val = val.toString();

		    tr.append($('<td>').text(val));

		}
	    }
	    tbody.append(tr);
	}
	table.append(tbody);
	$('#filter').unbind();
	table.tablesorter({ sortList : [[0,0]] })
	    .tablesorterFilter({ filterContainer : '#filter' })
	    .bind('filterEnd',function(){
		var count = table.children('tbody').find('tr:visible').length;
		set_filterInfo(count, data.length);
	    });

	set_filterInfo(data.length,data.length);

	$('#data').append(table);

	$('#pacman').fadeOut('fast');
    };
}
