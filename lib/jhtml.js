var selfClosing = [
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
		tags = selfClosing.concat([	
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
		doctypes = {
		  '5': '<!DOCTYPE html>',
		  'xml': '<?xml version="1.0" encoding="utf-8" ?>',
		  'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
		  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
		  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
		  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
		  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
		  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
		};


function makePromise(buff) {
	return function(options) {
		options = options || {};
		options.context = options.context || this;
		
		if(typeof buff === "string") {
			// do some substitue logic
			return buff;
		} else {
			buff = buff.map(function(item) {
				return (typeof item === "string") ? 
									item :
									item.apply(options.context, [options]);
			});
			return buff.join("");
		}
	};
}		

var D = exports.D = function(name, nest) {
	if(name instanceof Function) {
		nest = Array.isArray(name) ? name : [name];
		name = "strict";
	}
	name = name || "strict";
	nest = nest ? (Array.isArray(nest) ? nest : [nest]) : [];
	var buff = [doctypes[name] + "\n"];
	
	if(nest && nest.length > 0) {
		for(var i in nest) {
			buff.push(nest[i]);
		}
	}
	
	return makePromise(buff);
}

var E = exports.E = function(tag, attr, nest) {
	var buff = [],
			selfclose = selfClosing.indexOf(tag) > -1;
	
	function isTag(str) {
		return (typeof str === "string") && str.indexOf(" ") === -1 && tags.indexOf(str) > -1;
	}
	function isNest(obj) {
		return (typeof obj === "string") || obj instanceof Function || Array.isArray(obj);
	}

	if(!isTag(tag)) {
		if(isNest(tag)) {
			nest = Array.isArray(tag) ? tag : [tag];
			attr = {};
		} else if(typeof tag === "object") {
			if(isNest(attr)) {
				nest = Array.isArray(attr) ? attr : [attr];
			}	
			attr = tag;
		}
		tag = "div";
	} else {
		tag = tag.toLowerCase();
		if(isNest(attr)) {
			nest = Array.isArray(attr) ? attr : [attr];
			attr = {};
		} else {
			nest = nest ? (Array.isArray(nest) ? nest : [nest]) : [];
		}
	}
	
	selfclose = selfclose && (!nest || nest.length === 0);
	
	buff.push("<" + tag);
	
	// attributes
	if(attr) {
		for(var name in attr) {
			buff.push(" " + name + "=\"");
			buff.push(attr[name]);
			buff.push("\"");
		}
	}
	
	buff.push(selfclose ? " />" : ">\n");
	
	// nesting tags	
	if(nest && nest.length > 0) {
		var item;
		for(var i in nest) {
			item = nest[i];
			if(i > 0) {
				buff.push("\n");
			}
			//buff.push((item instanceof Function) ? exports.render(item, this) : (item));
			buff.push(item);
		}
	}
	
	buff.push(selfclose ? "" : ("\n</" + tag + ">"));
	
	return makePromise(buff);
}

var aliases = exports.aliases = {};
var makeAlias = exports.makeAlias = function(name) {
	aliases[name] = function() {
		return exports.E.apply(this, [name].concat(Array.prototype.slice.call(arguments)));
	}
}

exports.makeAllAliases = function() {
	tags.forEach(makeAlias);	
}
exports.makeAllAliases();

exports.render = function(promise, options) {
	if(promise instanceof Function) {
		return promise(options);
	}
}

exports.partial = function(name, options) {
	var partial = require(name)[name.split(".")[0]];
	return options ? exports.render(partial, options) : partial;
}