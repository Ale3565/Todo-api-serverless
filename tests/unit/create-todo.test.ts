import { APIGatewayProxyEvent } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';


import { ddbMock, cloudWatchMock } from '../setup';


import { handler } from '../../src/lambda/handlers/create-todo';

describe('CreateTodo Lambda', () => {
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
    
    ddbMock.on(PutCommand).resolves({});
    cloudWatchMock.on(PutMetricDataCommand).resolves({});

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(201);
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Test todo');
    expect(body.description).toBe('Test description');
    expect(body).toHaveProperty('createdAt');
    

    expect(ddbMock.calls()).toHaveLength(1);
    expect(cloudWatchMock.calls()).toHaveLength(1);
  });

  it('should return 400 for invalid input', async () => {
    const invalidEvent = {
      ...mockEvent,
      body: JSON.stringify({ title: '' }) 
    };

    const result = await handler(invalidEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('message');
    
   
    expect(ddbMock.calls()).toHaveLength(0);
    expect(cloudWatchMock.calls()).toHaveLength(0);
  });

  it('should handle DynamoDB errors', async () => {
    ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toHaveProperty('message');
  });
});