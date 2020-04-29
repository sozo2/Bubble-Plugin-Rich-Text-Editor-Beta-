function(instance, properties, context) {
    if(!instance.data.quill){
        instance.data.should_focus = true
        return;
    }
	var quill = instance.data.quill;
    instance.publishState("field_is_focused", true);
	quill.focus();
}