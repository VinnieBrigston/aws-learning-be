const products = require('../mock/products.json');

module.exports.getProductByIdHandler = async (event) => {
  const { pathParameters: { id } } = event;
  const product = products.find(product => product.id === id);
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
};