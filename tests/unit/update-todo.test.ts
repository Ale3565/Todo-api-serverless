
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';


jest.mock('../../src/lambda/utils/dynamodb');
jest.mock('../../src/lambda/utils/cloudwatch');

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambda/handlers/update-todo';
import { dynamoDb } from '../../src/lambda/utils/dynamodb';
import { publishMetric } from '../../src/lambda/utils/cloudwatch';


const mockDynamoDb = dynamoDb as jest.Mocked<typeof dynamoDb>;
const mockPublishMetric = publishMetric as jest.MockedFunction<typeof publishMetric>;

describe('update-todo handler', () => {
  beforeEach(() => {
    
    jest.clearAllMocks();
    
    
    mockPublishMetric.mockResolvedValue(undefined);
  });

  it('should update todo successfully', async () => {
    const updatedTodo = {
      todoId: '123',
      title: 'Updated Todo',
      completed: true,
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    mockDynamoDb.send.mockResolvedValueOnce({ Attributes: updatedTodo });

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
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
    expect(mockPublishMetric).toHaveBeenCalledWith('TodoUpdatedCount', 1);
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
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
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
  });

  it('should return 404 when todo not found', async () => {
    const conditionalError = new Error('The conditional request failed');
    (conditionalError as any).name = 'ConditionalCheckFailedException';
    mockDynamoDb.send.mockRejectedValueOnce(conditionalError);

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      body: JSON.stringify({ title: 'Updated Todo' }),
      httpMethod: 'PUT',
      path: '/todos/999'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('TODO_NOT_FOUND');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });

  it('should handle DynamoDB errors', async () => {
    mockDynamoDb.send.mockRejectedValueOnce(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ title: 'Updated Todo' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DB_ERROR');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });

  it('should update only description', async () => {
    const updatedTodo = {
      todoId: '123',
      description: 'New description',
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    mockDynamoDb.send.mockResolvedValueOnce({ Attributes: updatedTodo });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ description: 'New description' }),
      httpMethod: 'PUT',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });
});