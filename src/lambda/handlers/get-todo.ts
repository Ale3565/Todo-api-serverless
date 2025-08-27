import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';
import { logInfo, logError } from '../utils/logger';
import { publishMetric } from '../utils/cloudwatch';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    const todoId = event.pathParameters?.id;

    if (!todoId) {
      logError('TodoId parameter is missing');
      return errorResponse(400, 'MISSING_ID', 'Todo ID is required');
    }

    logInfo('Getting todo by ID', {
      todoId,
      httpMethod: event.httpMethod,
      path: event.path,
    });

    
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { todoId },
      })
    );

    if (!result.Item) {
      logInfo('Todo not found', { todoId });
      return errorResponse(404, 'NOT_FOUND', 'Todo not found');
    }

    await publishMetric('TodoRetrievedCount', 1);

    const duration = Date.now() - startTime;
    
    logInfo('Todo retrieved successfully', {
      todoId,
      duration,
    });

    return successResponse(result.Item, 'Todo retrieved successfully');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('Error getting todo', {
      todoId: event.pathParameters?.id,
      error: errorMessage,
      stack: errorStack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to get todo');
  }
};