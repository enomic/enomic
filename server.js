var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var Remarkable = require('remarkable');
var request = require('superagent');

var md = new Remarkable();
var app = express();
var gh_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
