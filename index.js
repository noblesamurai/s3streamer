var AWS = require('aws-sdk');
var Readable = require('stream').Readable;

var es = require('event-stream');


module.exports = function(s3Config) {
  var s3 = new AWS.S3(s3Config);

  return {
    /*
     * Output: An object stream representing the objects in the bucket, according
     * to the given params. Of the form * {key: 'blah', body: Buffer}.
     * See the doco for AWS:S3 listObjects() for possible params.
     */
    listObjects: function(params) {
      var rs = Readable();

      s3.listObjects(params, gotObjects);
     
      function gotObjects(err, data) {
        if (err) return rs.error(err);
        es.data.Contents.forEach(function(object) {
          rs.emit({key: object.Key});
        });
        rs.end();
      }

      return rs;
    },

    /*
     * Input: An object stream of object keys: {key: 'blah'}
     * Output: An object stream containing the key and body of those objects,
     * fetched from S3.
     */
    getObject: es.map(function (data, callback) {
      s3.getObject({Key: data.key}, function(err, data) {
        if (err) return callback(err);
        callback(null, {key: key, body: data.Body});
      });
    })
  };
};


// vim: set et sw=2 colorcolumn=80:
