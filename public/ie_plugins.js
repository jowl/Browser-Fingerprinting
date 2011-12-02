function getPlugins()
{
    var addIEPlugin = function(plugObj) {
	if (window.ActiveXObject) {
	    var i = 0;
	    control = null;
	    while ((control == null) && (i < plugObj.ids.length)) {
		try {
		    control = new ActiveXObject(plugObj.ids[i]);
		} catch (e) {
		}
		i++;
	    }
	    if (control) {
		fingerprint.navigator.plugins.push({'name' : plugObj.name,
						    'version' : plugObj.getVersion(control,plugObj.ids[i])});
	    }
	} 
    }

    var ieplugins = [
	{name: 'Quicktime',
	 ids: ["QuickTimeCheckObject.QuickTimeCheck.1", "QuickTime.QuickTime"],
	 getVersion: function(obj, progid) {return obj.QuickTimeVersion.toString(16).replace(/^(.)(.)(.).*/, "$1.$2.$3")}
	},
	{name: 'Acrobat',
	 ids: ["PDF.PdfCtrl.7", "PDF.PdfCtrl.6", "PDF.PdfCtrl.5", "PDF.PdfCtrl.4", "PDF.PdfCtrl.3", "AcroPDF.PDF.1"],
	 getVersion: function(obj, progid) {return progid.replace(/^[a-zA-Z.]+\.([0-9][0-9.]*)/, "$1");}
	},
	{name: 'RealPlayer',
	 ids: ["RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "rmocx.RealPlayer G2 Control"],
	 getVersion: function(obj, progid) {return obj.GetVersionInfo();}
	},
	{name: 'Flash',
	 ids: ["ShockwaveFlash.ShockwaveFlash.9", "ShockwaveFlash.ShockwaveFlash.8.5", "ShockwaveFlash.ShockwaveFlash.8", "ShockwaveFlash.ShockwaveFlash.7", "ShockwaveFlash.ShockwaveFlash.6", "ShockwaveFlash.ShockwaveFlash.5", "ShockwaveFlash.ShockwaveFlash.4"],
	 getVersion: function(obj, progid) {return obj.GetVariable("$version").replace(/[a-zA-Z ]*([0-9,]+)/, "$1").replace(/,/g, '.');}
	},
	{name: 'Adobe SVG',
	 ids: ["Adobe.SVGCtl"],
	 getVersion: function(obj, progid) {return obj.getSVGViewerVersion().replace(/[a-zA-Z; ]*([0-9.]+)/, "$1")}
	},
	{name: 'Windows Media Player',
	 ids: ["WMPlayer.OCX", "MediaPlayer.MediaPlayer.1"],
	 getVersion: function(obj, progid) {return obj.versionInfo;}
	},
	{name: 'DivX',
	 ids: ["npdivx.DivXBrowserPlugin.1", "npdivx.DivXBrowserPlugin"],
	 getVersion: function(obj, progid) {return obj.GetVersion()}
	},
	{name: 'WPFe (Silverlight)',
	 ids: ["AgControl.AgControl"],
	 getVersion: function(obj, progid) {
	     var majorVersion = '1';
	     var minorVersion = '0';
	     var minorMinorVersion = '0';
	     while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) {
		 majorVersion++;
             }
	     majorVersion--;
	     while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) {
		 minorVersion++;
             }
	     minorVersion--;
	     while (obj.IsVersionSupported(majorVersion + '.' + minorVersion + '.' + minorMinorVersion)) {
		 minorMinorVersion++;
             }
	     minorMinorVersion--;
	     return majorVersion + '.' + minorVersion + '.' +minorMinorVersion;
         }
	},
	{name: 'MSXML',
	 ids: ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0"],
	 getVersion: function(obj, progid) {return progid.replace(/^[a-zA-Z.2]+\.([0-9]+\.[0-9.]+)/, "$1");}
	}
    ];
    
    for (var i = 0; i < ieplugins.length; i++) {
	addIEPlugin(ieplugins[i]);
    }
}
