import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../src/lambda/handlers/delete-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('delete-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should delete todo successfully', async () => {
    ddbMock.on(DeleteCommand).resolves({});

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
  });
});