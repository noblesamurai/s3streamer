var AWS = require('aws-sdk'),
    es = require('event-stream'),
    streamify = require('stream-array');

module.exports = function(s3Config) {
  var s3 = new AWS.S3(s3Config);

  return {
    /*
     * Output: An object stream representing objects in the
     * bucket, according to the given params. Of the form {key: 'blah', bucket:
     * 'blah'}
     * See the doco for AWS:S3 listObjects() for possible params.
     */
    objectKeys: function(params) {

      var response,
          error;

      function read(count, callback) {
        var me = this;
        // If we haven't called listObjects yet...
        if (!error && !response) {
          return s3.listObjects(params, function(err, data) {
            error = err;
            response = data;
            read.call(me, count, callback);
          });
        }

        // If there was an error calling listObjects...
        if (error) {
          return callback(error);
        }

        // Normal case, emit some data.
        if (count < response.Contents.length) {
          return callback(null, {key: response.Contents[count].Key, bucket: params.Bucket});
        }

        // We're all out of data!
        return this.emit('end');
      }

      return es.readable(read);
    },

    /*
     * Input: A stream of object keys (strings).
     * Output: An object stream containing the key and body of those objects,
     * fetched from S3.
     */
    getObject: es.map(function (params, callback) {
      s3.getObject({Bucket: params.bucket, Key: params.key}, function(err, data) {
        if (err) return callback(err);
        return callback(null, {key: params.key, body: data.Body});
      });
    })
  };
};


// vim: set et sw=2 colorcolumn=80:
