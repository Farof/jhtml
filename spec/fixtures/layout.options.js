exports.jhtml = jhtml.div({
	"id": "prouf"
}, function(){
	return function(options) {
		return jhtml.partial("partial.options", {
			locals: {
				"class": options.locals["class"]
			}
		})
	}
}());