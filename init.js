var exec = require('child_process').execFile;
var os = require('os');
var fs = require('fs');
var path = require('path');

function createKeyPair(cb) {
  var tmpDir = os.tmpdir();
  var tmpKeyName = Buffer('' + Math.floor(Math.rand * 1000000)).toString('base64');
  var privateKeyFile = path.join(tmpDir, tmpKeyName + '.key');
  var publicKeyFile = path.join(tmpDir, tmpKeyName + '.pub');
  var outName = path.join(tmpDir, tmpKeyName + '.*');
  function warnIfError(err) {
    if (err) {
      console.warn(err);
    }
  }
  function cleanupCallback(err, priv, pub) {
    fs.unlink(privateKeyFile, warnIfError);
    fs.unlink(publicKeyFile, warnIfError);
    cb(err, priv, pub);
  }
  exec('openssl', [
    'genrsa',
    '-out',
    privateKeyFile,
    '2048'
  ], function(err) {
    if (err) return cleanupCallback(err);
    exec('openssl', [
      'req',
      '-key',
      privateKeyFile,
      '-new',
      '-x509',
      '-out',
      publicKeyFile,
      '-subj',
      '/C=../ST=./L=./CN=.',
    ], function(err, stdout, stderr) {
      if (err) return cleanupCallback(err);
      fs.readFile(privateKeyFile, {encoding: 'utf8'}, function(err, privateKey) {
        if (err) return cleanupCallback(err);
        fs.readFile(publicKeyFile, {encoding: 'utf8'}, function(err, publicKey) {
          if (err) return cleanupCallback(err);
          return cleanupCallback(null, privateKey, publicKey);
        });
      });
    });
  });
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var secretKeyFile = process.env.ENOMIC_SECRET_KEY || path.join(getUserHome(), '.enomic_secret_key');
var publicKeyFile = process.env.ENOMIC_PUBLIC_KEY || path.join(getUserHome(), '.enomic_public_key');

createKeyPair(function(err, secretKey, publicKey) {

  if (err != null) {
    console.log ("Ran into an error: ");
    console.log(err);
    return;
  }
  
  fs.writeFileSync(secretKeyFile, secretKey, {encoding: 'utf8'});
  fs.writeFileSync(publicKeyFile, publicKey, {encoding: 'utf8'});
  console.log('===============================================');
  console.log('Created key pair:');
  console.log(secretKeyFile);
  console.log(publicKeyFile);
  console.log('===============================================');
  console.log('Public key:')
  console.log(publicKey);
});
