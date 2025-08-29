import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';


process.env.TABLE_NAME = 'TestTodos';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_REQUEST_ID = 'test-request-id';


const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudWatchMock = mockClient(CloudWatchClient);


beforeEach(() => {
  ddbMock.reset();
  cloudWatchMock.reset();
});


export { ddbMock, cloudWatchMock };