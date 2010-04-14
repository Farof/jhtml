describe "fixtures -->"
	before
		assert = function(name, options) {
			var html = require(name).jhtml(options).trim(),
					exp = fixture(name + ".html").trim();
			if(html === exp) {
				pass();
			} else {
				fail("got:\n" + html + "\n\nexpected:\n" + exp + "\n\n");
			}
		};
	end
	
	after
		delete assert;
	end
	
	describe "E meta fonction -->"
		it "should return the given tag"
			assert("span");
		end

		it "should return a div if no arg is given"
			assert("default");
		end

		describe "attributes -->"
			it "should apply proper attributes"
				assert("attributes");
			end

			it "should apply to div if only attributes" 
				assert("attributes.only");
			end

			it "should accept text as nest"
				assert("nest.text");
			end

			it "should accept only nested text"
				assert("nest.text.only");
			end
		end

		describe "nesting -->"
			it "should nest with attr"
				assert("nest.tag.attr");
			end

			it "should nest without attr"
				assert("nest.tag");
			end

			it "should nest a div if no tag"
				assert("nest.only");
			end

			it "should nest if no tag and attr"
				assert("nest.attr");
			end

			it "should nest in depth"
				assert("nest.multi");
			end

			it "should nest sibblings"
				assert("nest.sibblings");
			end
		end
	end

	describe "alias -->"
		it "should have a \"div\" alias"
			jhtml.aliases.div.should.be_a Function
		end

		it "should create a div tag"
			assert("alias.div");
		end

		it "should apply proper attributes"
			assert("alias.attr");
		end

		it "should do proper nesting"
			assert("alias.nest");
		end
	end

	describe "self-closing -->"
		it "should self close"
			assert("selfclose");
		end

		it "should self close with attr"
			assert("selfclose.attr");
		end

		it "should self close with nest"
			assert("selfclose.nest");
		end
	end

	describe "doctypes -->"
		before
			D = jhtml.D;
		end

		after
			delete D;
		end

		it "should be defined"
			D.should.be_a Function
		end

		it "should return doctypes"
			assert("doctype");
		end

		it "should return xhtml strict by default"
			assert("doctype.default");
		end

		it "should allow nesting"
			assert("doctype.nest");
		end
	end

	it "should manage a complex template"
		assert("complex", {
			locals: {
				footer: "my footer !"
			}
		});
	end

	it "should manage partials"
			assert("layout");
	end

	it "should manage partials with options"
			assert("layout.options", { 
				locals: {
					"class": "foo"
			}});
	end
end