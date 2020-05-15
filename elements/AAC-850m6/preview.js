function(instance, properties) {

    //custom preview that changes as various properties are changed
    //uses images rather than initializing a disabled Quill instance because the images are lighter weight and makes loading the element more efficient in the editor 
    
    var preview;
    var preview_images = {
        "basic_styles": "//dd7tel2830j4w.cloudfront.net/f1578328422624x814410333288381700/basic_styles.png",
        "basic_text_alignment": "//dd7tel2830j4w.cloudfront.net/f1578328435036x176083124177772740/basic_align.png",
        "font": "//dd7tel2830j4w.cloudfront.net/f1578328456820x636678729904445200/font.png",
        "size": "//dd7tel2830j4w.cloudfront.net/f1578328471900x601277843539461200/size.png",
        "text_styles": "//dd7tel2830j4w.cloudfront.net/f1578328500984x237729254917328450/text_styles.png",
        "text_color": "//dd7tel2830j4w.cloudfront.net/f1578526040133x618924377176704400/text_color.png",
        "sup_sub": "//dd7tel2830j4w.cloudfront.net/f1578328553500x547904523073018600/sup_sub.png",
        "titles_quote_code": "//dd7tel2830j4w.cloudfront.net/f1578328573740x193466729817275650/titles_quote_code.png",
        "media": "//dd7tel2830j4w.cloudfront.net/f1578328690820x732983396842500400/media.png",
        "remove_style": "//dd7tel2830j4w.cloudfront.net/f1578328704608x655581645962726700/remove_style.png",
        "list": "//dd7tel2830j4w.cloudfront.net/f1580145133799x948312827511517800/list.png",
        "indent_align": "//dd7tel2830j4w.cloudfront.net/f1580145152691x503666194763457100/indent_align.png",
        "all_titles": "//dd7tel2830j4w.cloudfront.net/f1585641019238x597655811909080000/all%20titles.png",
        "code_quotes": "//dd7tel2830j4w.cloudfront.net/f1585641079062x980676637005123800/code%20quotes.png",
        "medium_format": "//dd7tel2830j4w.cloudfront.net/f1585641062978x592964815466108240/medium%20formats.png"
    };
    
    
    if(properties.theme == "Regular"){
        var toolbar = "<div><div style='background-color:white;'>";
        if(properties.complexity == "Full"){
            toolbar += "<img src='"+ preview_images["font"] +"'>";
            toolbar += "<img src='"+ preview_images["size"] +"'>";
            toolbar += "<img src='"+ preview_images["text_styles"] +"'>";
            toolbar += "<img src='"+ preview_images["text_color"] +"'>";
            toolbar += "<img src='"+ preview_images["sup_sub"] +"'>";
            toolbar += "<img src='"+ preview_images["all_titles"] +"'>";
            toolbar += "<img src='"+ preview_images["code_quotes"] +"'>";
            toolbar += "<img src='"+ preview_images["list"] +"'>";
            toolbar += "<img src='"+ preview_images["indent_align"] +"'>";
            toolbar += "<img src='"+ preview_images["media"] +"'>";
            toolbar += "<img src='"+ preview_images["remove_style"] +"'>";
        } else if(properties.complexity == "Medium"){
            toolbar += "<img src='"+ preview_images["font"] +"'>";
            toolbar += "<img src='"+ preview_images["text_styles"] +"'>";
            toolbar += "<img src='"+ preview_images["text_color"] +"'>";
            toolbar += "<img src='"+ preview_images["all_titles"] +"'>";
            toolbar += "<img src='"+ preview_images["list"] +"'>";
            toolbar += "<img src='"+ preview_images["medium_format"] +"'>";
        } else {
            toolbar += "<img src='"+ preview_images["basic_styles"] +"'>";
            toolbar += "<img src='"+ preview_images["basic_text_alignment"] +"'>";
        }
        toolbar += "</div>";
        if(properties.initial_content && properties.initial_content!=""){
            toolbar += "<span style='margin:15px;font-family:sans-serif;font-size:13px;line-height:40px;'>" + properties.initial_content + "</span>";
        } else {
            if(properties.placeholder){
                toolbar += "<span style='font-style:italic;margin:15px;font-family:sans-serif;color:#737373;font-size:13px;line-height:40px;'>" + properties.placeholder + "</span>";
            }
        }
        toolbar += "</div>";
        preview = $(toolbar);
    } else {
		var editor = "<div>";
        if(properties.initial_content && properties.initial_content!=""){
            editor += "<span style='margin:15px;font-family:sans-serif;font-size:13px;line-height:40px;'>" + properties.initial_content + "</span>";
        } else {
            if(properties.placeholder){
                editor += "<span style='font-style:italic;margin:15px;font-family:sans-serif;color:#737373;font-size:13px;line-height:40px;'>" + properties.placeholder + "</span>";
            }
        }
        editor += "</div>";
        preview = $(editor);
    }

    preview.css("height", (properties.bubble.height - 2) + "px");
    if(properties.bubble.border_style=='none'){
        preview.children('div').css("border", "1px solid #cbcbcb");  
    } else {
        preview.children('div').css("border-bottom", "1px solid #cbcbcb");
    }
    preview.children('div').css("padding-right", "10px");
    preview.children('div').children('img').css("height", "38px");
	
    instance.canvas.append(preview);
    
}