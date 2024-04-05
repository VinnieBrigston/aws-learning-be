const csv = require('csv-parser');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.importFileParserHandler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    const s3Stream = s3.getObject(params).createReadStream();
    s3Stream.pipe(csv())
      .on('data', (data) => {
        console.log(data);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      })
      .on('error', (error) => {
        console.error('Error processing CSV:', error);
      });

  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};
