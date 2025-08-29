
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';
process.env.AWS_REGION = 'local';
process.env.AWS_REQUEST_ID = 'test-request-id';

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

export const ddbMock = mockClient(DynamoDBDocumentClient);
export const cloudWatchMock = mockClient(CloudWatchClient);

ddbMock.resolves({});
cloudWatchMock.resolves({});

beforeEach(() => {
  
  ddbMock.reset();
  cloudWatchMock.reset();
  cloudWatchMock.resolves({});
});