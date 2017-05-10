'use strict';
var HTMLMinifier = require('html-minifier').minify;

module.exports = function (content, blocks, htmlmin, config) {
	var linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';

	blocks.forEach(function (block) {
		var blockLines = block.raw.join(linefeed);

		if (block.type === 'js') {
			var defer = block.defer ? 'defer ' : '';
			var async = block.async ? 'async ' : '';
			var dest = block.destAlias ? block.destAlias : block.dest;

			content = content.replace(blockLines, block.indent + '<script ' + defer + async + 'src="' + dest + '"><\/script>');
		} else if (block.type === 'css') {
			content = content.replace(blockLines, block.indent + '<link rel="stylesheet" href="' + block.dest + '">');
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
