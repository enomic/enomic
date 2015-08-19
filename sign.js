var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var FS_ENCODING = {encoding: 'utf8'};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var secretKeyFile = process.env.ENOMIC_SECRET_KEY || path.join(getUserHome(), '.enomic_secret_key');
var publicKeyFile = process.env.ENOMIC_PUBLIC_KEY || path.join(getUserHome(), '.enomic_public_key');

var secretKey = fs.readFileSync(secretKeyFile, FS_ENCODING);
var publicKey = fs.readFileSync(publicKeyFile, FS_ENCODING);

var commitId = process.argv[2];
var signer = crypto.createSign('RSA-SHA256');
signer.update(commitId);
var signature = signer.sign(secretKey, 'hex');

console.log('#approve '+signature);
