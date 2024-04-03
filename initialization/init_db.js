const AWS = require('aws-sdk');
const fs = require('fs');

const credentialsFromConfig = new AWS.SharedIniFileCredentials({profile: 'awsLearning'});

AWS.config.update({
  region: 'eu-west-1',
  credentials: credentialsFromConfig
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
const stocks = JSON.parse(fs.readFileSync('stocks.json', 'utf-8'));

// Function to insert a product into the aws_learning_products table
const addProduct = async (product) => {
  const {id, title, description, price} = product;
  const params = {
    TableName: 'aws_learning_products',
    Item: {
      id,
      title,
      description,
      price
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Product added: ${product.title}`);
  } catch (error) {
    console.error(`Error adding product: ${error.message}`);
  }
};

// Function to insert stock information into the aws_learning_stocks table
const addStock = async (stock) => {
  const {product_id, count} = stock;
  const params = {
    TableName: 'aws_learning_stocks',
    Item: {
      product_id,
      count
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Stock added for product: ${product_id}`);
  } catch (error) {
    console.error(`Error adding stock: ${error.message}`);
  }
};

// Populate the tables
const populateTables = async () => {
  // Add products
  for (const product of products) {
    await addProduct(product);
  }

  // // Add stocks (using example product IDs)
  for (const stock of stocks) {
    await addStock(stock);
  }
};

// Execute the function
populateTables();
