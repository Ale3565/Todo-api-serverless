import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import { handler } from '../../src/lambda/handlers/list-todos';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudWatchMock = mockClient(CloudWatchClient);

describe('list-todos handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    cloudWatchMock.reset();
    
    // Setup default CloudWatch mock
    cloudWatchMock.on(PutMetricDataCommand).resolves({});
  });

  it('should list todos successfully', async () => {
    const mockTodos = [
      { todoId: '1', title: 'Todo 1', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
      { todoId: '2', title: 'Todo 2', completed: true, createdAt: '2023-01-02T00:00:00.000Z' }
    ];

    ddbMock.on(ScanCommand).resolves({ Items: mockTodos });

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todos).toHaveLength(2);
    expect(JSON.parse(result.body).data.count).toBe(2);
    expect(ddbMock.commandCalls(ScanCommand).length).toBe(1);
  });

  it('should return empty array when no todos exist', async () => {
    ddbMock.on(ScanCommand).resolves({ Items: [] });

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todos).toHaveLength(0);
    expect(JSON.parse(result.body).data.count).toBe(0);
  });

  it('should handle DynamoDB errors', async () => {
    ddbMock.on(ScanCommand).rejects(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('INTERNAL_ERROR');
  });

  it('should sort todos by creation date (newest first)', async () => {
    const mockTodos = [
      { todoId: '1', title: 'Old Todo', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
      { todoId: '2', title: 'New Todo', completed: true, createdAt: '2023-01-03T00:00:00.000Z' },
      { todoId: '3', title: 'Middle Todo', completed: false, createdAt: '2023-01-02T00:00:00.000Z' }
    ];

    ddbMock.on(ScanCommand).resolves({ Items: mockTodos });

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);
    const responseData = JSON.parse(result.body).data;

    expect(result.statusCode).toBe(200);
    expect(responseData.todos[0].title).toBe('New Todo'); 
    expect(responseData.todos[1].title).toBe('Middle Todo');
    expect(responseData.todos[2].title).toBe('Old Todo'); 
  });
});