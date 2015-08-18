var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var Remarkable = require('remarkable');
var request = require('superagent');
var verify = require('./verify');
var Logger = require('./Logger');

var md = new Remarkable();
var app = express();
var gh_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

function makePrComment(number, body, cb) {
  request
    .put('https://api.github.com/repos/enomic/enomic/issues/'+number+'/comments?access_token='+gh_oauth_token)
    .send({body: body})
    .end(function(err, res) {
      cb(err, res.body);
    });
}

function mergePr(number, cb) {
  request
    .put('https://api.github.com/repos/enomic/enomic/pulls/'+number+'/merge?access_token='+gh_oauth_token)
    .send({})
    .end(function(err, res) {
      cb(err, res.body);
    });
}

function getPr(number, cb) {
  request
    .get('https://api.github.com/repos/enomic/enomic/pulls/'+number+'?access_token='+gh_oauth_token)
    .end(function(err, res) {
      cb(err, res.body);
    });
}

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

app.post('/githubActivityHook/:secret', bodyParser.json(), function(req, res) {
  var prNumber = req.body.issue.number;
  var logger = new Logger();
  function end() {
    res.send();
    logger.save(function(err, url) {
     if (err) {
       return;
     }
     makePrComment(prNumber, 'Output is here: ' + url, function(err, body) {
       console.log(err || body);
     })
    })
  }
  if (process.env.GITHUB_HOOK_SECRET !== req.params.secret) {
    return end();
  }
  var commentBody = req.body.comment && req.body.comment.body;
  if (!commentBody) {
    // this was probably another event that we care less about
    return end();
  }
  var match = commentBody.match(/#approve\s([^\s]*)/);
  if (!match || !match[1]) {
    // comment did not have the #approve hashtag
    return end();
  }
  var signature = match[1];
  getPr(prNumber, function(err, pr) {
    if (err) {
      logger.error(err);
      return end();
    }
    var sha = pr.head.sha;
    if (pr.merged || !pr.mergeable) {
      logger.log('Has already been merged or is not mergable');
      return end();
    }
    if (pr.mergeable_state !== 'clean') {
      logger.log('Unclean merge state');
      return end();
    }
    if (!verify(sha, signature)) {
      logger.log('Signature verification failed');
      return end();
    }

    mergePr(prNumber, function(err, mergeInfo) {
      if (err) {
        logger.error(err);
        return end();
      }
      logger.log('Merge succeeded', mergeInfo)
      return end();
    });

  });
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
