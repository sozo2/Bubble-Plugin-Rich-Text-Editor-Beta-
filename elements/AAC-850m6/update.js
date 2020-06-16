var update = function(instance, properties, context) {

  var all_fonts = ['sans-serif', 'abeezee', 'abril-fatface', 'alegreya', 'archivo', 'arial', 'arvo', 'biorhyme', 'b612', 'cairo', 'cardo', 'concert-one', 'cormorant', 'cousine', 'crimson-text', 'droid-sans', 'droid-serif', 'eb-garamond', 'exo-2', 'fira-sans', 'fjalla-one', 'frank-ruhl-libre', 'karla', 'ibm-plex', 'lato', 'lora', 'merriweather', 'mizra', 'monospace', 'montserrat', 'muli', 'noto-sans', 'nunito', 'old-standard-tt', 'open-sans', 'oswald', 'oxygen', 'playfair-display', 'pt-sans', 'pt-serif', 'poppins', 'rakkas', 'raleway', 'roboto', 'rubik', 'serif', 'source-sans', 'source-sans-pro', 'spectral', 'times-new-roman', 'tinos', 'titillium', 'ubuntu','varela','volkorn','work-sans','yatra-one'];

  if (!instance.data.initialized) {
    instance.data.prev_initial_content = properties.initial_content;
  }


  if(properties.bubble.auto_binding === true){
    if (properties.initial_content) {
      console.warn("Ignoring initial content since autobinding is enabled.");
    }
    properties.initial_content = properties.autobinding;
  }

  if(properties.initial_content !== instance.data.prev_initial_content){
    instance.data.prev_initial_content = properties.initial_content;
    instance.data.initial_content_loaded = false;
  }
  //function to check if the input is truly empty - runs under the assumption that an input should be considered empty if it contains a blank html tag but no text is actually written
  var checkForContent = function(html){
    html = html.replace(/<(.*?)>(.*?)<\/(.*?)>/gmi, "$2");
    html = html.replace(/<br>/gi, "");
    return html;
  }

  //"translates" Quill html to bbcode to be consumed and usable by Bubble text fields using regex matches
  var htmlToBBCode = function(html) {
    html = html.replace(/<(.*?)style="(.*?)background-color:(.*?);(.*?)"(.*?)>(.*?)<\//gmi, '<$1style="$2$4"$5>[highlight=$3]$6[/highlight]</');
    html = html.replace(/<(.*?)style="(.*?)color:(.*?);(.*?)"(.*?)>(.*?)<\//gmi, '<$1style="$2$4"$5>[color=$3]$6[/color]</');
    html = html.replace(/<(.*?)class="(.*?)ql-size-small(.*?)"(.*?)>(.*?)<\//gmi, '<$1class="$2$3"$4>[size=1]$5[/size]</');
    html = html.replace(/<(.*?)class="(.*?)ql-size-large(.*?)"(.*?)>(.*?)<\//gi, '<$1class="$2$3"$4>[size=4]$5[/size]</');
    html = html.replace(/<(.*?)class="(.*?)ql-size-huge(.*?)"(.*?)>(.*?)<\//gmi, '<$1class="$2$3"$4>[size=6]$5[/size]</');
    html = html.replace(/<(.*?)class="(.*?)ql-font-(.*?)( |")(.*?)>(.*?)<\//gmi, '<$1class="$2$4$5>[font=$3]$6[/font]</');

    html = html.replace(/<h1(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/h1>/gmi, '[$3]<h1$1class="$2$4"$5>$6</h1>[/$3]');
    html = html.replace(/<h2(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/h2>/gmi, '[$3]<h2$1class="$2$4"$5>$6</h2>[/$3]');
    html = html.replace(/<h3(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/h3>/gmi, '[$3]<h3$1class="$2$4"$5>$6</h3>[/$3]');
    html = html.replace(/<h4(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/h4>/gmi, '[$3]<h4$1class="$2$4"$5>$6</h4>[/$3]');

    html = html.replace(/<blockquote(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/blockquote>/gmi, '[$3]<blockquote$1class="$2$4"$5>$6</blockquote>[/$3]');
    html = html.replace(/<p (.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/p>/gmi, '[$3]<p $1class="$2$4"$5>$6</p>[/$3]');
    html = html.replace(/<iframe class="ql-video ql-align-(right|center|justify)" frameborder="0" allowfullscreen="true" src="(.*?)"><\/iframe>/gmi, '[$1]<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="$2"></iframe>[/$1]');
    html = html.replace(/<h1(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h1>/gmi, '<h1$1class="$2$4"$5>[indent data=$3]$6[/indent]</h1>');
    html = html.replace(/<h2(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h2>/gmi, '<h2$1class="$2$4"$5>[indent data=$3]$6[/indent]</h2>');
    html = html.replace(/<h3(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h3>/gmi, '<h3$1class="$2$4"$5>[indent data=$3]$6[/indent]</h3>');
    html = html.replace(/<h4(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h4>/gmi, '<h4$1class="$2$4"$5>[indent data=$3]$6[/indent]</h4>');
    html = html.replace(/<blockquote(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/blockquote>/gmi, '<blockquote$1class="$2$4"$5>[indent data=$3]$6[/indent]</blockquote>');
    html = html.replace(/<p (.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/p>/gmi, '<p $1class="$2$4"$5>[indent data=$3]$6[/indent]</p>');

    html = html.replace(/<(ul|ol)>(.*?)<\/(ul|ol)>/gmi, function (x) {
      x = x.replace(/<br>/gi, "");
      var list_items = x.replace(/<(ul|ol)>(.*?)\/li><\/(ul|ol)>/gmi, "$2").split("/li><li");
      var list_type = x.slice(1,3);
      var indent_tracker = 0;
      var list_content = "";
      var result = "[ml][" + list_type + "]";
      for(var i=0;i<list_items.length; i+=1){
        list_content = list_items[i].substring( (list_items[i].indexOf(">") + 1), list_items[i].length - 1);
        var current_indent = 0;
        var align = "left";
        if(list_items[i].includes("ql-align-")){
          align = list_items[i].match(/ql-align-(right|justify|center)/m);
          align = align[0].replace(/ql-align-/m,"");
        }
        if(list_items[i].includes("ql-indent-")){
          current_indent = Number(list_items[i].replace(/(.*?)class="(.*?)ql-indent-([1-9])(.*?)">(.*?)</m, "$3").charAt(0));
        }
        if(current_indent == indent_tracker || i==0){
          result += "[li indent=" + current_indent+ " align=" + align + "]" + list_content + "[/li]";
        } else {
          if(current_indent > indent_tracker){
            result += "[" + list_type + " data=" + current_indent+ "][li indent=" + current_indent+ " align=" + align + "]" + list_content + "[/li]";
            indent_tracker += 1;
          } else {
            var diff = Math.abs(current_indent - indent_tracker);
            while(diff > 1){
              result += "[/" + list_type + "]";
              diff -= 1;
            }
            result += "[/" + list_type + "][li indent=" + current_indent+ " align=" + align + "]" + list_content + "[/li]";
            indent_tracker = current_indent;
          }
        }
      }
      while(indent_tracker > 0) {
        result += "[/" + list_type + "]";
        indent_tracker -= 1;
      }
      result += "[/" + list_type + "][/ml]";
      return result;
    });
              
    html = html.replace(/<img[^>]* src="(.*?)" style="cursor: nwse-resize;" width="(.*?)">/gi, "[img width=$2]$1[/img]");
    html = html.replace(/<img[^>]* src="(.*?)" style="" width="(.*?)">/gi, "[img width=$2]$1[/img]");
    html = html.replace(/<img[^>]* src="(.*?)" width="(.*?)">/gi, "[img width=$2]$1[/img]");
    html = html.replace(/<img[^>]* src="(.*?)"(.*?)>/gi, "[img]$1[/img]");
    html = html.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gi, function(x){
      var src = x.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gi, "$2");
      var url_text = x.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gi, "$4");
      if(!src.includes('http://') && !src.includes("https://")){
        src = "https://" + src;
      }
      return "[url="+src+"]"+url_text+"[/url]";
    });
    html = html.replace(/<iframe(.*?)src="https:\/\/www.youtube.com\/embed\/(.*?)\?showinfo=0"(.*?)><\/iframe>/gi, "[youtube]$2[/youtube]");
    html = html.replace(/<pre [^>]*>/gmi, "[code]");

    html = html.replace(/<(.*?) class="(.*?)"(.*?)>/gmi, "<$1$3>");
    html = html.replace(/<(.*?) style="(.*?)">/gmi, "<$1>");
    html = html.replace(/<(.*?) (.*?)">/gmi, "<$1>");

    html = html.replace(/<h1>/gmi, "[h1]");
    html = html.replace(/<h2>/gmi, "[h2]");
    html = html.replace(/<\/h1>/gmi, "[/h1]\n");
    html = html.replace(/<\/h2>/gmi, "[/h2]\n");
    html = html.replace(/<h3>/gmi, "[h3]");
    html = html.replace(/<h4>/gmi, "[h4]");
    html = html.replace(/<\/h3>/gmi, "[/h3]\n");
    html = html.replace(/<\/h4>/gmi, "[/h4]\n");

    html = html.replace(/<sub>/gi, "[sub]");
    html = html.replace(/<\/sub>/gi, "[/sub]");
    html = html.replace(/<sup>/gi, "[sup]");
    html = html.replace(/<\/sup>/gi, "[/sup]");
    html = html.replace(/<pre>/gmi, "[code]");
    html = html.replace(/<\/pre>/gmi, "[/code]");
    html = html.replace(/<blockquote>/gi, "[quote]");
    html = html.replace(/<\/blockquote>/gi, "[/quote]");
    html = html.replace(/<u>/gi, "[u]");
    html = html.replace(/<\/u>/gi, "[/u]");
    html = html.replace(/<em>/gi, "[i]");
    html = html.replace(/<\/em>/gi, "[/i]");
    html = html.replace(/<strong>/gi, "[b]");
    html = html.replace(/<\/strong>/gi, "[/b]");
    html = html.replace(/<s>/gi, "[s]");
    html = html.replace(/<\/s>/gi, "[/s]");

    html = html.replace(/<p>/gi, "");
    html = html.replace(/<span>/gi, "");
    html = html.replace(/<\/span>/gi, "");
    html = html.replace(/<\/p>/gi, "\n");

    html = html.replace(/http:\/\//gi, "http://");
    html = html.replace(/https:\/\//gi, "https://");

    html = html.replace(/\[\/center\]\[center\]<br>\n/gmi, "[/center]<buffer>[center]<br>\n");
    html = html.replace(/\[\/center\]\[center\]/gmi, "");
    html = html.replace(/\[\/right\]\[right\]<br>\n/gmi, "[/right]<buffer>[right]<br>\n");
    html = html.replace(/\[\/right\]\[right\]/gmi, "");
    html = html.replace(/\[\/justify\]\[justify\]<br>\n/gmi, "[/justify]<buffer>[justify]<br>\n");
    html = html.replace(/\[\/justify\]\[justify\]/gmi, "");

    html = html.replace(/<buffer>/gi, "");
    html = html.replace(/<br>/gi, "");

    html = html.replace(/&lt;/gmi, "<");
    html = html.replace(/&gt;/gmi, ">");
    html = html.replace(/&amp;/gmi, "&");
    html = html.replace(/&nbsp;/gmi, " ");
    return html;
  }

  //"translates" bbcode to Quill html - useful when using dynamic values to set initial input
  var bbCodeToHTML = function(bbcode) {
    bbcode = bbcode.replace(/\n/gi, "<br>");
    bbcode = bbcode.replace(/\[\/center\]/gi, "[/center]<br>");
    bbcode = bbcode.replace(/\[\/right\]/gi, "[/right]<br>");
    bbcode = bbcode.replace(/\[\/justify\]/gi, "[/justify]<br>");

    bbcode = bbcode.replace(/\[center\](.*?)\[\/center\]/gmi, function(x){
      x = x.replace(/\[center\](.*?)\[\/center\]/gmi, "$1");
      x = x.replace(/\[h1\]/gmi, "[center][h1]");
      x = x.replace(/\[\/h1\]/gmi, "[/h1][/center]");
      x = x.replace(/\[h2\]/gmi, "[center][h2]");
      x = x.replace(/\[\/h2\]/gmi, "[/h2][/center]");
      x = x.replace(/\[h3\]/gmi, "[center][h3]");
      x = x.replace(/\[\/h3\]/gmi, "[/h3][/center]");
      x = x.replace(/\[h4\]/gmi, "[center][h4]");
      x = x.replace(/\[\/h4\]/gmi, "[/h4][/center]");
      x = x.replace(/\[quote\]/gmi, "[center][quote]");
      x = x.replace(/\[\/quote\]/gmi, "[/quote][/center]");
      x = x.replace(/\[youtube\]/gmi, "[center][youtube]");
      x = x.replace(/\[\/youtube\]/gmi, "[/youtube][/center]");
      x = x.replace(/<br>/gmi, "[center][/center]");
      x = x.replace(/\[\/center\](.*?)\[center\]/gmi, "[/center][center]$1[/center][center]");
      x = x.replace(/\[center\]\[\/center\]/gmi, "");
      return x;
    });

    bbcode = bbcode.replace(/\[right\](.*?)\[\/right\]/gmi, function(x){
      x = x.replace(/\[right\](.*?)\[\/right\]/gmi, "$1");
      x = x.replace(/\[h1\]/gmi, "[right][h1]");
      x = x.replace(/\[\/h1\]/gmi, "[/h1][/right]");
      x = x.replace(/\[h2\]/gmi, "[right][h2]");
      x = x.replace(/\[\/h2\]/gmi, "[/h2][/right]");
      x = x.replace(/\[h3\]/gmi, "[right][h3]");
      x = x.replace(/\[\/h3\]/gmi, "[/h3][/right]");
      x = x.replace(/\[h4\]/gmi, "[right][h4]");
      x = x.replace(/\[\/h4\]/gmi, "[/h4][/right]");
      x = x.replace(/\[quote\]/gmi, "[right][quote]");
      x = x.replace(/\[\/quote\]/gmi, "[/quote][/right]");
      x = x.replace(/\[youtube\]/gmi, "[right][youtube]");
      x = x.replace(/\[\/youtube\]/gmi, "[/youtube][/right]");
      x = x.replace(/<br>/gmi, "[right][/right]");
      x = x.replace(/\[\/right\](.*?)\[right\]/gmi, "[/right][right]$1[/right][right]");
      x = x.replace(/\[right\]\[\/right\]/gmi, "");
      return x;
    });

    bbcode = bbcode.replace(/\[justify\](.*?)\[\/justify\]/gmi, function(x){
      x = x.replace(/\[justify\](.*?)\[\/justify\]/gmi, "$1");
      x = x.replace(/\[h1\]/gmi, "[justify][h1]");
      x = x.replace(/\[\/h1\]/gmi, "[/h1][/justify]");
      x = x.replace(/\[h2\]/gmi, "[justify][h2]");
      x = x.replace(/\[\/h2\]/gmi, "[/h2][/justify]");
      x = x.replace(/\[h3\]/gmi, "[justify][h3]");
      x = x.replace(/\[\/h3\]/gmi, "[/h3][/justify]");
      x = x.replace(/\[h4\]/gmi, "[justify][h4]");
      x = x.replace(/\[\/h4\]/gmi, "[/h4][/justify]");
      x = x.replace(/\[quote\]/gmi, "[justify][quote]");
      x = x.replace(/\[\/quote\]/gmi, "[/quote][/justify]");
      x = x.replace(/\[youtube\]/gmi, "[justify][youtube]");
      x = x.replace(/\[\/youtube\]/gmi, "[/youtube][/justify]");
      x = x.replace(/<br>/gmi, "[justify][/justify]");
      x = x.replace(/\[\/justify\](.*?)\[justify\]/gmi, "[/justify][justify]$1[/justify][justify]");
      x = x.replace(/\[justify\]\[\/justify\]/gmi, "");
      return x;
    });

    bbcode = bbcode.replace(/\[size=1\](.*?)\[\/size\]/gmi, '<span class="ql-size-small">$1</span>');
    bbcode = bbcode.replace(/\[size=2\](.*?)\[\/size\]/gmi, '<span class="ql-size-small">$1</span>');
    bbcode = bbcode.replace(/\[size=3\](.*?)\[\/size\]/gmi, '$1');
    bbcode = bbcode.replace(/\[size=4\](.*?)\[\/size\]/gmi, '<span class="ql-size-large">$1</span>');
    bbcode = bbcode.replace(/\[size=5\](.*?)\[\/size\]/gmi, '<span class="ql-size-large">$1</span>');
    bbcode = bbcode.replace(/\[size=6\](.*?)\[\/size\]/gmi, '<span class="ql-size-huge">$1</span>');
    bbcode = bbcode.replace(/\[size=7\](.*?)\[\/size\]/gmi, '<span class="ql-size-huge">$1</span>');

    bbcode = bbcode.replace(/\[color=(.*?)\](.*?)\[\/color\]/gmi, '<span style="color:$1;">$2</span>');
    bbcode = bbcode.replace(/\[highlight=(.*?)\](.*?)\[\/highlight\]/gmi, '<span style="background-color:$1;">$2</span>');
    bbcode = bbcode.replace(/\[font=(.*?)\](.*?)\[\/font\]/gmi, '<span class="ql-font-$1">$2</span>');

    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h1\]\[indent data=(.*?)\]/gmi, '<h1 class="ql-align-$1 ql-indent-$2">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h2\]\[indent data=(.*?)\]/gmi, '<h2 class="ql-align-$1 ql-indent-$2">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h3\]\[indent data=(.*?)\]/gmi, '<h3 class="ql-align-$1 ql-indent-$2">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h4\]\[indent data=(.*?)\]/gmi, '<h4 class="ql-align-$1 ql-indent-$2">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[blockquote\]\[indent data=(.*?)\]/gmi, '<blockquote class="ql-align-$1 ql-indent-$2">');

    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h1\]/gmi, '<h1 class="ql-align-$1">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h2\]/gmi, '<h1 class="ql-align-$1">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h3\]/gmi, '<h3 class="ql-align-$1">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[h4\]/gmi, '<h4 class="ql-align-$1">');
    bbcode = bbcode.replace(/\[(center|right|justify)\]\[blockquote\]/gmi, '<blockquote class="ql-align-$1">');

    bbcode = bbcode.replace(/\[(center|right|justify)\]\[youtube\](.*?)\[\/youtube\]\[\/(center|right|justify)\]/gi, '<iframe class="ql-video ql-align-$1" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/$2?showinfo=0">');

    bbcode = bbcode.replace(/\[h1\]\[indent data=(.*?)\]/gmi, '<h1 class="ql-indent-$1">');
    bbcode = bbcode.replace(/\[h2\]\[indent data=(.*?)\]/gmi, '<h2 class="ql-indent-$1">');
    bbcode = bbcode.replace(/\[h3\]\[indent data=(.*?)\]/gmi, '<h3 class="ql-indent-$1">');
    bbcode = bbcode.replace(/\[h4\]\[indent data=(.*?)\]/gmi, '<h4 class="ql-indent-$1">');
    bbcode = bbcode.replace(/\[blockquote\]\[indent data=(.*?)\]/gmi, '<blockquote class="ql-indent-$1">');

    bbcode = bbcode.replace(/\[(center|right|justify)\]\[indent data=(.*?)\](.*?)\[\/indent\]\[\/(center|right|justify)\]/gmi, '<p class="ql-align-$1 ql-indent-$2">$3</p>');
    bbcode = bbcode.replace(/\[(center|right|justify)\](.*?)\[\/(center|right|justify)\]/gmi, '<p class="ql-align-$1">$2</p>');
    bbcode = bbcode.replace(/\[indent data=(.*?)\](.*?)\[\/indent\]/gmi, '<p class="ql-indent-$1">$2</p>');

    bbcode = bbcode.replace(/\[b\]/gi, "<strong>");
    bbcode = bbcode.replace(/\[\/b\]/gi, "</strong>");
    bbcode = bbcode.replace(/\[i\]/gi, "<em>");
    bbcode = bbcode.replace(/\[\/i\]/gi, "</em>");
    bbcode = bbcode.replace(/\[u\]/gi, "<u>");
    bbcode = bbcode.replace(/\[\/u\]/gi, "</u>");
    bbcode = bbcode.replace(/\[s\]/gi, "<s>");
    bbcode = bbcode.replace(/\[\/s\]/gi, "</s>");
    bbcode = bbcode.replace(/\[quote\]/gi, "<blockquote>");
    bbcode = bbcode.replace(/\[\/quote\]/gi, "</blockquote>");
    bbcode = bbcode.replace(/\[code\]/gi, "<pre>");
    bbcode = bbcode.replace(/\[\/code\]/gi, "</pre>");
    bbcode = bbcode.replace(/\[sub\]/gi, "<sub>");
    bbcode = bbcode.replace(/\[\/sub\]/gi, "</sub>");
    bbcode = bbcode.replace(/\[sup\]/gi, "<sup>");
    bbcode = bbcode.replace(/\[\/sup\]/gi, "</sup>");
    bbcode = bbcode.replace(/\[h1\]/gi, "<h1>");
    bbcode = bbcode.replace(/\[\/h1\]/gi, "</h1>");
    bbcode = bbcode.replace(/\[h2\]/gi, "<h2>");
    bbcode = bbcode.replace(/\[\/h2\]/gi, "</h2>");
    bbcode = bbcode.replace(/\[h3\]/gi, "<h3>");
    bbcode = bbcode.replace(/\[\/h3\]/gi, "</h3>");
    bbcode = bbcode.replace(/\[h4\]/gi, "<h4>");
    bbcode = bbcode.replace(/\[\/h4\]/gi, "</h4>");
    bbcode = bbcode.replace(/\[\/indent\]/gi, "");
    bbcode = bbcode.replace(/\[\/center\]/gi, "");
    bbcode = bbcode.replace(/\[\/right\]/gi, "");
    bbcode = bbcode.replace(/\[\/justify\]/gi, "");

    bbcode = bbcode.replace(/\[hr\]/gi, "");
    bbcode = bbcode.replace(/\[email(.*?)\]/gi, "");
    bbcode = bbcode.replace(/\[\/email\]/gi, "");
    bbcode = bbcode.replace(/\[left\]/gi, "");
    bbcode = bbcode.replace(/\[\/left\]/gi, "");

    bbcode = bbcode.replace(/\[ml\]\[ol\](.*?)\[\/ol\]\[\/ml\]/gmi, "<ol>$1</ol>");
    bbcode = bbcode.replace(/\[ml\]\[ul\](.*?)\[\/ul\]\[\/ml\]/gmi, "<ul>$1</ul>");
    bbcode = bbcode.replace(/\[ol(.*?)\]/gi, "");
    bbcode = bbcode.replace(/\[\/ol\]/gi, "");
    bbcode = bbcode.replace(/\[ul(.*?)\]/gi, "");
    bbcode = bbcode.replace(/\[\/ul\]/gi, "");
    bbcode = bbcode.replace(/\[li indent=(.*?) align=(.*?)\]/gi, function(x){
      var indent = x.replace(/\[li indent=(.*?) align=(.*?)\]/gi, "$1");
      var alignment = x.replace(/\[li indent=(.*?) align=(.*?)\]/gi, "$2");
      var result = "<li";
      if(indent!='0' || alignment!='left'){
        result += ' class="';
      }
      if(indent!='0'){
        result += 'ql-indent-' + indent;
      }
      if(alignment!='left'){
        result += ' ql-align-' + alignment;
      }
      if(indent!='0' || alignment!='left'){
        result += '"';
      }
      return result + ">";
    });
    bbcode = bbcode.replace(/\[li\]/gi, "<li>");
    bbcode = bbcode.replace(/\[\/li\]/gi, "</li>");

    bbcode = bbcode.replace(/\[img width=(.*?)\](.*?)\[\/img\]/gmi, '<img src="$2" width="$1">');
    bbcode = bbcode.replace(/\[img\](.*?)\[\/img\]/gmi, '<img src="$1">');
    bbcode = bbcode.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank">$2</a>');
    bbcode = bbcode.replace(/\[youtube\](.*?)\[\/youtube\]/gi, '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/$1?showinfo=0">');
    return bbcode;
  }

  // calculates full height of content
  var calculateHeight = function(quill, initial_height, toolbar_height){
    var scrollHeight = $(quill.root)[0].scrollHeight;
    var children = $(quill.root)[0].children;
    var lowestElement = scrollHeight;
    if (children) {
      lowestElement = children[children.length - 1].offsetTop + children[children.length - 1].clientHeight + 10;
    }
    //height never goes below whatever the initial height is set to - intial height = height set in the editor
    if (lowestElement > initial_height - toolbar_height) {
      $(quill.root).parent().css('height', lowestElement + "px");
      return lowestElement + toolbar_height + 10;
    } else {
      return initial_height;
    }
  }


  $(document).ready(() => {
    if (!instance.data.initialized) {
      var id, theme, toolbar, quill;

      //create unique ID in case more than one Rich Text input is added to a page
      id = "richtext-editor-" + $('.ql-container').length;
      //Quill.js themes

      let Font = Quill.import('formats/font');
      Font.whitelist = all_fonts; //['sans-serif', 'serif', 'monospace','mirza', 'roboto'];
      var icons = Quill.import('ui/icons');

      var icon_h1 = `
<svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="h3" fill="currentColor">
            <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.42,8.63 C11.3266662,8.7033337 11.2283339,8.7133336 11.125,8.66 C11.0216661,8.6066664 10.97,8.5200006 10.97,8.4 L10.97,7.67 C10.97,7.2899981 11.1233318,6.9900011 11.43,6.77 L12.44,6.03 C12.7400015,5.8099989 13.0833314,5.7 13.47,5.7 L14.1,5.7 C14.2533341,5.7 14.3866661,5.7566661 14.5,5.87 C14.6133339,5.9833339 14.67,6.1166659 14.67,6.27 L14.67,12.43 C14.67,12.5833341 14.6133339,12.7166661 14.5,12.83 C14.3866661,12.9433339 14.2533341,13 14.1,13 L13.47,13 C13.3166659,13 13.1833339,12.9433339 13.07,12.83 C12.9566661,12.7166661 12.9,12.5833341 12.9,12.43 L12.9,7.57 L12.88,7.57 L11.42,8.63 Z" id="Shape" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;

      var icon_h2 = `
            <svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="h3" fill="currentColor">
                        <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.35,13 C11.1966659,13 11.0633339,12.9433339 10.95,12.83 C10.8366661,12.7166661 10.78,12.5833341 10.78,12.43 L10.78,12.2 C10.78,11.8266648 10.9299985,11.5233345 11.23,11.29 C12.3500056,10.4099956 13.0916649,9.7400023 13.455,9.28 C13.8183351,8.8199977 14,8.3700022 14,7.93 C14,7.3166636 13.6600034,7.01 12.98,7.01 C12.5666646,7.01 12.060003,7.1233322 11.46,7.35 C11.3333327,7.3966669 11.2133339,7.3833337 11.1,7.31 C10.9866661,7.2366663 10.93,7.133334 10.93,7 L10.93,6.58 C10.93,6.4066658 10.9799995,6.25166735 11.08,6.115 C11.1800005,5.97833265 11.3133325,5.8866669 11.48,5.84 C12.0866697,5.6799992 12.6699972,5.6 13.23,5.6 C14.0366707,5.6 14.6583312,5.79166475 15.095,6.175 C15.5316688,6.55833525 15.75,7.0899966 15.75,7.77 C15.75,8.3566696 15.5650018,8.91499735 15.195,9.445 C14.8249981,9.97500265 14.1033387,10.6933288 13.03,11.6 C13.0233333,11.6066667 13.02,11.6133333 13.02,11.62 C13.02,11.6266667 13.0233333,11.63 13.03,11.63 L15.22,11.63 C15.3733341,11.63 15.5049995,11.6866661 15.615,11.8 C15.7250006,11.9133339 15.78,12.0466659 15.78,12.2 L15.78,12.43 C15.78,12.5833341 15.7250006,12.7166661 15.615,12.83 C15.5049995,12.9433339 15.3733341,13 15.22,13 L11.35,13 Z" id="Shape" fill-rule="nonzero"></path>
                    </g>
                </g>
            </svg>`;


      var icon_h3 = `
            <svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="h3" fill="currentColor">
                        <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.32,7.07 C11.1666659,7.07 11.0333339,7.0133339 10.92,6.9 C10.8066661,6.7866661 10.75,6.6533341 10.75,6.5 L10.75,6.27 C10.75,6.1166659 10.8066661,5.9833339 10.92,5.87 C11.0333339,5.7566661 11.1666659,5.7 11.32,5.7 L15.05,5.7 C15.2033341,5.7 15.3366661,5.7566661 15.45,5.87 C15.5633339,5.9833339 15.62,6.1166659 15.62,6.27 L15.62,6.5 C15.62,6.8800019 15.4733348,7.1899988 15.18,7.43 L13.67,8.68 L13.67,8.69 C13.67,8.6966667 13.6733333,8.7 13.68,8.7 L13.8,8.7 C14.3800029,8.7 14.8449983,8.8799982 15.195,9.24 C15.5450018,9.6000018 15.72,10.0866636 15.72,10.7 C15.72,11.4733372 15.4833357,12.0666646 15.01,12.48 C14.5366643,12.8933354 13.8566711,13.1 12.97,13.1 C12.436664,13.1 11.8966694,13.0366673 11.35,12.91 C11.1899992,12.8699998 11.0583339,12.7816674 10.955,12.645 C10.8516662,12.5083327 10.8,12.3533342 10.8,12.18 L10.8,11.84 C10.8,11.706666 10.8549995,11.6016671 10.965,11.525 C11.0750006,11.448333 11.196666,11.4299998 11.33,11.47 C11.9033362,11.6566676 12.4033312,11.75 12.83,11.75 C13.2166686,11.75 13.5166656,11.6600009 13.73,11.48 C13.9433344,11.2999991 14.05,11.0500016 14.05,10.73 C14.05,10.4033317 13.9266679,10.173334 13.68,10.04 C13.4333321,9.906666 12.9733367,9.8366667 12.3,9.83 C12.1466659,9.83 12.0133339,9.77500055 11.9,9.665 C11.7866661,9.55499945 11.73,9.4233341 11.73,9.27 L11.73,9.25 C11.73,8.8766648 11.8733319,8.5666679 12.16,8.32 L13.58,7.09 L13.58,7.08 C13.58,7.0733333 13.5766667,7.07 13.57,7.07 L11.32,7.07 Z" id="Shape" fill-rule="nonzero"></path>
                    </g>
                </g>
            </svg>`;

      var icon_h4 = `
            <svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="h3" fill="currentColor">
                        <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.62,10.25 L11.62,10.26 C11.62,10.2666667 11.6233333,10.27 11.63,10.27 L13.28,10.27 C13.3400003,10.27 13.37,10.2433336 13.37,10.19 L13.37,7.77 C13.37,7.7633333 13.3666667,7.76 13.36,7.76 C13.3466666,7.76 13.34,7.7633333 13.34,7.77 L11.62,10.25 Z M10.68,11.6 C10.5266659,11.6 10.3950005,11.5433339 10.285,11.43 C10.1749995,11.3166661 10.12,11.1833341 10.12,11.03 L10.12,10.84 C10.12,10.4666648 10.2299989,10.1233349 10.45,9.81 L13.04,6.16 C13.2600011,5.8533318 13.5566648,5.7 13.93,5.7 L14.43,5.7 C14.5833341,5.7 14.7149994,5.7566661 14.825,5.87 C14.9350006,5.9833339 14.99,6.1166659 14.99,6.27 L14.99,10.19 C14.99,10.2433336 15.0199997,10.27 15.08,10.27 L15.48,10.27 C15.6333341,10.27 15.7666661,10.3266661 15.88,10.44 C15.9933339,10.5533339 16.05,10.6866659 16.05,10.84 L16.05,11.03 C16.05,11.1833341 15.9933339,11.3166661 15.88,11.43 C15.7666661,11.5433339 15.6333341,11.6 15.48,11.6 L15.08,11.6 C15.0199997,11.6 14.99,11.6299997 14.99,11.69 L14.99,12.43 C14.99,12.5833341 14.9350006,12.7166661 14.825,12.83 C14.7149994,12.9433339 14.5833341,13 14.43,13 L13.93,13 C13.7766659,13 13.6450005,12.9433339 13.535,12.83 C13.4249995,12.7166661 13.37,12.5833341 13.37,12.43 L13.37,11.69 C13.37,11.6299997 13.3400003,11.6 13.28,11.6 L10.68,11.6 Z" id="Shape" fill-rule="nonzero"></path>
                    </g>
                </g>
            </svg>`;

      icons.header[1] = icon_h1;
      icons.header[2] = icon_h2;
      icons.header[3] = icon_h3;
      icons.header[4] = icon_h4;


      Quill.register(Font, true);

      if (properties.theme === 'Regular') {
        theme = 'snow';
      } else {
        theme = 'bubble';
      }

      //Initialize toolbar based on desired complexity
      if (properties.complexity === "Basic") {
        toolbar = [[ 'bold', 'italic', 'link'], [{ 'align': [] },{ 'header': '1' }, { 'header': '2' }]];
      } else if (properties.complexity === "Medium") {
        toolbar = [[{ 'font': all_fonts }], [ 'bold', 'italic', 'underline', 'strike' ], [{ 'color': [] }, { 'background': [] }], [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' },{ 'header': '4' }], [{ 'list': 'ordered' }, { 'list': 'bullet'}], [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }, 'link']];
      } else {
        toolbar = [[{ 'font': all_fonts }, { 'size': [] }], [ 'bold', 'italic', 'underline', 'strike' ], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'super' }, { 'script': 'sub' }], [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' },{ 'header': '4' }, 'blockquote', 'code-block' ], [{ 'list': 'ordered' }, { 'list': 'bullet'}], [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }], [ 'link', 'image', 'video'], [ 'clean' ]];
      }

      //add Quill container div to page
      instance.canvas.append(`<div id="${id}"></div>`);
      //initialize Quill
      quill = new Quill('#'+id, {
        theme: theme,
        bounds: '#'+id,
        modules: {
          imageResize: {
            modules: [ 'Resize', 'DisplaySize']
          },
          toolbar: toolbar,
          clipboard: {}
        },
        placeholder: properties.placeholder
      });
      var quill_element = $(`#${id}`)
      quill_element.css('border','none');

      if (properties.bubble.border_style !== "none" && theme === "snow") {
        quill_element.siblings('.ql-toolbar').css({
          border: 'none',
          'border-bottom': '1px solid #ccc'
        });
      }

      //adjust height of the Quill editor if a toolbar exists so that it doesn't overflow from the Bubble element
      instance.data.toolbar_height = 0;
      var bubble_height = properties.bubble.height;

      if (properties.theme === "Regular") {
        var toolbar_height = Number($('#'+id).siblings('.ql-toolbar').css('height').replace(/px/gmi, "")) - 10;
        instance.data.toolbar_height = toolbar_height;
        if(!properties.overflow){
          bubble_height = bubble_height - 15;
        }
        $(quill.root).parent().css('height', (bubble_height - toolbar_height) + "px");
        $('.ql-header').addClass('regular-header-icon');
      } else {
        $('.ql-header').addClass('tooltip-header-icon');
      }

      //add tooltips to icons for clarity
      $('.ql-bold').attr('title', 'Bold');
      $('.ql-italic').attr('title', 'Italic');
      $('.ql-underline').attr('title', 'Underline');
      $('.ql-header[value="1"]').attr('title', "Title");
      $('.ql-header[value="2"]').attr('title', "Subtitle");
      $('.ql-align').attr('title', 'Text alignment');
      if (['Full', 'Medium'].includes(properties.complexity)) {
        $('.ql-header[value="3"]').attr('title', "Subtitle");
        $('.ql-header[value="4"]').attr('title', "Subtitle");
        $('.ql-strike').attr('title', 'Strikethrough');
        $('.ql-color').attr('title', 'Font color');
        $('.ql-background').attr('title', 'Highlight color');
        $('.ql-font').attr('title', 'Font');
        $('.ql-list[value="ordered"]').attr('title', "Numbered list");
        $('.ql-list[value="bullet"]').attr('title', "Bulleted list");
        $('.ql-indent[value="+1"]').attr('title', "Indent");
        $('.ql-indent[value="-1"]').attr('title', "Remove indent");
        $('.ql-link').attr('title', 'Link');
      }
      if (properties.complexity==='Full') {
        $('.ql-size').attr('title', 'Font size');
        $('.ql-script[value="super"]').attr('title', "Superscript");
        $('.ql-script[value="sub"]').attr('title', "Subscript");
        $('.ql-blockquote').attr('title', 'Quote');
        $('.ql-code-block').attr('title', 'Code');
        $('.ql-image').attr('title', 'Image');
        $('.ql-video').attr('title', 'Video');
        $('.ql-clean').attr('title', 'Remove all formatting');
      }

      $('.ql-font .ql-picker-options').css({ height:'250px', overflow: 'scroll'});

      //correctly format font dropdown w/ custom font styles
      $('.ql-font .ql-picker-options .ql-picker-item').each((index, element) => {
        var font_type = $(element).data('value');
        var font_spaces = font_type.split('-');
        for(var i = 0; i < font_spaces.length; i += 1) {
          font_spaces[i] = font_spaces[i].charAt(0).toUpperCase() + font_spaces[i].slice(1);
        }
        font_type = font_spaces.join(' ');
        $(element).attr('data-label', font_type);
      });

      //initialize helpful variables for later on:
      instance.data.quill = quill;
      instance.data.id = id;
      instance.data.initial_content_loaded = false;
      instance.data.image_storage = {};
      instance.data.initial_height = bubble_height;

      //save element properties to instance for use in reset function
      instance.data.overflow = properties.overflow;
      instance.data.theme = properties.theme;

      //sets placeholder for link input to https://bubble.io/
      var tooltip = quill.theme.tooltip;
      var input = tooltip.root.querySelector("input[data-link]");
      input.dataset.link = properties.link_placeholder;
      instance.data.initialized = true;

      if (instance.data.should_focus) {
        quill.focus();
      }
    }

    //disable Quill input if this element is disabled
    instance.data.quill.enable(!properties.disabled);


    var content_change_handler = (bbcode) => {
      instance.data.should_rerun_val = false;

      instance.publishAutobinding(bbcode);
      instance.publishState("value", bbcode);

      if(!instance.data.change_event_should_trigger) {
        instance.data.change_event_should_trigger = true;
      } else {
        instance.triggerEvent('value_changes', function(err){
          if (err) {
            console.error("Rich text event error - please report to admin: " + JSON.stringify(err));
          }
        });
      }

      //checks if input is valid -> will not be valid if the input is empty and the user has checked "this input should not be empty"
      var value_is_valid = (!!properties.empty && checkForContent(quill.root.innerHTML) === '');
      instance.publishState("value_is_valid", value_is_valid);
    }

    //loads initial content if initial content property is set - handles height change if expected behavior is for element to extend if there is overflow
    if (!instance.data.initial_content_loaded) {
      quill = instance.data.quill;
      if (properties.initial_content) {
        if (instance.data.current_bbcode !== properties.initial_content) {
          var initial_html = bbCodeToHTML(properties.initial_content);
          var current_selection = quill.getSelection()
          var scrollTop = window.scrollY
          var scrollLeft = window.scrollX
          $(quill.root).html("");
          // Pasting the contents programmatically focuses the editor and sets
          // the cursor to the end, which breaks autobinding and is weird UX,
          // so restoring initial selection below
          quill.clipboard.dangerouslyPasteHTML(0, initial_html);
          quill.setSelection(current_selection)
          // prevent paste-induced focus from autoscrolling to this position
          window.scrollTo(scrollLeft, scrollTop)
        }
        if(properties.overflow && !properties.initial_content.includes('[/img]')){
          instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));
        }
        $(quill.root).find('img').load(() => {
          if (properties.overflow){
            instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));
          }
        });
      } else {
        $(quill.root).html("");
      }
      //handle state and autobinding for initial content
      content_change_handler(properties.initial_content);
      //prevents the same initial content from loading more than once
      instance.data.initial_content_loaded = true;
      //initialize flag to see if html should actually be translated to bbcode later on
      instance.data.should_rerun_val = false;
    }

    //hides image resize module outline if any formatting buttons are pressed
    $('.ql-formats').on('click', () => {
      $(`#${instance.data.id}`).children().eq(3).hide();
    });

    quill = instance.data.quill;

    //handles text changes and blur events
    var set_val = () => {
      $.when(htmlToBBCode(quill.root.innerHTML)).done((html_to_bbcode) => {
        instance.data.current_bbcode = html_to_bbcode
        content_change_handler(html_to_bbcode);
      });
    }

    //timer for saving value state once user stops typing
    //useful so that htmlToBBCode doesn't have to run every single time a letter is typed - also runs on blur
    var typingTimer;
    var doneTypingInterval = 2200;
    var doneTyping = function(){
      if (instance.data.should_rerun_val && properties.autosave) {
        set_val();
      }

    }

    //bind on/off focus events
    var rte_canvas = $(`#${instance.data.id}`).children()[0];
    rte_canvas.onfocus = () => {
      instance.publishState("field_is_focused", true);
    }

    rte_canvas.onblur = () => {
      instance.publishState("field_is_focused", false);
      clearTimeout(typingTimer);
      if (instance.data.should_rerun_val) {
        set_val();
      }
    }

    $('.ql-toolbar').mousedown(e => e.preventDefault());



    //actions to be run whenever the Quill text is changed
    quill.on('text-change', function(delta, oldDelta, source) {
      instance.data.should_rerun_val = true;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(doneTyping, doneTypingInterval);

      $(quill.root).find('img').load(() => {
        if (properties.overflow){
          instance.setHeight(calculateHeight(quill, instance.data.initial_height, instance.data.toolbar_height));
        }
      });

      var rawhtml = quill.root.innerHTML;
      $(quill.root).find('img').each((index, element) => {
        $(element).data('width', $(element).css('width'));
      });

      var base64ImageRegex = /<img[^>]* src="data:image\/(.*?)"(.*?)>/gi;
      var matches = rawhtml.match(base64ImageRegex) || [];
        
      var img_change = false;
      if (matches.length !== instance.data.img_tracker) {
        img_change = true;
        instance.data.img_tracker = matches.length;
      }

      // handles images -> base64 images cannot be loaded in our text elements,
      // so this functionality identifies base64 files and uploads them to our S3 bucket and replaces the src value with the S3 url
      var supportedFileExtensions = {
        jpg: true,
        jpeg: true,
        png: true,
      }
      var replace_base_64 = (file_extension, source) =>
        context.uploadContent(`richtext_content.${file_extension}`, source, (err, url) => {
          var upload_width = $(quill.root).find(`img[src="data:image/${file_extension};base64,${source}"]`).css('width') || "";
          $(quill.root)
            .find(`img[src="data:image/${file_extension};base64,${source}"]`)
            .attr({'src': url, 'width': upload_width});
        });
      var fullMatch = base64ImageRegex.exec(rawhtml);
      var encoding, base64source;
      while (img_change && fullMatch) {
        [encoding, base64source] = fullMatch[1].split(',') || [];
        var file_extension = (encoding || '').split(';')[0]

        if (supportedFileExtensions[file_extension]) {
          replace_base_64(file_extension, base64source);
        }
        fullMatch = base64ImageRegex.exec(rawhtml);
      }

      //handles height of element in the same way as described above - only applies if the element is supposed to extend, an option available in properties
      if (!!properties.overflow){
        instance.setHeight(calculateHeight(quill, instance.data.initial_height, instance.data.toolbar_height));
      }

    });
  });
}