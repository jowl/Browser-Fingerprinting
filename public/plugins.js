function getPlugins()
{
    for ( var i=0; i < navigator.plugins.length; i++) {
	var plugin = navigator.plugins[i];
	var mime_types = [];
	for ( var j=0; j < plugin.length; j++) {
	    mime_types.push(plugin.item(j).type);
	}
	fingerprint.navigator.plugins.push({'name'        : plugin.name,
					    'version'     : plugin.version,
					    'description' : plugin.description,
					    'mime_types'  : mime_types});
    }

}