function(instance, properties, context) {
    //calculate height if extend on overflow is checked 
    function calculateHeight(quill, initial_height, toolbar_height){
        var scrollHeight = $(quill.root)[0].scrollHeight;
        var children = $(quill.root)[0].children;
        var lowestElement = scrollHeight;
        if (children) {
            lowestElement = children[children.length - 1].offsetTop + children[children.length - 1].clientHeight + 10;
        }
        if (lowestElement > instance.data.initial_height - toolbar_height) {
            $(quill.root).parent().css('height', lowestElement + "px"); 
        }
        return lowestElement + toolbar_height;
    }
    
	var quill = instance.data.quill;
    // reset to initial content if initial content exists 
    if(instance.data.initial_content){
        $(quill.root).html("");
        quill.clipboard.dangerouslyPasteHTML(0, instance.data.initial_html);
        instance.publishState("value", instance.data.initial_content);
        if(properties.overflow && !properties.initial_content.includes('[/img]')){
            instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));   
        }
        $(quill.root).find('img').load(function(){
            if (properties.overflow){
                instance.setHeight(calculateHeight(quill,instance.data.initial_height, instance.data.toolbar_height));   
            }
        });

    } else {
    	$(quill.root).html("");
    	instance.publishState("value", "");
        instance.setHeight(instance.data.initial_height);
    }
}