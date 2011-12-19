package {
    
    import flash.display.Sprite;
    import flash.text.Font;
    import flash.text.FontType;
    import flash.text.FontStyle;
    import flash.external.ExternalInterface;
    import flash.net.SharedObject;
    
    public class Fonts extends Sprite
    {
        public function Fonts()
        {
            ExternalInterface.call('Fingerprint.updateFonts', getDeviceFonts());

	    var fingerprint:SharedObject = SharedObject.getLocal('fingerprint');

	    if ( fingerprint.data.uid == null )
	    {
		fingerprint.data.uid = ExternalInterface.call('Fingerprint.getUID');
                fingerprint.flush();
	    }

	    ExternalInterface.call('Fingerprint.updateUID',fingerprint.data.uid);
        }
        
        public function getDeviceFonts():Array
        {
            var embeddedAndDeviceFonts:Array = Font.enumerateFonts(true);
            
            var deviceFontNames:Array = [];
            for each (var font:Font in embeddedAndDeviceFonts)
            {
                deviceFontNames.push(font.fontName);
            }
            
            return deviceFontNames;
        }
    }
}