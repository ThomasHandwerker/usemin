'use strict';
var HTMLMinifier = require('html-minifier').minify;
var md5 = require('md5-file');

module.exports = function (content, blocks, htmlmin, config, nobundle, hashing, outputDest) {
	var linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';

	blocks.forEach(function (block) {
		var blockLines = block.raw.join(linefeed);
		var hashsuffix = (hashing == true) ? getFileHashSuffix(outputDest, block.dest) : '';

		if (block.type === 'js') {
			var defer = block.defer ? 'defer ' : '';
			var async = block.async ? 'async ' : '';
			var dest = block.destAlias ? block.destAlias : block.dest;

			if (nobundle === true) {
				content = content.replace(blockLines, reviseSourceRaw(block.raw, block.destAlias, linefeed));
			} else {
				content = content.replace(blockLines, block.indent + '<script ' + defer + async + 'src="' + dest + hashsuffix + '"><\/script>');
			}
		} else if (block.type === 'css') {
			content = content.replace(blockLines, block.indent + '<link rel="stylesheet" href="' + block.dest + hashsuffix + '">');
		} else if (block.type === 'livereload') {
			content = content.replace(blockLines + linefeed, '');
		} else if (block.type === 'remove') {
			content = content.replace(blockLines + linefeed, '');
		}
	});

	if (htmlmin) {
		content = HTMLMinifier(content, config.htmlminifier);
	}

	return content;
};

function getFileHashSuffix(outputPath, destFile) {
	var hash = md5.sync(outputPath + '/' + destFile);

	return '?v=' + hash;
}

function reviseSourceRaw(rawSources, alias, linefeed) {
	var sources = rawSources.slice(1, -1);

	if (typeof alias !== 'undefined') {
		var aliasRegEx = /((#.*)(?=\('))/;
		var extractedAlias = alias.match(aliasRegEx)[0];

		sources.forEach(function (source, index) {
			sources[index] = source.replace(/src=\"(.*)(?=\")/, 'src="' + extractedAlias + '(\'$1\')');
		});
	}

	var plainSources = sources.join(linefeed);

	plainSources = plainSources.replace(/async /g, '');
	plainSources = plainSources.replace(/defer /g, '');

	return plainSources;
}
