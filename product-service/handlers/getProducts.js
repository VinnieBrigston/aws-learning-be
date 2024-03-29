const AWS = require('aws-sdk');

module.exports.getProductsHandler = async (event) => {
  AWS.config.update({
    region: 'eu-west-1',
  });
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'aws_learning_products'
  };

  try {
    const productsData = await dynamoDB.scan(params).promise();
    
    // Fetch stock counts for each product
    const productsWithStocks = await Promise.all(productsData.Items.map(async (product) => {
      const stockParams = {
        TableName: 'aws_learning_stocks',
        KeyConditionExpression: 'product_id = :pid',
        ExpressionAttributeValues: {
          ':pid': product.id,
        },
      };
      
      const stockData = await dynamoDB.query(stockParams).promise();
      const stockCount = stockData.Items.length > 0 ? stockData.Items[0].count : 0;

      return {
        ...product,
        count: stockCount,
      };
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(productsWithStocks),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch products' }),
    };
  }
};
