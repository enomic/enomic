var request = require('superagent');

var gh_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

var Logger = module.exports = function(options) {

 // if (!options.key) throw new Error('Need OauthKey');

 var logs = [];

 this.log = function log(x) {
  logs.push(x);
  console.log(x);
 }

 this.error = function error(x) {
  logs.push(x);
  console.error(x);
 }

 this.warn = function warn(x) {
  logs.push(x);
  console.warn(x);
 }

 this.save = function save(cb) {
   request
    .post('https://api.github.com/gists?access_token='+gh_oauth_token)
    .send({
      description: "Enomic dump",
      public: true,
      files: {
        "dump.txt": {
          "content": logs.join('\n')
        }
      }
     })
    .end(function (err, res) {
     if (err) {
      console.log(err);
      return cb(err);
     }

     cb(null, res.body.html_url);
    });

 }

 return this;
}

if (module === require.main) {
 var logger = new Logger();
 logger.log('Hello world!');
 logger.save(console.log);
}
