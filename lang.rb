# -*- coding: utf-8 -*-
module Lang
   def Lang.getLang(lang)
     if lang == 'en' 
       {'title' => 'Browser Fingerprinting',

         'title_info' => "<p>
	The purpose of this web page is to collect data from web browsers, which
	will be used in our Master's Thesis project. The goal of the project is
	to develop a method for determining the uniqueness of browsers, without
	using intrusive methods such as cookies. We will attempt to do this by
	looking at information about your browser, such as screen resolution,
	installed fonts, browser version, etc. This information constitutes
	your <i>browser fingerprint</i>. Find out more about the project and us
	by clicking the <span class=\"blue\">About</span> button.
      </p>
      <p>
	We would greatly appreciate if you would take the time to share your
	data with us by clicking the <span class=\"green\">Submit</span> button
	below. If you're interested in what type of data we're interested in,
	you can see your <i>fingerprint</i> by clicking
	the <span class=\"orange\">Preview</span> button.
      </p>
      <p>
	Upon clicking <span class=\"green\">Submit</span>, you agree to sharing
	your <i>fingerprint</i> with us and letting us store it for research
	purposes. We will be VERY careful with your data, and under no
	circumstances share it with others.
      </p>",
         'button_about' => "About",
         'button_preview' => "Preview data",
         'button_submit' => "Submit",
         'your_fingerprint' => "Your fingerprint"
       }
     else
       {'title' => 'Browser Fingerprinting',
         'title_info' => "<p>
	Syftet med denna webbsida är att samla in data från webbläsare för vårt
	exjobb. Syftet med projektet är att utveckla en metod för att avgöra om
	en webbläsare är unik, utan att använda inkräktande metoder såsom
	kakor. Vi försöker göra detta genom att enbart titta på information om
	din webbläsare, såsom skärmupplösning, installerade typsnitt,
	webbläsarversion, osv. Denna information utgör vad vi kallar
	ditt <i>fingeravtryck</i>. Du kan läsa mer om vårt projekt och oss genom
	att klicka på knappen <span class=\"blue\">Om projektet</span>.
      </p>
      <p>
	Vi hoppas att du kan ta dig tid att dela med dig av ditt fingeravtryck
	till oss, genom att klicka på knappen <span class=\"green\">Skicka in</span>
	nedan. Om du är intresserad av att se vilken information du delar med
	dig kan du klicka på knappen <span class=\"orange\">Granska data</span>.
      </p>
      <p>
	När du klickar på <span class=\"green\">Skicka in</span> godkänner
	du att vi sparar ditt <i>fingeravtryck</i> för att använda i vår
	forskning. Vi kommer att vara MYCKET försiktiga med din data och inte,
	under några som helst förutsättningar, dela med oss av den till
	utomstående.
      </p>",
         'button_about' => "Om projektet",
         'button_preview' => "Granska data",
         'button_submit' => "Skicka in<br>&nbsp;",
         'your_fingerprint' => "Ditt fingeravtryck"
       }

     end
   end
end
