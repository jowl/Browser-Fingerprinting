package {
    
    import flash.display.Sprite;
    import flash.text.Font;
    import flash.text.FontType;
    import flash.text.FontStyle;
    import flash.external.ExternalInterface;
    
    public class Fonts extends Sprite
    {
        public function Fonts()
        {
            ExternalInterface.call('Fingerprint.updateFonts', getDeviceFonts());
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