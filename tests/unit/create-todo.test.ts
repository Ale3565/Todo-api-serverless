// Set up environment first
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';

// Mock the DynamoDB and CloudWatch utilities
jest.mock('../../src/lambda/utils/dynamodb');
jest.mock('../../src/lambda/utils/cloudwatch');

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambda/handlers/create-todo';
import { dynamoDb } from '../../src/lambda/utils/dynamodb';
import { publishMetric } from '../../src/lambda/utils/cloudwatch';

// Get mocked instances
const mockDynamoDb = dynamoDb as jest.Mocked<typeof dynamoDb>;
const mockPublishMetric = publishMetric as jest.MockedFunction<typeof publishMetric>;

describe('CreateTodo Lambda', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock behaviors
    mockPublishMetric.mockResolvedValue(undefined);
  });

  const mockEvent = {
    body: JSON.stringify({
      title: 'Test todo',
      description: 'Test description'
    }),
    headers: {},
    httpMethod: 'POST',
    path: '/todos',
    queryStringParameters: null,
    pathParameters: null,
    requestContext: {
      requestId: 'test-request-id'
    }
  } as APIGatewayProxyEvent;

  it('should create a todo successfully', async () => {
    mockDynamoDb.send.mockResolvedValueOnce({});

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(201);
    
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('todoId');
    expect(body.data.title).toBe('Test todo');
    expect(body.data.description).toBe('Test description');
    expect(body.data).toHaveProperty('createdAt');

    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
    expect(mockPublishMetric).toHaveBeenCalledWith('TodoCreatedCount', 1);
  });

  it('should return 400 for invalid input', async () => {
    const invalidEvent = {
      ...mockEvent,
      body: JSON.stringify({ title: '' }) 
    };

    const result = await handler(invalidEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('message');
    expect(JSON.parse(result.body).error).toBe('INVALID_TITLE');
    
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
    expect(mockPublishMetric).not.toHaveBeenCalled();
  });

  it('should handle DynamoDB errors', async () => {
    mockDynamoDb.send.mockRejectedValueOnce(new Error('DynamoDB error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message');
    expect(body.error).toBe('DB_ERROR');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });
});