var expect = require('expect.js');
var s3Config = {
  region: process.env.S3_REGION,
  maxRetries: 15,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
};

describe('s3streamer', function() {
  describe('objectKeys', function() {
    it('emits an error when cannot connect', function(done) {
      var s3stream = require('..')({});
      var stream = s3stream.objectKeys({Bucket: 'mybucket', Prefix: 'it'});

      expect(stream).to.be.ok();
      stream.on('error', function(err) {
        expect(err).to.be.an(Error);
        done();
      });
    });
    it('bucket does exist no data to emit', function(done) {
      this.timeout(10000);

      var s3stream = require('..')(s3Config),
          stream = s3stream.objectKeys({Bucket: process.env.BUCKET, Prefix: 'dose_not_exists_atLal_all'});
      stream.on('end', done);
    });
    it('bucket does exist, data to emit', function(done) {
      this.timeout(10000);

      var s3stream = require('..')(s3Config),
          stream = s3stream.objectKeys({Bucket: process.env.BUCKET, Prefix: 'exists'});
      stream.on('data', function(data) {
        expect(data).to.be.an(Object);
        expect(data).to.have.keys('key', 'bucket');
        done();
      });
    });
  });
  describe('getObject', function() {
    this.timeout(10000);
    it('gets the objects', function(done) {
      var s3stream = require('..')(s3Config),
          objectKeys = s3stream.objectKeys({Bucket: process.env.BUCKET, Prefix: 'exists'});
      objectKeys.pipe(s3stream.getObject).on('data', function(data) {
        expect(data).to.be.an(Object);
        expect(data).to.have.keys('key', 'body');
        done();
      });
    });
  });
});

// vim: set et sw=2:
