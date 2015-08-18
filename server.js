var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var path = require('path');
var Remarkable = require('remarkable');
var request = require('superagent');
var escapeHtml = require('escape-html');
var verify = require('./verify');
var Logger = require('./Logger');

var md = new Remarkable();
var app = express();
var gh_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

var controller = require('./controllers');

controller.init(app);

app.set('port', (process.env.PORT || 5000));

var readMeMd = fs.readFileSync(__dirname + '/ReadMe.md', {encoding: 'utf8'})
var readMeHtml = md.render(readMeMd);
app.get('/', function(req, res) {
  res.send(readMeHtml);
});

var docList = fs.readdirSync(__dirname + '/docs');
docList.map(function(docName) {
  var docMd = fs.readFileSync(__dirname + '/docs/' + docName, {encoding: 'utf8'});
  var docHtml = md.render(docMd);
  app.get('/docs/' + docName, function(req, res) {
    res.send(docHtml);
  });
});

function renderDir(dir, filenameFragment) {
  var parentPath = '/';
  if (filenameFragment !== '/') {
    var parentPath = '/master' + path.join(filenameFragment, '..');
  }
  return '<html><head>' +
    '<title>' + filenameFragment + '</title>' +
    '</head><body>' +
    '<div id="menu" style="position:absolute;left:0;top:0;height:30;right:0;"><a href="'+parentPath+'">Back</a></div>' +
    '<ul>' +
    dir.map(function(item) {
      return '<li><a href="/' + path.join('master', filenameFragment, item) + '">' + item + '</a></li>';
    }).join('') +
    '</ul>' +
    '</body></html>';
  return ;
}
function renderFile(file, filenameFragment) {
  var parentPath = path.join(filenameFragment, '..');

  return '<html><head>' +
    '<title>' + filenameFragment + '</title>' +
    '</head><body>' +
    '<div id="menu" style="position:absolute;left:0;top:0;height:30;right:0;"><a href="/master'+parentPath+'">Back</a></div>' +
    '<div id="editor" style="position:absolute;left:0;top:30;right:0;bottom:0;">' + escapeHtml(file) + '</div>' +
    '<script src="/raw/ace.js" type="text/javascript" charset="utf-8"></script>' +
    '<script> var editor = ace.edit("editor"); editor.setReadOnly(true); editor.setTheme("ace/theme/monokai"); editor.getSession().setMode("ace/mode/javascript"); </script>' +
    '</body></html>';
}
app.get('/master*', function(req, res) {
  var filenameFragment = req.params[0];
  var filename = __dirname + filenameFragment;
  fs.lstat(filename, function(err, stats) {
    if (err) {
      return res.status(500).send(err);
    }
    if (stats.isDirectory()) {
      fs.readdir(filename, function(err, dir) {
        if (err) {
          return res.status(500).send(err);
        }
        res.send(renderDir(dir, filenameFragment));
      });
    } else {
      fs.readFile(filename, {encoding: 'utf8'}, function(err, file) {
        if (err) {
          return res.status(500).send(err);
        }
        res.send(renderFile(file, filenameFragment));
      });
    }
  })
});
app.get('/raw*', function(req, res) {
  var filename = __dirname + req.params[0];
  fs.lstat(filename, function(err, stats) {
    if (err) {
      return res.status(500).send(err);
    }
    if (stats.isDirectory()) {
      fs.readdir(filename, function(err, dir) {
        if (err) {
          return res.status(500).send(err);
        }
        res.send(dir);
      });
    } else {
      fs.readFile(filename, {encoding: 'utf8'}, function(err, file) {
        if (err) {
          return res.status(500).send(err);
        }
        res.send(file);
      });
    }
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
