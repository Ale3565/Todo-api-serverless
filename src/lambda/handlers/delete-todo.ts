import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { errorResponse } from '../utils/response';
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

    logInfo('Deleting todo', {
      todoId,
      httpMethod: event.httpMethod,
      path: event.path,
    });

    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { todoId },
        ConditionExpression: 'attribute_exists(todoId)',
      })
    );

    
    await publishMetric('TodoDeletedCount', 1);

    const duration = Date.now() - startTime;
    
    logInfo('Todo deleted successfully', {
      todoId,
      duration,
    });

    
    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
      },
      body: '',
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    
    const isConditionalCheckError = error instanceof Error && 'name' in error && error.name === 'ConditionalCheckFailedException';
    
    if (isConditionalCheckError) {
      logError('Todo not found for deletion', {
        todoId: event.pathParameters?.id,
        duration,
      });
      return errorResponse(404, 'NOT_FOUND', 'Todo not found');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logError('Error deleting todo', {
      todoId: event.pathParameters?.id,
      error: errorMessage,
      stack: errorStack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to delete todo');
  }
};