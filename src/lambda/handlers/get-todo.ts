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
  const todoId = event.pathParameters?.id;

  try {
    if (!todoId) {
      logError('TodoId parameter is missing');
      return errorResponse(400, 'MISSING_ID', 'Todo ID is required');
    }

    logInfo('Getting todo by ID', {
      todoId,
      httpMethod: event.httpMethod,
      path: event.path,
      tableName: TABLE_NAME
    });

    let result;
    try {
      result = await dynamoDb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { todoId }
        })
      );

      logInfo('DynamoDB response received', { 
        result,
        hasItem: !!result.Item,
        todoId 
      });
    } catch (dbError) {
      logError('DynamoDB operation failed', { 
        error: dbError,
        todoId,
        tableName: TABLE_NAME
      });
      return errorResponse(500, 'DB_ERROR', 'Database operation failed');
    }

    if (!result.Item) {
      logInfo('Todo not found', { todoId });
      return errorResponse(404, 'NOT_FOUND', 'Todo not found');
    }

    try {
      await publishMetric('TodoRetrievedCount', 1);
    } catch (metricError) {
      logError('Error publishing metric', { error: metricError });
      // Continue execution even if metric publishing fails
    }

    const duration = Date.now() - startTime;
    logInfo('Todo retrieved successfully', {
      todoId,
      duration
    });

    return successResponse(result.Item, 'Todo retrieved successfully');
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logError('Unexpected error getting todo', {
      todoId,
      error: errorMessage,
      duration
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to get todo');
  }
};