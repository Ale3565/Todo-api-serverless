import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../src/lambda/handlers/list-todos';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('list-todos handler', () => {
  beforeEach(() => {
    ddbMock.reset();
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
  });
});