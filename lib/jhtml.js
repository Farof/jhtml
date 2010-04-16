var 
exports = exports || this,
require = require || function() {
	throw new Error("require is not defined");
},
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
// html 4.1 and html 5 elements (except deprecated)
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

/**
 * Add custom doctype
 * @param doctype String "doctype identifier"
 * @param value String "doctype value"
 */
exports.addDoctype = function(doctype, value) {
	if(typeof doctype !== "string" || typeof value !== "string") {
		return;
	}
	doctypes[doctype] = value;
};

/**
 * Render function. Transforme an array of mixed content into a string
 * @param buffer String || Function || Array[String || Function] "buffer to transform into a string"
 * @param options Object "Hash of rendering options. supports locals and context"
 * @return String
 */
var render = exports.render = function(buffer, options) {
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

/**
 * Builds a buffer rendering promise.
 * @param buffer Array[String || Function] || String || Function "buffer to render"
 * @return Function
 */
var bufferize = exports.bufferize = function(buffer) {
	/**
	 * Promise to render a string
	 * @param options Object "rendering options"
	 * @return String
	 */
	return function(options) {
		options = options || {};
		options.context = options.context || this;
		return render.apply(options.context, [buffer, options]);
	};
};

/**
 * Transform an html node token into an array of string or Function to execute. Tokens are created via #tokenize function.
 * @paran token Object "html node token created via #tokenize function"
 * @return Array
 */
var t2b = exports.token2buffer = function(token) {
	var 
		tag = token.tag || "div",
		attr = token.attr || {}, 
		nest = token.nest || [],
		buff = [],
		selfclose = selfClosing.indexOf(tag) > -1 && nest.length === 0,
		i, l, item, type;
	
	// open tag
	buff.push("<" + tag);
	
	// attributes
	for(i in attr) {
		if(attr.hasOwnProperty(i)) {
			buff.push(" " + i + "=\"");
			buff.push(attr[i]);		// may be a function
			buff.push("\"");
		}
	}
	
	// close start tag (auto close if self closing)
	buff.push(selfclose ? " />" : ">");
	
	// nested elements
	for(i = 0, l = nest.length, item, type; i < l; i += 1) {
		if(nest.hasOwnProperty(i)) {
			item = nest[i];
			type = typeof item;
			buff.push("\n");
			buff.push(item);
		}
	}
	
	// close end tag if neccessary
	buff.push(selfclose ? "" : "\n</" + tag + ">");
	
	return buff;
};

/**
 * Takes any number of arguments and calculates a token from all of them
 * @param String || Function || Object || Array[String || Function || Object]
 * return Object tokenized html node
 */
var tokenize = exports.tokenize = function() {
	var 
		args = Array.prototype.slice.call(arguments),
		token = {
			tag: "div",		// node tag name
			attr: {},			// node properties
			nest: [],			// node childrens
//			toString: t2b	
		},
		item, i, j, l, m;
	
	for(i = 0, l = args.length; i < l; i += 1) {
		item = args[i];
		switch(typeof item) {
			case "string":
				if(i === 0 && tags.indexOf(item) > -1) {
					token.tag = item;
				} else {
					token.nest.push(item);
				}
				break;
			case "object":
				if(!Array.isArray(item)) {
					token.attr = item;
				} else {
					// concat array to nest
//						token.nest.concat(item);
					for(j = 0, m = item.length; j < m; j += 1) {
						token.nest.push(item[j]);
					}
				}
				break;
			case "function":
				token.nest.push(item);
				break;
		}
	}
	return token;
};

/**
 * Node main templating function. Takes any number of arg
 */
var E = exports.E = function() {
	return bufferize(t2b(tokenize.apply(this, arguments)));
};

/**
 * Templating with doctype.
 */
var D = exports.D = function(doctype) {
	var	args = Array.prototype.slice.call(arguments);
	if(typeof doctype === "string") {
		args.shift();
	} else {
		doctype = "strict";
	}
	return bufferize([doctypes[doctype], "\n"].concat(args));
};

// Tag aliases for easy templating
var aliases = exports.aliases = {};

/**
 * Creates a new tag alias.
 * @param name String "tag name"
 */
var makeAlias = exports.makeAlias = function(name) {
	exports.aliases[name] = function() {
		return E.apply(this, [name].concat(Array.prototype.slice.call(arguments)));
	};
};
tags.forEach(makeAlias);

/**
 * Adds new custom tag
 * @param tag String "tag name"
 * @param selfClosing Boolean "tells if the tag is self closing"
 */
exports.addTag = function(tag, selfclosing) {
	if(typeof tag !== "string") {
		return;
	}
	tags.push(tag);
	if(selfclosing) {
		selfClosing.push(tag);
	}
	makeAlias(tag);
};

/**
 * Loads partial template. If second arg is given, the loaded template is immediatly renders to a string.
 * @param name String "partial name to require. Will be prefixed by partial.prefix"
 * @param options Object "Options used to render the template"
 * @return Function || String "Returns a promise to deliver a String, or a String if options is given as second arg"
 */
exports.partial = function(name, options) {
	var exp = name.split("/"),
			partial;
	exp = exp[exp.length - 1].split(".")[0];
	partial = require(exports.partial.prefix + name)[exp];
	return options ? (exports.render(partial, options)) : partial;
};
// partial require prefix
exports.partial.prefix = "partials/";