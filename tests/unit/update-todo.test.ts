import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../src/lambda/handlers/update-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('update-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should update todo successfully', async () => {
    const updatedTodo = {
      todoId: '123',
      title: 'Updated Todo',
      completed: true,
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    ddbMock.on(UpdateCommand).resolves({ Attributes: updatedTodo });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ title: 'Updated Todo', completed: true }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
  });
});