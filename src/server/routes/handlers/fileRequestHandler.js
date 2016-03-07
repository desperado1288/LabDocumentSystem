/**
 * Created by dingyi on 2/24/16.
 */
/* jshint node: true */
'use strict';

var fs = require('fs');
var Busboy = require('busboy');
var Q = require('q');
var Logger = require('../../utils/log-manager').Logger;
var logger = new Logger();
var fileSystemPath = global.projectPath + '/user_uploads/';
module.exports = {
  uploadFile: uploadFile,
  downloadFile: downloadFile
};

function uploadFile(req) {
  var dfd = Q.defer();
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    if (fieldname === 'username') {
      if (val === '' || val.search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {//check if username is valid
        logger.error('username is invalid!');
        dfd.reject({ status: 500, message: 'username is invalid' });
      }else {
        req.username = val;
      }
    }
  });

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    if (req.username === undefined) {
      logger.error('username is invalid, cannot upload files');
      dfd.reject({ status: 500, message: 'username is invalid' });
      file.resume();
      return;
    }

    //return will block the callback (solved by file.resume())
    if (filename === '' || filename.search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {
      logger.error('filename is invalid, cannot upload files');
      file.resume();//discard the content streams, let the finish event fired
      dfd.reject({ status: 500, message: 'filename is invalid' });
      return;
    }
    var path = fileSystemPath + req.username + '/';
    fs.access(path, function (err) {
      logger.error(err ? 'no access!' : 'can read/write');
      if (err) {
        logger.write('no access, making directory now!');
        fs.mkdir(path, function (err) {
          if (!err) {
            file.pipe(fs.createWriteStream(path + filename));
          } else {
            logger.error(err);
            dfd.reject({ status: 500, message: 'cannot make user directory' });
          }
        });
      }else {
        file.pipe(fs.createWriteStream(path + filename));
      }
    });
  });

  busboy.on('error', function (err) {
    dfd.reject({ status: 500, message: 'saving file failed' });
  });

  busboy.on('finish', function () {
    dfd.resolve();
  });
  req.pipe(busboy);
  return dfd.promise;
}

function downloadFile(req) {

}
