# s3streamer

Stream objects from S3.

[![build status](https://secure.travis-ci.org/timothyleslieallen/s3streamer.png)](http://travis-ci.org/timothyleslieallen/s3streamer)

## Installation

This module is installed via npm:

``` bash
$ npm install s3streamer
```

## Example Usage

``` js
var s3streamer = require('s3streamer')(s3credentials);

var objectKeys = s3stream.objectKeys({Bucket: process.env.BUCKET, Prefix: 'myprefix'});
// {key: 'blah', bucket: 'thebucketyougave'}, ...

var getObjects = objectKeys.pipe(s3streamer.getObject);
// {key: 'blah', body: 'contents...'}, ...

```
s3credentials are passed in to: `new AWS:S3(s3credentials)`, cf Amazon doco here: (http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

## Tests
To run the tests you will need some valid S3 credentials and a corresponding bucket.  Ensure the bucket has at least one object with a key prefixed by `exists`.
 Run like so:
``` js
S3_REGION='us-east-1' S3_ACCESS_KEY_ID='mykeyid' S3_SECRET_ACCESS_KEY='mysecretaccesskey' BUCKET='mybucket' npm test
```
