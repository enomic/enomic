// controllers/githubController.js

var gh_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

(function (githubController) {
    
    var request = require('superagent');
    var verify = require('../verify');
    var Logger = require('../Logger');
    var bodyParser = require('body-parser');
    
    var mergePr = function (number, cb) {
      request
        .put('https://api.github.com/repos/enomic/enomic/pulls/'+number+'/merge?access_token='+gh_oauth_token)
        .send({})
        .end(function(err, res) {
          cb(err, res.body);
        });
    }
    
    var getPr = function (number, cb) {
      request
        .get('https://api.github.com/repos/enomic/enomic/pulls/'+number+'?access_token='+gh_oauth_token)
        .end(function(err, res) {
          cb(err, res.body);
        });
    }
    
    var makePrComment = function (number, body, cb) {
      request
        .post('https://api.github.com/repos/enomic/enomic/issues/'+number+'/comments?access_token='+gh_oauth_token)
        .send({body: body})
        .end(function(err, res) {
          cb(err, res.body);
        });
    }
    
    githubController.init = function (app) {

        app.post('/githubActivityHook/:secret', bodyParser.json(), function(req, res) {
          if (!req.body || !req.body.issue) {
            return res.send();
          }
          var prNumber = req.body.issue.number;
          var logger = new Logger();
          function end(message) {
            res.send();
            logger.save(function(err, url) {
             if (err) {
               return;
             }

             var comment = message ? message + '\n\n' : '';

             comment += 'Output is here: ' + url;

             makePrComment(prNumber, comment, function(err, body) {
               console.log(err || body);
             })
            })
          }
          if (process.env.GITHUB_HOOK_SECRET !== req.params.secret) {
            return res.send();
          }
          var commentBody = req.body.comment && req.body.comment.body;
          if (!commentBody) {
            // this was probably another event that we care less about
            return res.send();
          }
          var match = commentBody.match(/#approve\s([^\s]*)/);
          if (!match || !match[1]) {
            // comment did not have the #approve hashtag
            return res.send();
          }
          var signature = match[1];
          getPr(prNumber, function(err, pr) {
            if (err) {
              logger.error(err);
              return end('Error getting the pull request');
            }
            var sha = pr.head.sha;
            if (pr.merged || !pr.mergeable) {
              logger.log('Has already been merged or is not mergable');
              return end('Already merged');
            }
            if (pr.mergeable_state !== 'clean') {
              logger.log('Unclean merge state');
              return end('PR is not mergeable');
            }
            if (!verify(sha, signature, logger)) {
              logger.log('Signature verification failed');
              return end('Signature verification failed');
            }
        
            mergePr(prNumber, function(err, mergeInfo) {
              if (err) {
                logger.error(err);
                return end('Error merging');
              }
              logger.log('Merge succeeded', mergeInfo)
              return end('Merged!');
            });
        
          });
        });
    };
})(module.exports);
