function get_dataset()
{
    $.get('/dataset.json', function(data){
        var fingerprints = $.parseJSON(data);
        $('#dataset').html(display_obj(fingerprints));
    });

}

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
