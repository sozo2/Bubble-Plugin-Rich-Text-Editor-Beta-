function(instance, context) {
	if(!instance.data.quill){
        return;
    }
	var quill = instance.data.quill;
    // reset to initial content if initial content exists 
    $(quill.root).html("");
    quill.clipboard.dangerouslyPasteHTML(0, instance.data.initial_html);
    instance.publishState("value", instance.data.initial_content);
}