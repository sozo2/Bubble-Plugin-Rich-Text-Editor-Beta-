function(instance, properties, context) {
	if(!instance.data.quill){
        return;
    }
	var quill = instance.data.quill;
    // reset to initial content if initial content exists 
    if(instance.data.initial_content){
        $(quill.root).html("");
        quill.clipboard.dangerouslyPasteHTML(0, instance.data.initial_html);
        instance.publishState("value", instance.data.initial_content);

    } else {
    	$(quill.root).html("");
    	instance.publishState("value", "");
    }
}