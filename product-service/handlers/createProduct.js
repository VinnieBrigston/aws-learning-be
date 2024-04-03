const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.createProductHandler = async (event) => {
  const { title, description, price } = JSON.parse(event.body);

  // Validate input
  if (!title || !description || !price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  const numericPrice = parseFloat(price);

  if (isNaN(numericPrice)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Price must be a valid number' }),
    };
  }

  const id = uuidv4();
  const params = {
    TableName: 'aws_learning_products',
    Item: {
      id,
      title,
      description,
      price:numericPrice,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ id, title, description, price }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create product' }),
    };
  }
};
