var AWS = require('aws-sdk'),
    Readable = require('stream').Readable,
    Transform = require('stream').Transform;

module.exports = function(s3Config) {
  var s3 = new AWS.S3(s3Config);

  var getObject = new Transform({objectMode: true});
  getObject._transform = function (data, encoding, callback) {
    s3.getObject({Bucket: data.bucket, Key: data.key}, function(err, response) {
      if (err) return callback(err);
      return callback(null, {key: data.key, body: response.Body});
    });
  };

  return {
    /*
     * Output: An object stream representing objects in the
     * bucket, according to the given params. Of the form {key: 'blah', bucket:
     * 'blah'}
     * See the doco for AWS:S3 listObjects() for possible params.
     */
    objectKeys: function(params) {

      var response,
          error,
          count = 0;

      function read() {
        console.log('read()');
        console.log('count', count);
        var me = this;
        // If we haven't called listObjects yet...
        if (!error && !response) {
            console.log('calling s3.listObjects()', params);
          return s3.listObjects(params, function(err, data) {
            console.log('called s3.listObjects()', data);
            error = err;
            response = data;
            return read.call(me);
          });
        }

        // If there was an error calling listObjects...
        if (error) {
          console.log('error', error);
          return this.emit('error', error);
        }

        if (response.Contents.length === 0) {
          var err = new Error();
          err.name = 'NoSuchPrefix';
          console.log('error', err);
          return this.emit('error', err);
        }

        console.log('Contents.length', response.Contents.length);
        // Normal case, emit some data.
        if (count < response.Contents.length) {
          console.log('push data');
          var chunk = {key: response.Contents[count].Key, bucket: params.Bucket};
          count++;
          return this.push(chunk);
        }

        // We're all out of data!
        console.log('end!');
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
    getObject: getObject
  };
};


// vim: set et sw=2 colorcolumn=80:
