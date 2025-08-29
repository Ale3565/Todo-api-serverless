
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';


jest.mock('../../src/lambda/utils/dynamodb');
jest.mock('../../src/lambda/utils/cloudwatch');

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambda/handlers/delete-todo';
import { dynamoDb } from '../../src/lambda/utils/dynamodb';
import { publishMetric } from '../../src/lambda/utils/cloudwatch';


const mockDynamoDb = dynamoDb as jest.Mocked<typeof dynamoDb>;
const mockPublishMetric = publishMetric as jest.MockedFunction<typeof publishMetric>;

describe('delete-todo handler', () => {
  beforeEach(() => {
   
    jest.clearAllMocks();
    
    
    mockPublishMetric.mockResolvedValue(undefined);
  });

  it('should delete todo successfully', async () => {
    
    mockDynamoDb.send.mockResolvedValueOnce({});

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '123' },
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
    expect(result.body).toBe('');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
    expect(mockPublishMetric).toHaveBeenCalledWith('TodoDeletedCount', 1);
  });

  it('should return 400 when id parameter is missing', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: null,
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('MISSING_ID');
    expect(mockDynamoDb.send).not.toHaveBeenCalled();
  });

  it('should return 404 when todo not found', async () => {
   
    const conditionalError = new Error('The conditional request failed');
    conditionalError.name = 'ConditionalCheckFailedException';
    mockDynamoDb.send.mockRejectedValueOnce(conditionalError);

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { id: '999' },
      httpMethod: 'DELETE',
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
      httpMethod: 'DELETE',
      path: '/todos/123'
    };

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DB_ERROR');
    expect(mockDynamoDb.send).toHaveBeenCalledTimes(1);
  });
});