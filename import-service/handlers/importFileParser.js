const csv = require('csv-parser');
const AWS = require('aws-sdk');
const { finished } = require("node:stream/promises");
const s3 = new AWS.S3();
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const queueName = 'catalogItemsQueue';

module.exports.importFileParserHandler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const params = {
    Bucket: bucket,
    Key: key
  };

  const records = [];

  try {
    const s3Stream = s3.getObject(params).createReadStream();
    s3Stream.pipe(csv())
      .on('data', (data) => {
        records.push(data);
      })
      .on('error', (error) => {
        console.error('Error processing CSV:', error);
      })

    await finished(s3Stream);
    const { QueueUrl } = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    const sendMessageParams = {
      QueueUrl: QueueUrl,
      Entries: records.map((record, index) => ({
        Id: `record${index}`,
        MessageBody: JSON.stringify(record),
      })),
    };
    try {
      const result = await sqs.sendMessageBatch(sendMessageParams).promise();
      console.log('Messages sent to SQS:', result);
    } catch (error) {
      console.error('Error sending messages to SQS:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};
