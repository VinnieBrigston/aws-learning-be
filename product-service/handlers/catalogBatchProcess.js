const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.catalogBatchProcessHandler = async (event) => {
    const products = event.Records.map((record) => {
      const { title, description, price } = JSON.parse(record.body);
      const numericPrice = parseFloat(price);
  
      if (!title || !description || isNaN(numericPrice)) {
        console.error('Invalid message:', record.body);
        return null;
      }
  
      const id = uuidv4();
      return {
        id,
        title,
        description,
        price: numericPrice,
      };
    }).filter(Boolean);
  
    if (products.length === 0) {
      console.log('No valid products to process.');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No valid products to process.' }),
      };
    }

    const snsParams = {
        Message: 'New products have been created',
        TopicArn: 'arn:aws:sns:eu-west-1:992382618752:createProductTopic'
      };
  
    await sns.publish(snsParams).promise();

    try {
      for (const product of products) {
        const params = {
          TableName: 'aws_learning_products',
          Item: product,
        };
        await dynamoDB.put(params).promise();
      }
    } catch (error) {
      console.error('Error saving products:', error);
      throw error;
    }
}