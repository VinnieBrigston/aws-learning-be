const products = require('../mock/products.json');

module.exports.getProductsHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};