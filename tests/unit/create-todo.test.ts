import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

import { handler } from '../../src/lambda/handlers/create-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudWatchMock = mockClient(CloudWatchClient);

describe('create-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    cloudWatchMock.reset();
  });

  it('should create a todo successfully', async () => {
    
    ddbMock.on(PutCommand).resolves({});
    cloudWatchMock.on().resolves({});

    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({
        title: 'Test Todo',
        description: 'Test Description'
      }),
      httpMethod: 'POST',
      path: '/todos'
    };

    
    const result = await handler(event as APIGatewayProxyEvent);

    
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.title).toBe('Test Todo');
    expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
  });

  it('should return 400 when title is missing', async () => {
    
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({}),
      httpMethod: 'POST',
      path: '/todos'
    };

    
    const result = await handler(event as APIGatewayProxyEvent);

    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).success).toBe(false);
    expect(JSON.parse(result.body).error).toBe('INVALID_TITLE');
  });

  it('should return 400 when body is invalid JSON', async () => {
    
    const event: Partial<APIGatewayProxyEvent> = {
      body: 'invalid json',
      httpMethod: 'POST',
      path: '/todos'
    };

   
    const result = await handler(event as APIGatewayProxyEvent);

    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('INVALID_JSON');
  });
});