
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-cloudwatch');


process.env.TABLE_NAME = 'TestTodos';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_REQUEST_ID = 'test-request-id';