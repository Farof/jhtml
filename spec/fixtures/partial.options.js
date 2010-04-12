exports.partial = jhtml.div({"class": function(){
	return function(options) {
		return options.locals["class"];
	}
}()})