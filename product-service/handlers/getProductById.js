const AWS = require('aws-sdk');;

module.exports.getProductByIdHandler = async (event) => {
  AWS.config.update({
    region: 'eu-west-1',
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'aws_learning_products'
  };
  const { pathParameters: { id } } = event;
  
  try {
    const data = await dynamoDB.scan(params).promise();
    const product = data.Items.find(product => product.id === id);
    if(!product){
      return {
        statusCode: 400,
        body: 'Product is not found',
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch products' }),
    };
  }
};