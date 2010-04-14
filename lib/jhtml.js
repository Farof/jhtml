var 
selfClosing = [
	"a",
	"area",
	"base",
	"br",
	"col",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param"
],
// html 4.1 and html 5 elements (except deprecated and javascript keywords (and strange >_<))
tags = exports.tags = selfClosing.concat([	
	"abbr",
	"acronym",
	"address",
	"article",
	"aside",
	"audio",
	"b",
	"bdo",
	"big",
	"blockquote",
	"body",
	"button",
	"canvas",
	"caption",
	"cite",
	"code",
	"colgroup",
	"command",
	"datalist",
	"dd",
	"del",
	"dfn",
	"div",
	"dl",
	"dt",
	"em",
	"embed",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hgroup",
	"html",
	"i",
	"iframe",
	"ins",
	"kdb",
	"keygen",
	"label",
	"legend",
	"li",
	"map",
	"mark",
	"menu",
	"meter",
	"nav",
	"noframes",
	"noscript",
	"object",
	"ol",
	"optgroup",
	"output",
	"option",
	"p",
	"param",
	"pre",
	"progress",
	"q",
	"rp",
	"rt",
	"ruby",
	"samp",
	"script",
	"section",
	"select",
	"small",
	"source",
	"span",
	"strong",
	"style",
	"sub",
	"summary",
	"sup",
	"table",
	"tbody",
	"tb",
	"textarea",
	"tfoot",
	"th",
	"thead",
	"time",
	"title",
	"tr",
	"tt",
	"ul",
	"var",
	"video"
]),
doctypes = exports.doctypes = {
  '5': '<!DOCTYPE html>',
  'xml': '<?xml version="1.0" encoding="utf-8" ?>',
  'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
};

exports.addTag = function(tag, selfclosing) {
	if(typeof tag !== "string") {
		return;
	}
	tags.push(tag);
	if(selfclosing) {
		selfClosing.push(tag);
	}
}
exports.addDoctype = function(doctype, value) {
	if(typeof doctype !== "string" || typeof value !== "string") {
		return;
	}
	doctypes[doctype] = value;
}

var debuffer = exports.debuffer = exports.render = function(buffer, options) {
	options = options || {};
	options.context = options.context || this;
	options.locals = options.locals || {};
	
	buffer = buffer ? (Array.isArray(buffer) ? buffer : [buffer]) : [];
	buffer = buffer.filter(function(item) {
		var type = typeof item;
		return type === "string" || type === "function";
	});
	return buffer.map(function(item) {
		if(typeof item === "string") {
			return item;
		} else {
			var localnest = !options.locals.locals,
					localbuff;
			if(localnest) {
				localbuff = options.locals.locals;
			}	
			options.locals.locals = options.locals;
			item = item.apply(options.context, [options.locals]);
			if(localnest) {
				options.locals.locals = localbuff;
			}
			if(typeof item === "string") {
				return item;
			} else {
				throw new Error("Nested function should return String. Got: " + item);
			}
		}
	}).join("");
};

var bufferize = exports.bufferize = function(buffer) {
	return function(options) {
		options = options || {};
		options.context = options.context || this;
		return debuffer.apply(options.context, [buffer, options]);
	}
}


var t2b = exports.token2buffer = function(token) {
	var 
		tag = token.tag || "div",
		attr = token.attr || {}, 
		nest = token.nest || [],
		buff = [],
		selfclose = selfClosing.indexOf(tag) > -1 && nest.length === 0;
	
	// open tag
	buff.push("<" + tag);
	
	// attributes
	for(var i in attr) {
		if(attr.hasOwnProperty(i)) {
			buff.push(" " + i + "=\"");
			buff.push(attr[i]);
			buff.push("\"");
		}
	}
	
	// close start tag (auto close if self closing)
	buff.push(selfclose ? " />" : ">\n");
	
	// nested elements
	for(var i = 0, l = nest.length, item, type; i < l; i += 1) {
		if(nest.hasOwnProperty(i)) {
			item = nest[i];
			type = typeof item
			
			if(i > 0) {
				buff.push("\n");
			}
			buff.push(item)
		}
	}
	
	// close end tag if neccessary
	buff.push(selfclose ? "" : "\n</" + tag + ">");
	
	return buff;
}

var tokenize = exports.tokenize = function() {
	var 
		args = Array.prototype.slice.call(arguments),
		token = {
			tag: "div",
			attr: {},
			nest: [],
			toString: t2b
		},
		item;
	
	for(var i = 0, l = args.length; i < l; i += 1) {
		item = args[i];
		switch(typeof item) {
			case "string": {
				if(i === 0 && tags.indexOf(item) > -1) {
					token.tag = item;
				} else {
					token.nest.push(item);
				}
				break;
			}
			case "object": {
				if(!Array.isArray(item)) {
					token.attr = item;
				} else {
					// concat array to nest
					item.forEach(function(innerItem) {
						token.nest.push(innerItem);
					})
				}
				break;
			}
			case "function": {
				token.nest.push(item);
				break;
			}
		}
	}
	return token;
};

var E = exports.E = function() {
	return bufferize(t2b(tokenize.apply(this, arguments)));
};
var D = exports.D = function(doctype) {
	var	args = Array.prototype.slice.call(arguments);
	if(typeof doctype === "string") {
		args.shift();
	} else {
		doctype = "strict"
	}
	return bufferize([doctypes[doctype], "\n"].concat(args));
};

var aliases = exports.aliases = {};

var makeAlias = exports.makeAlias = function(name) {
	aliases[name] = function() {
		return E.apply(this, [name].concat(Array.prototype.slice.call(arguments)));
	};
};
tags.forEach(makeAlias);



exports.partial = function(name, options) {
	var export = name.split("/");
	export = export[export.length - 1].split(".")[0];
	var partial = require("partials/" + name)[export];
	return options ? (exports.render(partial, options)) : partial;
}
