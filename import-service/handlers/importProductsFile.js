const { S3 } = require('aws-sdk');

module.exports.importProductsFileHandler = async (event) => {
  const s3 = new S3({
    region: 'eu-west-1',
  });
  const { queryStringParameters: { name } } = event;
  if(!name){
    return {
      statusCode: 400,
      body: 'Please specify a file name',
    };
  }
  const myBucket = 'aws-js-learning-import-csv';
  const myKey = `uploaded/${name}`;

  const params = {
    Bucket: myBucket,
    Key: myKey,
    Expires: 60,
    ContentType: 'text/csv',
  };

  const url = s3.getSignedUrl('putObject', params);
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
};