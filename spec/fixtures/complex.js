var buff;
with(jhtml.aliases) {
buff = 
jhtml.D("xml",
jhtml.D("strict",
	html({xmlns: "http://www.w3.org/1999/xhtml"},
		head(
			meta({content: "text/html; charset=utf-8", "http-equiv": "Content-Type"}),
			link({rel: "stylesheet", "src": "static/css/reset.css"}),
			link({rel: "stylesheet", "src": "static/css/screen.css"})
		),
		body(
			div({id: "header"}),
			ul({id: "nav"}, function() {
				var nest = [];
				for(var i = 0; i < 5; i += 1) {
					nest.push(li({"class": "link " + i}));
				}
				return nest;
			}()),
			div({id: "content"},
				p("my first paragraph"),
				p("my second paragraph")
			),
			div({id: "footer"}, function(options) {
				var buff = "";
				buff += options.footer;
				return buff;
			})
		)
	)
)
);
}

exports.jhtml = buff;