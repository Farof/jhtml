describe "jhtml -->"
	before
		debuffer = jhtml.debuffer;
		bufferize = jhtml.bufferize;
		tokenize = jhtml.tokenize;
		t2b = jhtml.token2buffer;
		render = jhtml.render;
	end
	
	after
		delete assert, debuffer, bufferize, tokenize, t2b;
	end
	
	describe "bufferize -->"
		it "should be defined"
			bufferize.should.be_a Function
		end
		
		it "should return a function"
			bufferize().should.be_a Function
		end
		
		it "should return a Function that returns String"
			bufferize()().should.eql ""
		end
	end
	
	describe "debuffer -->"
		it "should be defined as a Function"
			debuffer.should.be_a Function
		end
		
		it "should return a String"
			debuffer().should.eql ""
		end
		
		it "should join string content"
			debuffer(["foo", "bar"]).should.eql "foobar"
		end
		
		it "should execute function"
			debuffer(["foo", function(){return "bar";}]).should.eql "foobar"
		end
		
		it "should ignore non String or Function values"
			debuffer(["foo", 5, "bar"]).should.eql "foobar"
		end
		
		it "should throw error if nested function does not return a String"
			-{debuffer([function(){return 5;}])}.should.throw_error
		end
		
		it "should apply the given context to functions"
			debuffer(["foo", function(){return this.bar}], {context: {bar: "nobar"}}).should.eql "foonobar"
		end
		
		it "should pass the given locals as first arg to functions"
			debuffer(["foo", function(options){return options.bar}], {locals: {bar: "nobar"}}).should.eql "foonobar"
		end
		
		it "should manage deep nesting"
			debuffer(["foo", bufferize([function() {return "bar";}, bufferize([function(){return "foo"}])])]).should.eql "foobarfoo"
		end
		
		it "should manage nesting with context"
			debuffer(["foo", bufferize([function() {return this.text;}])], {context: {text: "plop"}}).should.eql "fooplop"
		end
		
		it "should manage deep nesting with context"
			debuffer(["foo", bufferize([function() {return this.text;}, bufferize([function(){return this.msg;}])])], {context: {text: "plop", msg: "bar"}}).should.eql "fooplopbar"
		end
		
		it "should manage nesting with locals"
			debuffer(["foo", bufferize([function(options) {return options.text;}])], {locals: {text: "plop"}}).should.eql "fooplop"
		end
		
		it "should manage deep nesting with locals"
			debuffer(["foo", bufferize([function(options) {return options.text;}, bufferize([function(options){return options.msg;}])])], {locals: {text: "plop", msg: "bar"}}).should.eql "fooplopbar"
		end
	end
	
	describe "tokenizer -->"
		it "should be defined"
			tokenize.should.be_a Function
		end
		
		it "should return an object"
			tokenize().should.be_an Object
		end
		
		it "should have default values"
			tokenize().should.eql {tag: "div", attr: {}, nest: [], toString: jhtml.token2buffer}
		end
		
		it "should manage [tag]"
			tokenize("span").tag.should.eql "span"
		end
		
		it "should manage [string] where string is not an html4.5 or html5 tag"
			var t = tokenize("prouf");
			t.tag.should.eql "div"
			t.nest[0].should.eql "prouf"
		end
		
		it "should manage [object]"
			tokenize({foo: "bar"}).attr.should.eql {foo: "bar"}
		end
		
		it "should manage [tag, object]"
			var t = tokenize("span", {foo: "bar"});
			t.tag.should.eql "span"
			t.attr.should.eql {foo: "bar"}
		end
		
		it "should manage [string, object]"
			var t = tokenize("prouf", {foo: "bar"})
			t.tag.should.eql "div"
			t.attr.should.eql {foo: "bar"}
			t.nest[0].should.eql "prouf"
		end
		
		it "should manage [object, tag]"
			var t = tokenize({foo: "bar"}, "span");
			t.tag.should.eql "div"
			t.attr.should.eql {foo: "bar"}
			t.nest[0].should.eql "span"
		end
		
		it "should manage [function]"
			var f = function(){};
			var t = tokenize(f);
			t.nest[0].should.be f
		end
		
		it "should manage [function, [function]]"
			var f1 = function(){return 1;},
					f2 = function(){return 2;};
			var t = tokenize(f1, [f2]);
			t.nest[0].should.be f1
			t.nest[1].should.be f2
		end
		
		it "should manage [function, function, function, ...]"
			var
				f1 = function(){return 1;},
				f2 = function(){return 2;},
				f3 = function(){return 3;},
				t = tokenize(f1, f2, f3);
			t.nest.should.eql [f1, f2, f3]
		end
		
		it "should manage [object, funtion, object]"
			tokenize({foo: "bar"}, function(){}, {foo: "nobar"}).attr.should.eql {foo: "nobar"}
		end
		
		it "should be called correctly via apply"
			function(){return tokenize.apply(this, arguments)}("span").tag.should.eql "span"
		end
	end
	
	describe "token2buffer"
		it "should be defined"
			t2b.should.be_a Function
		end
		
		it "should buffer tag"
			debuffer(bufferize(t2b(tokenize()))).should.eql "<div>\n\n</div>"
		end
		
		it "should buffer attributes"
			debuffer(bufferize(t2b(tokenize({foo: "bar", bar: "foo"})))).should.eql '<div foo="bar" bar="foo">\n\n</div>'
		end
		
		it "should buffer text"
			debuffer(bufferize(t2b(tokenize("foo", "bar")))).should.eql "<div>\nfoo\nbar\n</div>"
		end
		
		it "should buffer functions"
			debuffer(bufferize(t2b(tokenize(function(){return "foo"}, "bar")))).should.eql "<div>\nfoo\nbar\n</div>"
		end
		
		it "should buffer function as property value"
			debuffer(bufferize(t2b(tokenize({foo: function() {return "plop"}})))).should.eql '<div foo="plop">\n\n</div>'
		end
		
		it "should buffer function as property value with context"
			debuffer(bufferize(t2b(tokenize({foo: function() {return this.prop}}))), {context: {prop: "plop"}}).should.eql '<div foo="plop">\n\n</div>'
		end
		
		it "should buffer function as property value with options"
			debuffer(bufferize(t2b(tokenize({foo: function(options) {return options.locals.prop}}))), {locals: {prop: "plop"}}).should.eql '<div foo="plop">\n\n</div>'
		end
		
		it "should buffer buffer"
			debuffer(bufferize(t2b(tokenize("foo", bufferize(t2b(tokenize("bar"))))))).should.eql "<div>\nfoo\n<div>\nbar\n</div>\n</div>"
		end
		
		it "should buffer self closing tags"
			debuffer(bufferize(t2b(tokenize("link", {rel: "stylesheet", type: "text/css"})))).should.eql '<link rel="stylesheet" type="text/css" />'
		end
		
		it "should buffer self closing tags with nest"
			debuffer(bufferize(t2b(tokenize("img", {src: "static/img.jpg"}, "foobar")))).should.eql '<img src="static/img.jpg">\nfoobar\n</img>'
		end
		
		it "should manage deep nesting with options"
			var a = bufferize(t2b(tokenize(function(options){return options.c;})));
			var b = bufferize(t2b(tokenize(function(options){return options.b;}, a)));
			debuffer(bufferize(t2b(tokenize(function(options){return options.a;}, b))), {locals: {a: "aplop", b: "bplop", c: "cplop"}}).should.eql "<div>\naplop\n<div>\nbplop\n<div>\ncplop\n</div>\n</div>\n</div>"
		end
	end
	
	describe "E fonction -->"
		before
			E = jhtml.E;
		end
		
		after
			delete E;
		end
		
		it "should be defined"
			E.should.be_a Function
		end
		
		it "should return a function"
			E().should.be_a Function
		end
		
		it "should create a div by default"
			E()().should.eql "<div>\n\n</div>"
		end
		
		it "should manage #render on promise"
			debuffer(E("span", {foo: "bar"})).should.eql '<span foo="bar">\n\n</span>'
		end
		
		it "should manage #render on promise with nest"
			debuffer(E(E("p"))).should.eql "<div>\n<p>\n\n</p>\n</div>"
		end
		
		it "should manage #render on promise with nest and options"
			debuffer(E(E("p", E("span", function(options){return options.text}))), {locals: {text: "prouf"}}).should.eql "<div>\n<p>\n<span>\nprouf\n</span>\n</p>\n</div>"
		end
	end
	
	describe "D fonction"
		before
			D = jhtml.D
		end
		
		after
			delete D;
		end
		
		it "should be defined"
			D.should.be_a Function
		end
		
		it "should return a function"
			D().should.be_a Function
		end
		
		it "should return strict doctype by default"
			D()().should.eql '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n'
		end
		
		it "should return named doctype"
			D("xml")().should.eql '<?xml version="1.0" encoding="utf-8" ?>\n'
		end
		
		it "should allow nesting"
			D("xml", function(){return "plop"}, function(){return "prouf"})().should.eql '<?xml version="1.0" encoding="utf-8" ?>\nplopprouf'
		end
	end
	
	describe "utilities -->"
		it "should access tags"
			jhtml.tags.should.be_an Array
		end
		
		it "should add tag"
			jhtml.tags.indexOf("blobblo").should.be_less_than 0
			jhtml.addTag("bloblo");
			jhtml.tags.indexOf("bloblo").should.be_at_least 0
			debuffer(bufferize(t2b(tokenize("bloblo")))).should.eql "<bloblo>\n\n</bloblo>"
		end
		
		it "should add self closing tag"
			jhtml.tags.indexOf("blobbla").should.be_less_than 0
			jhtml.addTag("blobla", true);
			jhtml.tags.indexOf("blobla").should.be_at_least 0
			debuffer(bufferize(t2b(tokenize("blobla")))).should.eql "<blobla />"
		end
		
		it "should access doctypes"
			jhtml.doctypes.should.be_an Object
		end
		
		it "should add doctype"
			jhtml.doctypes.should.not.have_prop "prouf"
			jhtml.addDoctype("prouf", "yeah");
			jhtml.doctypes["prouf"].should.eql "yeah"
		end
	end
end