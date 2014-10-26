/**
 * @fileoverview
 * @author Taketoshi Aono
 */


var ejs = require('ejs');
var fs = require('fs');

var md = fs.readFileSync('./slides/tagmgr-js.md', 'utf8');
var template = fs.readFileSync('./slide.template', 'utf8');
fs.writeFileSync('./slide.html', ejs.render(template, {md: md}), 'utf8');
