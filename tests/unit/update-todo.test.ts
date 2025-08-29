import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import { handler } from '../../src/lambda/handlers/update-todo';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cloudWatchMock = mockClient(CloudWatchClient);

describe('update-todo handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    cloudWatchMock.reset();
    
    
    cloudWatchMock.on(PutMetricDataCommand).resolves({});
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
    expect(JSON.parse(result.body).data.title).toBe('Updated Todo');
    expect(ddbMock.commandCalls(UpdateCommand).length).toBe(1);
  });

  it('should return 400 when id parameter is missing', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: null,
      body: JSON.stringify({ title: 'Updated Todo' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('MISSING_ID');
  });

  it('should return 400 when body is missing', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: null,
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('MISSING_BODY');
  });

  it('should return 400 when body is invalid JSON', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: 'invalid json',
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('INVALID_JSON');
  });

  it('should return 400 when no valid fields to update', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({}),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('NO_UPDATES');
  });

  it('should return 400 when title is empty string', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ title: '' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('INVALID_TITLE');
  });

  it('should return 400 when completed is not boolean', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ completed: 'true' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('INVALID_COMPLETED');
  });

  it('should return 404 when todo not found', async () => {
    
    const conditionalError = new Error('The conditional request failed');
    (conditionalError as any).name = 'ConditionalCheckFailedException';
    ddbMock.on(UpdateCommand).rejects(conditionalError);

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      body: JSON.stringify({ title: 'Updated Todo' }),
      httpMethod: 'PUT',
      path: '/todos/999'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('NOT_FOUND');
  });

  it('should handle DynamoDB errors', async () => {
    ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ title: 'Updated Todo' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('INTERNAL_ERROR');
  });

  it('should update only description', async () => {
    const updatedTodo = {
      todoId: '123',
      description: 'New description',
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    ddbMock.on(UpdateCommand).resolves({ Attributes: updatedTodo });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ description: 'New description' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
  });
});