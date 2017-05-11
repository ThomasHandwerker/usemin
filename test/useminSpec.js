'use strict';
var fs = require('fs');
var rimraf = require('rimraf');
var expect = require('chai').expect;
var usemin = require('../usemin');
var inputsDir = 'test/fixtures/';

describe('Usemin', function () {
	afterEach(function () {
		rimraf.sync(inputsDir + 'dist');
	});

	it('should minify all files', function () {
		var src = inputsDir + 'usemin/index.html';
		var dest = inputsDir + 'dist';
		var config = {
			htmlmin: true,
			removeLivereload: true,
		};
		var useminDir = inputsDir + 'usemin/';
		var htmlExpected = fs.readFileSync(useminDir + 'expected.html', 'utf8');
		var cssExpected = '.bar,.foo{background:#fff}';
		var jsExpected = 'function foo(){return"foo"}function bar(){return"bar"}foo(),bar();';

		var html = usemin(src, dest, config);

		var css = fs.readFileSync(inputsDir + 'dist/css/main.css', 'utf8');
		var js = fs.readFileSync(inputsDir + 'dist/js/main.js', 'utf8');

		expect(html).to.eql(htmlExpected);
		expect(css).to.eql(cssExpected);
		expect(js).to.eql(jsExpected);
	});

	it('should create sourcemap for file', function () {
		var src = inputsDir + 'sourcemap.html';
		var dest = inputsDir + 'dist';
		var config = {
			config: {
				uglifyjs: {
					outSourceMap: true,
				},
			},
		};

		var useminDir = inputsDir + '';
		var smExpected = fs.readFileSync(useminDir + 'sourcemap/expected.js.map', 'utf8');

		usemin(src, dest, config);

		var sm = fs.readFileSync(inputsDir + 'dist/js/sourcemap-bundled.js.map', 'utf8');

		expect(sm).to.eql(smExpected);
	});

	it('should create sourcemap for file and handle prefix config', function () {
		var src = inputsDir + 'sourcemap.html';
		var dest = inputsDir + 'dist';
		var config = {
			config: {
				uglifyjs: {
					outSourceMap: true,
					prefix: 2,
				},
			},
		};

		var useminDir = inputsDir + '';
		var smExpected = fs.readFileSync(useminDir + 'sourcemap/expected-prefix.js.map', 'utf8');

		usemin(src, dest, config);

		var sm = fs.readFileSync(inputsDir + 'dist/js/sourcemap-bundled.js.map', 'utf8');

		expect(sm).to.eql(smExpected);
	});
});
