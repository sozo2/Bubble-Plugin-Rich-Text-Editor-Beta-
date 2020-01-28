function(instance, context) {
    
    //initialize Quill in the update function in order to have access to properties
    instance.data.initialized = false;
    instance.data.id = "";
    instance.canvas.css("overflow", "visible");
    instance.data.img_tracker = 0;

}