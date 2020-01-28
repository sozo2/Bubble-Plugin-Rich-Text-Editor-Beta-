function(instance, properties, context) {
        
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
        html = html.replace(/<blockquote(.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/blockquote>/gmi, '[$3]<blockquote$1class="$2$4"$5>$6</blockquote>[/$3]');
        html = html.replace(/<p (.*?)class="(.*?)ql-align-(right|center|justify)(.*?)"(.*?)>(.*?)<\/p>/gmi, '[$3]<p $1class="$2$4"$5>$6</p>[/$3]');
        html = html.replace(/<iframe class="ql-video ql-align-(right|center|justify)" frameborder="0" allowfullscreen="true" src="(.*?)"><\/iframe>/gmi, '[$1]<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="$2"></iframe>[/$1]');
        html = html.replace(/<h1(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h1>/gmi, '<h1$1class="$2$4"$5>[indent data=$3]$6[/indent]</h1>');
        html = html.replace(/<h2(.*?)class="(.*?)ql-indent-([0-9])(.*?)"(.*?)>(.*?)<\/h2>/gmi, '<h2$1class="$2$4"$5>[indent data=$3]$6[/indent]</h2>');
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
        
        html = html.replace(/http:\//gi, "http://");
        html = html.replace(/https:\//gi, "https://");
                
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
        bbcode = bbcode.replace(/\[size=4\](.*?)\[\/size\]/gmi, '<span class="ql-size-large">$1</span>');
        bbcode = bbcode.replace(/\[size=6\](.*?)\[\/size\]/gmi, '<span class="ql-size-huge">$1</span>');
        bbcode = bbcode.replace(/\[color=(.*?)\](.*?)\[\/color\]/gmi, '<span style="color:$1;">$2</span>');
        bbcode = bbcode.replace(/\[highlight=(.*?)\](.*?)\[\/highlight\]/gmi, '<span style="background-color:$1;">$2</span>');
        bbcode = bbcode.replace(/\[font=(.*?)\](.*?)\[\/font\]/gmi, '<span class="ql-font-$1">$2</span>');
               
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[h1\]\[indent data=(.*?)\]/gmi, '<h1 class="ql-align-$1 ql-indent-$2">');
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[h2\]\[indent data=(.*?)\]/gmi, '<h2 class="ql-align-$1 ql-indent-$2">');
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[blockquote\]\[indent data=(.*?)\]/gmi, '<blockquote class="ql-align-$1 ql-indent-$2">');

        bbcode = bbcode.replace(/\[(center|right|justify)\]\[h1\]/gmi, '<h1 class="ql-align-$1">');
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[h2\]/gmi, '<h1 class="ql-align-$1">');
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[blockquote\]/gmi, '<blockquote class="ql-align-$1">');
        
        bbcode = bbcode.replace(/\[(center|right|justify)\]\[youtube\](.*?)\[\/youtube\]\[\/(center|right|justify)\]/gi, '<iframe class="ql-video ql-align-$1" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/$2?showinfo=0">'); 

        bbcode = bbcode.replace(/\[h1\]\[indent data=(.*?)\]/gmi, '<h1 class="ql-indent-$1">');
        bbcode = bbcode.replace(/\[h2\]\[indent data=(.*?)\]/gmi, '<h2 class="ql-indent-$1">');
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
        bbcode = bbcode.replace(/\[\/indent\]/gi, "");
        bbcode = bbcode.replace(/\[\/center\]/gi, "");
        bbcode = bbcode.replace(/\[\/right\]/gi, "");
        bbcode = bbcode.replace(/\[\/justify\]/gi, "");

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
    
    instance.data.initial_content = properties.initial_content;   
    if(properties.initial_content) {
        instance.data.initial_html = bbCodeToHTML(properties.initial_content);   
    } 
    
    $(document).ready(function(){
        
        if(instance.data.initialized==false){
            var id, theme, toolbar, quill;

            //create unique ID in case more than one Rich Text input is added to a page 
            id = "richtext-editor-" + $('.ql-container').length;
            //Quill.js themes 
            if(properties.theme=="Regular"){
                theme = "snow";
            } else {
                theme = "bubble";
            }

            //Initialize toolbar based on desired complexity 
            if(properties.complexity=="Basic"){
                toolbar = [[ 'bold', 'italic', 'link'], [{ 'align': [] },{ 'header': '1' }, { 'header': '2' }]];
            } else {
                toolbar = [[{ 'font': [] }, { 'size': [] }], [ 'bold', 'italic', 'underline', 'strike' ], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'super' }, { 'script': 'sub' }], [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ], [{ 'list': 'ordered' }, { 'list': 'bullet'}], [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }], [ 'link', 'image', 'video'], [ 'clean' ]];
            }

            //add Quill container div to page 
            instance.canvas.append("<div id='"+id+"'></div>");
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
			$('#'+id).css('border','none');
            if(properties.bubble.border_style != "none" && theme == "snow"){
            	$('#'+id).siblings('.ql-toolbar').css('border', 'none');
                $('#'+id).siblings('.ql-toolbar').css('border-bottom', '1px solid #ccc');   
            }
            //adjust height of the Quill editor if a toolbar exists so that it doesn't overflow from the Bubble element 
            instance.data.toolbar_height = 0;
            if(properties.theme=="Regular"){
                var toolbar_height = Number($('#'+id).siblings('.ql-toolbar').css('height').replace(/px/gmi, "")) - 10;
                instance.data.toolbar_height = toolbar_height;
                var bubble_height = properties.bubble.height;
                $(quill.root).parent().css('height', (bubble_height - toolbar_height) + "px");
            }
            //add tooltips to icons for clarity
            $('.ql-bold').attr('title', 'Bold');
            $('.ql-italic').attr('title', 'Italic');
            $('.ql-underline').attr('title', 'Underline');
            $('.ql-header[value="1"]').attr('title', "Title");
            $('.ql-header[value="2"]').attr('title', "Subtitle");
            $('.ql-align').attr('title', 'Text alignment');
            if(properties.complexity=='Full'){
                $('.ql-strike').attr('title', 'Strikethrough');
                $('.ql-color').attr('title', 'Font color');
                $('.ql-background').attr('title', 'Highlight color');
                $('.ql-font').attr('title', 'Font');
                $('.ql-size').attr('title', 'Font size');
                $('.ql-script[value="super"]').attr('title', "Superscript");
                $('.ql-script[value="sub"]').attr('title', "Subscript");
                $('.ql-blockquote').attr('title', 'Quote');
                $('.ql-code-block').attr('title', 'Code');
                $('.ql-list[value="ordered"]').attr('title', "Numbered list");
                $('.ql-list[value="bullet"]').attr('title', "Bulleted list");
                $('.ql-indent[value="+1"]').attr('title', "Indent");
                $('.ql-indent[value="-1"]').attr('title', "Remove indent");
                $('.ql-link').attr('title', 'Link');
                $('.ql-image').attr('title', 'Image');
                $('.ql-video').attr('title', 'Video');
                $('.ql-clean').attr('title', 'Remove all formatting');
            }
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
            input.dataset.link = "https://bubble.io/";
            instance.data.initialized = true;
        }

        //disable Quill input if this element is disabled 
        if(properties.disabled){
            quill.enable(false);
        }
             
        //loads initial content if initial content property is set - handles height change if expected behavior is for element to extend if there is overflow 
        if (instance.data.initial_content_loaded == false){
            if(properties.initial_content){
                var initial_html = bbCodeToHTML(properties.initial_content);
                quill.clipboard.dangerouslyPasteHTML(0, initial_html);
                if(properties.overflow && !properties.initial_content.includes('[/img]')){
                    instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));   
                }
                $(quill.root).find('img').load(function(){
                    if (properties.overflow){
                        instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));   
                    }
                });
            }
            //prevents initial content from loading more than once 
            instance.data.initial_content_loaded = true;
            //instance.publishState("value", properties.initial_content);
            
            //bind on/off focus events 
            document.getElementById(id).firstChild.onfocus = () => {
                instance.publishState("field_is_focused", true);
            }
            document.getElementById(id).firstChild.onblur = () => {
                instance.publishState("field_is_focused", false);
                //publishes value for autobinding on blur 
                instance.publishAutobinding(htmlToBBCode(quill.root.innerHTML));
                var html_to_bbcode = htmlToBBCode(quill.root.innerHTML);
                //set Rich Text Editor value to bbcode representation of Quill html 
                instance.publishState("value", html_to_bbcode);
                //checks if input is valid -> will not be valid if the input is empty and the user has checked "this input should not be empty" 
                if(properties.empty==true && checkForContent(quill.root.innerHTML)==""){
                    instance.publishState("value_is_valid", false);
                } else {
                    instance.publishState("value_is_valid", true);
                }
            }
        }  
    
        var quill = instance.data.quill;
        
        //hides image resize module outline if any formatting buttons are pressed 
        $('.ql-formats').on('click', function(){
            if($('#'+instance.data.id).children().length==4){
                $('#'+instance.data.id).children().eq(3).hide();
            }
        });

        //timer for saving value state once user stops typing 
        //useful so that htmlToBBCode doesn't have to run every single time a letter is typed - also runs on blur 
        var typingTimer;
        var doneTypingInterval = 2000;
        var doneTyping = function(){
            var html_to_bbcode = htmlToBBCode(quill.root.innerHTML);
            //set Rich Text Editor value to bbcode representation of Quill html 
            instance.publishState("value", html_to_bbcode);
            instance.triggerEvent('value_changes', function(err){
                context.reportToDebugger("Rich text event error - please report to admin");
            });
            //checks if input is valid -> will not be valid if the input is empty and the user has checked "this input should not be empty" 
                if(properties.empty==true && checkForContent(quill.root.innerHTML)==""){
                instance.publishState("value_is_valid", false);
            } else {
                instance.publishState("value_is_valid", true);
            }
        }
        
        //actions to be run whenever the Quill text is changed  
        quill.on('text-change', function(delta, oldDelta, source) { 
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTyping, doneTypingInterval);

            var rawhtml = quill.root.innerHTML;
            $(quill.root).find('img').each(function(x){
                var width = $(this).css('width');
                $(this).data('width', width);
            });

            var matches = rawhtml.match(/<img[^>]* src="data:image\/(.*?)"(.*?)>/gi);
            if (matches==null){
                matches = []
            }
            var img_change = false;
            if(matches.length!=instance.data.img_tracker){
                img_change = true;
                instance.data.img_tracker = matches.length;  
            }

            //handles images -> base64 images cannot be loaded in our text elements, so this functionality identifies base64 files and uploads them to our S3 bucket and replaces the src value with the S3 url 
            for(var i=0; i<matches.length; i+=1){
                if(matches[i].includes("data:image/jpeg;base64")&&img_change){
                    matches[i] = matches[i].replace(/<img(.*?)src="(.*?)"(.*?)>/gi, "$2");
                    var base64 = matches[i].split(",").pop();
                    matches[i] = 'upload complete';
                    context.uploadContent("richtext_content.jpeg", base64, function(err, url) {
                        $(quill.root).find('img[src="data:image/jpeg;base64,'+ base64 +'"]').attr('src', url);
                    });
                }
                if(matches[i].includes("data:image/jpg;base64")){
                    matches[i] = matches[i].replace(/<img(.*?)src="(.*?)"(.*?)>/gi, "$2");
                    var base64 = matches[i].split(",").pop();
                    matches[i] = 'upload complete';
                    context.uploadContent("richtext_content.jpg", base64, function(err, url) {
                        $(quill.root).find('img[src="data:image/jpg;base64,'+ base64 +'"]').attr('src', url);
                    });
                }
                if(matches[i].includes("data:image/png;base64")){
                    matches[i] = matches[i].replace(/<img(.*?)src="(.*?)"(.*?)>/gi, "$2");
                    var base64 = matches[i].split(",").pop();
                    matches[i] = 'upload complete';
                    context.uploadContent("richtext_content.png", base64, function(err, url) {
                        $(quill.root).find('img[src="data:image/png;base64,'+ base64 +'"]').attr('src', url);
                    });
                }     
            }

            //handles height of element in the same way as described above - only applies if the element is supposed to extend, an option available in properties 
            if (properties.overflow==true){
                instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));
            }

        });
    });
}