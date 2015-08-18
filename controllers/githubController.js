// controllers/githubController.js

(function (githubController) {
    
    var request = require('superagent');
    var verify = require('../verify');
    
    
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
    
    githubController.init = function (app) {
        
        app.post('/githubActivityHook/:secret', bodyParser.json(), function(req, res) {
          function end() {
            res.send();
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
          var prNumber = req.body.issue.number;
          getPr(prNumber, function(err, pr) {
            if (err) {
              console.error(err);
              return end();
            }
            var sha = pr.head.sha;
            if (pr.merged || !pr.mergeable) {
              console.log('Has already been merged or is not mergable');
              return end();
            }
            if (pr.mergeable_state !== 'clean') {
              console.log('Unclean merge state');
              return end();
            }
            if (!verify(sha, signature)) {
              console.log('Signature verification failed');
              return end();
            }
        
            mergePr(prNumber, function(err, mergeInfo) {
              if (err) {
                console.error(err);
                return end();
              }
              console.log('Merge succeeded', mergeInfo)
              return end();
            });
        
          });
        });
    };
})(module.exports);
