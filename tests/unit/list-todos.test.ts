
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';


jest.mock('../../src/lambda/utils/dynamodb');
jest.mock('../../src/lambda/utils/cloudwatch');

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambda/handlers/list-todos';
import { dynamoDb } from '../../src/lambda/utils/dynamodb';
import { publishMetric } from '../../src/lambda/utils/cloudwatch';


const mockDynamoDb = dynamoDb as jest.Mocked<typeof dynamoDb>;
const mockPublishMetric = publishMetric as jest.MockedFunction<typeof publishMetric>;

describe('list-todos handler', () => {
  beforeEach(() => {
    
    jest.clearAllMocks();
    
    
    mockPublishMetric.mockResolvedValue(undefined);
  });

  it('should list todos successfully', async () => {
    const mockTodos = [
      { todoId: '1', title: 'Todo 1', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
      { todoId: '2', title: 'Todo 2', completed: true, createdAt: '2023-01-02T00:00:00.000Z' }
    ];

    mockDynamoDb.send.mockResolvedValueOnce({ Items: mockTodos });

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todos).toHaveLength(2);
    expect(JSON.parse(result.body).data.count).toBe(2);
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
    expect(mockPublishMetric).toHaveBeenCalledWith('TodosListedCount', 1);
  });

  it('should return empty array when no todos exist', async () => {
    mockDynamoDb.send.mockResolvedValueOnce({ Items: [] });

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
    expect(JSON.parse(result.body).data.todos).toHaveLength(0);
    expect(JSON.parse(result.body).data.count).toBe(0);
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });

  it('should handle DynamoDB errors', async () => {
    mockDynamoDb.send.mockRejectedValueOnce(new Error('DynamoDB Error'));

    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/todos'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DB_ERROR');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });

  it('should sort todos by creation date (newest first)', async () => {
    const mockTodos = [
      { todoId: '1', title: 'Old Todo', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
      { todoId: '2', title: 'New Todo', completed: true, createdAt: '2023-01-03T00:00:00.000Z' },
      { todoId: '3', title: 'Middle Todo', completed: false, createdAt: '2023-01-02T00:00:00.000Z' }
    ];

    mockDynamoDb.send.mockResolvedValueOnce({ Items: mockTodos });

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
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });
});