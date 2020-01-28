function(instance, context) {
	var quill = instance.data.quill;
    $("#" + instance.data.id).html("");
    instance.publishState("value", "");
}