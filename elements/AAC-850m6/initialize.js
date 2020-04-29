function(instance, context) {
    
    //initialize Quill in the update function in order to have access to properties
    instance.data.initialized = false;
    instance.data.id = "";
    instance.canvas.css("overflow", "visible");
    instance.data.img_tracker = 0;
    instance.data.prev_initial_content = '';
    instance.data.initial_content_loaded = false;
    instance.publishState("field_is_focused", false);
    instance.data.change_event_should_trigger = false;
    instance.data.should_rerun_val = false;
    
}