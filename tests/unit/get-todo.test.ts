// Set up environment first
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';

// Mock the DynamoDB and CloudWatch utilities
jest.mock('../../src/lambda/utils/dynamodb');
jest.mock('../../src/lambda/utils/cloudwatch');

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambda/handlers/get-todo';
import { dynamoDb } from '../../src/lambda/utils/dynamodb';
import { publishMetric } from '../../src/lambda/utils/cloudwatch';

// Get mocked instances
const mockDynamoDb = dynamoDb as jest.Mocked<typeof dynamoDb>;
const mockPublishMetric = publishMetric as jest.MockedFunction<typeof publishMetric>;

describe('get-todo handler', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock behaviors
    mockPublishMetric.mockResolvedValue(undefined);
  });

  it('should get a todo successfully', async () => {
    const mockTodo = {
      todoId: '123',
      title: 'Test Todo',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    mockDynamoDb.send.mockResolvedValueOnce({ Item: mockTodo });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'GET',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todoId).toBe('123');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
    expect(mockPublishMetric).toHaveBeenCalledWith('TodoRetrievedCount', 1);
  });

  it('should return 404 when todo not found', async () => {
    mockDynamoDb.send.mockResolvedValueOnce({ Item: undefined });

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      httpMethod: 'GET',
      path: '/todos/999'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('NOT_FOUND');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });

  it('should return 400 when id parameter is missing', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: null,
      httpMethod: 'GET',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('MISSING_ID');
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
  });

  it('should handle DynamoDB errors', async () => {
    mockDynamoDb.send.mockRejectedValueOnce(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'GET',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DB_ERROR');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });
});