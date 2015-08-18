// controllers/index.js

(function (controllers) {

    var githubController = require("./githubController");
    
    controllers.init = function (app) {
        githubController.init(app);
    };
    
})(module.exports);
