exports.jhtml = jhtml.div({
	"id": "prouf"
}, function(options) {
	return jhtml.partial("partial.options", {
		locals: {
			"class": options.locals["class"]
		}
	});
});