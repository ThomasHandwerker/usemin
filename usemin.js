'use strict';
var fs = require('fs');
var getBlocks = require('./lib/getBlocks');
var getConfig = require('./lib/getConfig');
var processBlocks = require('./lib/processBlocks');
var getHtml = require('./lib/getHtml');

module.exports = usemin;
usemin.getBlocks = getBlocks;
usemin.getConfig = getConfig;
usemin.processBlocks = processBlocks;
usemin.getHtml = getHtml;

function usemin(filepath, dest, userConfig) {
	var defaults = {
		output: false,
		configFile: false,
		config: false,
		hash: false,
		htmlmin: false,
		nobundle: false,
		noprocess: false,
		removeLivereload: false,
	};
	var config = Object.assign(defaults, userConfig);
	var content = fs.readFileSync(filepath).toString();
	var blocks = getBlocks(filepath, content, config.removeLivereload);
	var useminConfig = getConfig(config.configFile, config.config);
	var process = (config.noprocess || config.nobundle) ? true : processBlocks(blocks, dest, useminConfig);
	var output = getHtml(content, blocks, config.htmlmin, useminConfig, config.nobundle, config.hash, dest);

	if (process) {
		if (config.output) {
			fs.writeFileSync(config.output, output);
		}
	} else {
		throw Error('Unexpected error.');
	}

	return output;
}
