
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

Then build your template :

	var template =
	E({id: "content"},
		E("p", "Hello world!")
	);

the "template" variable is now a promise that can deliver a string in two ways : executing the function or passing it to the render function. Both are equivalent :

	template();
	jhtml.render(template);

Output :

	<div id="content">
	<p>
	Hello world!
	</p>
	</div>

Note two things :

- There is no indentation. There will be a pretty mode, but it will obviously have a performance cost.
- the "E" function executed with no tag name renders a "div".

If its too verbose for you, you can uses aliases :

	var div = jhtml.aliases.div,
			h2 = jhtml.aliases.h2;
	jhtml.render(
		div({"class": "title"},
			h2("Hello world!")
		)
	);

will output :

	<div class="title">
	<h2>
	Hello world!
	</h2>
	</div>

If you dare, you can even build you template inside a "with" scope :

	with(jhtml.aliases) {
		p("I am ",
			span({"class": "higtlight"},
				"crazy !"
			)
		)
	}


## documentation

Look at "spec/fixtures/complex.js" and "spec/fixtures/complex.html" for the moment for a real life example.

## unit test

Unit tests are written using [jspec](http://github.com/visionmedia/jspec)

to run them:

	$ cd jhtml
	$ jspec run --node

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