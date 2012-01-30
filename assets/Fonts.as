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

	    var fp:SharedObject = SharedObject.getLocal('fpid');

	    if ( fp.data.uid == null )
	    {
		fp.data.uid = ExternalInterface.call('FP.i');
                fp.flush();
	    }

	    ExternalInterface.call('FP.s',fp.data.uid);

    	    ExternalInterface.call('FP.f', getDeviceFonts());
			
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