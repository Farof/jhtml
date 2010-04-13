require.paths.unshift('spec', '/Users/farof/.gem/ruby/1.8/gems/jspec-4.2.0/lib', 'lib', "./spec/fixtures")
require('jspec')
require('unit/spec.helper')
jhtml = require('jhtml')

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
