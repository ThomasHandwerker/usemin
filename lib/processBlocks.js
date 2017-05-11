'use strict';
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');

module.exports = function (blocks, destDir, config) {
	var useBlockSourcemapFilename = config.uglifyjs.outSourceMap || null;

	blocks.forEach(function (block) {
		var filepath = '';

		if (block.type === 'js') {
			var blockFileName = path.parse(block.dest).base;
			var outSourceMapFileName = blockFileName + '.map';

			filepath = path.join(destDir, block.dest);

			if (useBlockSourcemapFilename !== null && useBlockSourcemapFilename === true)
				config.uglifyjs.outSourceMap = outSourceMapFileName;

			var js = UglifyJS.minify(block.src, config.uglifyjs);

			mkdirp.sync(path.dirname(filepath));
			fs.writeFileSync(filepath, js.code);

			if (config.uglifyjs.outSourceMap !== null) {
				var mappath = path.join(destDir, path.dirname(block.dest), config.uglifyjs.outSourceMap);

				if (typeof config.uglifyjs.prefix !== 'undefined' && config.uglifyjs.prefix > 0)
					js.map = revisePathInSourceMap(js.map, config.uglifyjs.prefix);

				mkdirp.sync(path.dirname(mappath));
				fs.writeFileSync(mappath, js.map);
			}
		} else if (block.type === 'css') {
			filepath = path.join(destDir, block.dest);
			var css = '';

			block.src.forEach(function (src) {
				css += fs.readFileSync(src);
			});

			css = new CleanCSS(config.cleancss).minify(css).styles;

			mkdirp.sync(path.dirname(filepath));
			fs.writeFileSync(filepath, css);
		} else if (block.type !== 'livereload' && block.type !== 'remove') {
			throw Error('Unsupport format: ' + block.type);
		}
	});

	return true;
};

function revisePathInSourceMap(map, prefix) {
	var sourceRegEx = /\"sources\":\[(.+?(?=\]))\]/,
		match = map.match(sourceRegEx),
		sources = match[1],
		fixedSources = [],
		revisedMap = '',
		replacement = '';

	sources.split(',').forEach(function(source) {
		var fixedSource = source.replace(/\"/g, '');
		var folderDepth = fixedSource.match(new RegExp('\/', 'g')) || [];

		if (folderDepth.length < prefix)
			throw new Error('Invalid --prefix config. Depth of sourcemap source (' + fixedSource + ') only ' + folderDepth.length);

		var prefixPattern = '^([A-z0-9]*\/){'+ prefix +'}';
		var prefixRegEx = new RegExp(prefixPattern);

		fixedSources.push('"' + fixedSource.replace(prefixRegEx, '') + '"');
	});

	replacement = '\"sources\":[' + fixedSources.toString() + ']';
	revisedMap = map.replace(sourceRegEx, replacement);

	return revisedMap;
}
