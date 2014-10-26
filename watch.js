var fs = require('fs');
var exec = require('child_process').exec;
var file = './slides/tagmgr-js.md';
var mtime = fs.statSync(file).mtime;

fs.watch(file, function() {
  var t = fs.statSync(file).mtime;
  if (t > mtime) {
    mtime = t;
    var proc = exec('npm start');
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  }
});
