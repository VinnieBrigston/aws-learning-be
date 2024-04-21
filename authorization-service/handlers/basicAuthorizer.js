require('dotenv').config();
const { GITHUB_ACCOUNT_LOGIN, TEST_PASSWORD } = process.env;

module.exports.basicAuthorizerHandler = async (event) => {
  const authorizationToken = event.headers.authorization;
  
  if (!authorizationToken) {
    throw 'Unauthorized';
  }

  const decodedToken = Buffer.from(authorizationToken.split(' ')[1], 'base64').toString('utf-8');
  const [username, password] = decodedToken.split(':');

  if (checkUserCredentials(username,password)) {
    return generatePolicy('user', 'Allow', event.routeArn);
  } else {
    return generatePolicy('user', 'Deny', event.routeArn);
  }
};

function checkUserCredentials(username, password) {
  return username === GITHUB_ACCOUNT_LOGIN && password === TEST_PASSWORD; 
}

function generatePolicy(principalId, effect, resource) {
  const authResponse = {};
  
  authResponse.principalId = principalId;
  if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  
  return authResponse;
}