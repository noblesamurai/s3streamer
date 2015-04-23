var AWS = require('aws-sdk'),
    Readable = require('stream').Readable,
    Transform = require('stream').Transform;

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

      var listObjectsResponse,
          error,
          count = 0;

      function read() {
        var me = this;
        // If we haven't called listObjects yet...
        if (!error && !listObjectsResponse) {
          return s3.listObjects(params, function(err, data) {
            error = err;
            listObjectsResponse = data;
            return read.call(me);
          });
        }

        // If there was an error calling listObjects...
        if (error) {
          return this.emit('error', error);
        }

        if (listObjectsResponse.Contents.length === 0) {
          var err = new Error();
          err.name = 'NoSuchPrefix';
          return this.emit('error', err);
        }

        // Normal case, emit some data.
        if (count < listObjectsResponse.Contents.length) {
          var chunk = {key: listObjectsResponse.Contents[count].Key, bucket: params.Bucket};
          count++;
          return this.push(chunk);
        }

        // We're all out of data!
        return this.push(null);
      }

      var stream = new Readable({objectMode: true});
      stream._read = read;
      return stream;
    },

    /*
     * Input: A stream of object keys (strings).
     * Output: An object stream containing the key and body of those objects,
     * fetched from S3.
     */
    getObject: function() {
      var stream = new Transform({objectMode: true});
      stream._transform = function (data, encoding, callback) {
        s3.getObject({Bucket: data.bucket, Key: data.key}, function(err, response) {
          if (err) return callback(err);
          return callback(null, {key: data.key, body: response.Body});
        });
      };
      return stream;
    }
  };
};


// vim: set et sw=2 colorcolumn=80:
