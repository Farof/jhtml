
# jhtml

jhtml is a full javascript html templating library

## why

- 	typesafe
- 	no "with" magic
- 	no "eval" magic
- 	full javascript power

jhtml runs on nodejs server v0.1.90+ - let me know if it runs (or not) againts other environments !

It will eventually be a standard commonjs module designed for both browsers and servers.

## example

jhtml builds promises that delivers html as string when executed or rendered.

You'll probably want to load some variables

	var jhtml = require("jhtml");
	var E = jhtml.E;

Then build your template:

	var template =
	E({id: "content"},
		E("p", "Hello world!")
	);

the "template" variable is now a promise that can deliver a string in two ways : executing the function or passing it to the render function. Both are equivalent:

	template();
	jhtml.render(template);

Output:

	<div id="content">
	<p>
	Hello world!
	</p>
	</div>

Note two things:

- There is no indentation. There will be a pretty mode, but it will obviously have a performance cost.
- the "E" function executed with no tag name renders a "div".

If its too verbose for you, you can uses aliases:

	var div = jhtml.aliases.div,
			h2 = jhtml.aliases.h2;
	jhtml.render(
		div({"class": "title"},
			h2("Hello world!")
		)
	);

will output:

	<div class="title">
	<h2>
	Hello world!
	</h2>
	</div>

If you dare, you can even build you template inside a "with" scope:

	with(jhtml.aliases) {
		p("I am ",
			span({"class": "higtlight"},
				"crazy !"
			)
		)
	}

For detailed usage and more features such as locals, partials, doctypes and javascript fun, see the documentation below.

## documentation

I assume in this documentation that jhtml is loaded as below:

	var jhtml = require("jhtml");

Notes:
- For readability, I will indent the rendering examples. Real output are not indented.

### E

jhtml.E is the main function. It return a function that returns a string when executed. It creates a "div" tag by default.

	var E = jhtml.E;
	
	var template = E();

"template" is now a template waiting to be rendered. Two ways of doing it 

	var str = template();
	var str = jhtml.render(template);
	
"str" is now a string ready to be delivered by the engine of your choice.

jhtml.E can take any number of arguments, in any kind of order. Here are the rules :

- If the first argument is a String and a valid html4.1 or html5 tag, it is detected as the node tag.
- If the first argument is a String and not a valid tag, it is detected as text to be inserted in the node.
- If no valid tag is detected, it is defaulted to "div".
- If the argument is a String and is not the first argument, it is detected as text to be inserted in the node.
- If the argument is a literal Object, it is detected as the properties of the node. If multiple objects are found, last one will prevail.
- If the argument is a Function, it is detected as node content and will be executed on rendering with appropriate locals and context. The function MUST return a String or an error will occur.
- If the argument is an Array, each of its items will be detected as node content. Items wich are not String or Function will be ignored.
- Literal Objects (node attributes) can have a function as property value. The function will be executed on rendering with appropriate locals and context.


Knowing these rules, here are a few examples (not real life, just to demonstrate possible usage):

	E({id: "content"},
		E("p", "Hello world!")
	);

renders:

	<div id="content">
		<p>
			Hello world!
		</p>
	</div>

More complicated:

	E({"class": function() {return "highlight";}}, "span", "Hello world!");

renders:

	<div class="hightlight">
		span
		Hello world!
	</div>

Why ? "span" is not given as first argument, so it's detected as inner text and the tag is defaulted to "div". The function associated with "class" property is executed on rendering.

	E("hello", 
		{id: "footer"},
		{"class": "inner"}
	);

renders:

	<div class="inner">
		hello
	</div>
	
"hello" is not a valid tag, it is detected as text and tag is defaulted to "div". The last litteral object is detected as node property. (I plan to merge them in the futur)

	E("p",
		function() {return "hello";},
		function() {return " world!";}
	);

and

	E("p", [
		function() {return "hello";},
		function() {return " world!";}
	]);

are equivalents and render:

	<p>
		hello
		 world !
	</p>

Self closing tags are supported:

	E("link", {type: "text/css", rel: "stylesheet", href: "screen.css"});

renders:

	<link type="text/css" rel="stylesheet" href="screen.css" />

And accept inner text:

	E("img", {src: "logo.jpg"},
		"my logo"
	);

renders:

	<img src="logo.jpg">
		my logo
	</img>


#### aliases

It might be a bit painful to write E(...) for each node. For better readability, you can use aliases.

	var aliases = jhtml.aliases,
			div = aliases.div,
			p = aliases.p;
	
	div({id: "content"},
		p("hello world!")
	);

Obviously each alias is equivalent to calling "E" with the alias name as first arg. p()() === E("p")()

You might want to use a "with" scope for simplicity:

	var template;
	with(jhtml.aliases) {
		template =
		div(
			p()
		);
	}



### rendering options

You can pass options for the rendering. Supported options are :

- context: the "this" property of functions in the template will be set to "context" property
- locals: "locals" will be given as first argument to functions in the template

An example to understand :

	var template =
	E("p", {
			"class": function(locals) {
				return locals["class"];
			}
		},
		function() {
			return this.getMsg();
		},
		function(locals) {
			return locals.name;
		},
		"!"
	);
	jhtml.render(template, {
		context: {
			getMsg: function() {
				return "Goodbye "
			}
		},
		locals: {
			name: "Joe",
			"class": "msg"
		}
	});

renders:

	<p class="msg">
		Goodbye 
		Joe
		!
	</p>

In this example, locals and context are given to functions returning inner text and the value of a tag property.


### if, for, ... (and other javascript fun)

Really nothing special here, juste plain old javascript on top of the lib rendering rules.

	var template =
	E("ul", function makemenu(options) { 				// function that build the menu
		return options.links.map(function makelink(link) { 	// we execute a function on each link
			return E("li",					// the function creates a jhtml template
					E("a", {href: link})		// and uses the link property
			)(); 						// and executes the link template, returning a String
		}).join("\n")						// All the strings are then joined together and returned.
	});
	template({ locals: {
		links: [
			"link1.html",
			"link2.html",
			"link3.html"
		]
	}});

renders:

	<ul>
		<li>
			<a href="link1.html" />
		</li>
		<li>
			<a href="link2.html" />
		</li>
		<li>
			<a href="link3.html" />
		</li>
	</ul>

Code is commented to understand what happened. Just plain old javascript. A bit verbose maybe but hey, that's a fair price in my opinion. Insert whatever you like in the functions, just remember it as to return a String.


### partials

Supported, have to write doc.


### doctypes: D

Doctypes work the same way as the E function, except it's D and you can specify property.

	var D = jhtml.D,
			html = jhtml.aliases.html;
	D("xml",
	D("strict"),
	html()
	)
	
renders:

	<?xml version="1.0" encoding="utf-8" ?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html>
	
	</html>

supported doctypes:
- xml
- 5 (html5 doctype)
- default (xhtml 1.0 transitional)
- strict (xhtml 1.0 strict)
- frameset (xhtml 1.0 frameset)
- 1.1 (xhtml 1.1)
- basic (xhtml basic 1.1)
- mobile (xhtml mobile 1.1)


### custom tag

If for some reason you need a custom tag to be detected correctly (if I forgot one, notice me!), you can add them :

	jhtml.addTag("custom");
	E("custom")();		// <custom>\n\n</custom>
	jhtml.aliases.custom()();		// same thing

declare self closing tags by passing a truthy second argument:

	jhtml.addTag("custom", true);
	E("custom")();		// <custom />


## unit test

Unit tests are written using [jspec](http://github.com/visionmedia/jspec)

to run them:

	$ cd jhtml
	$ jspec run --node


## get involved

- English is not my main language, it may look obvious if you made it down here. Repport typo, bad sentences, etc... I'm ok with it!
- Repport bugs, make suggestions.
- Patch! (I'm a git noob though, might need help pulling other people work :p)


## License 

(The MIT License)

Copyright (c) 2010 Mathieu Merdy &lt;gfarof@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.