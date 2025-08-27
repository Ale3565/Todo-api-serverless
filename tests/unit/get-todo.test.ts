import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

import { handler } from '../../src/lambda/handlers/get-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('get-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should get a todo successfully', async () => {
    
    const mockTodo = {
      todoId: '123',
      title: 'Test Todo',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    ddbMock.on(GetCommand).resolves({ Item: mockTodo });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'GET',
      path: '/todos/123'
    };

    
    const result = await handler(event as APIGatewayProxyEvent);

    
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todoId).toBe('123');
  });

  it('should return 404 when todo not found', async () => {
    
    ddbMock.on(GetCommand).resolves({});

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      httpMethod: 'GET',
      path: '/todos/999'
    };

    
    const result = await handler(event as APIGatewayProxyEvent);

    
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('NOT_FOUND');
  });
});