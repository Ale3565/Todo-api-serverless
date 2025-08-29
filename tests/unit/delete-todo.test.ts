import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import { handler } from '../../src/lambda/handlers/delete-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudWatchMock = mockClient(CloudWatchClient);

describe('delete-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    cloudWatchMock.reset();
    
   
    ddbMock.on(DeleteCommand).resolves({});
    cloudWatchMock.on(PutMetricDataCommand).resolves({});
  });

  it('should delete todo successfully', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
    expect(result.body).toBe('');
    expect(ddbMock.commandCalls(DeleteCommand).length).toBe(1);
  });

  it('should return 400 when id parameter is missing', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: null,
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('MISSING_ID');
  });

  it('should return 404 when todo not found', async () => {
    
    const conditionalError = new Error('The conditional request failed');
    (conditionalError as any).name = 'ConditionalCheckFailedException';
    ddbMock.on(DeleteCommand).rejects(conditionalError);

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      httpMethod: 'DELETE',
      path: '/todos/999'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('NOT_FOUND');
  });

  it('should handle DynamoDB errors', async () => {
    ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('INTERNAL_ERROR');
  });
});