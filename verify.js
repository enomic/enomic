var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var FS_ENCODING = {encoding: 'utf8'};

function verify(commitId, signature, logger) {
  var verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(commitId);
  for (var i = 0; i < adminIds.length; i++) {
    var adminId = adminIds[i];
    logger.log(commitId, signature, adminId);
    try {
      if (verifier.verify(new Buffer(adminId), signature, 'hex')) {
        return adminId;
      }
    } catch (e) {}
  }
  return false;
}

var CERT_BEGIN = '-----BEGIN CERTIFICATE-----';
var CERT_END = '-----END CERTIFICATE-----';

var adminIdsRaw = fs.readFileSync('./heroIds.txt', FS_ENCODING);
var adminIds = [];

adminIdsRaw.split(CERT_BEGIN).map(function(certWithEnd) {
  var certSplitByEnd = certWithEnd.split(CERT_END);
  if (certSplitByEnd.length > 1) {
    adminIds.push(CERT_BEGIN + certSplitByEnd[0] + CERT_END);
  }
});

if(require.main === module) {
  var commitId = process.argv[2];
  var signature = process.argv[3];
  console.log('VERIFY: ', verify(commitId, signature));
}

module.exports = verify;
