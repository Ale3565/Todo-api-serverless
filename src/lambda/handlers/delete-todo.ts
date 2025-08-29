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
  const todoId = event.pathParameters?.id;

  try {
    if (!todoId) {
      logError('TodoId parameter is missing');
      return errorResponse(400, 'MISSING_ID', 'Todo ID is required');
    }

    logInfo('Deleting todo', {
      todoId,
      httpMethod: event.httpMethod,
      path: event.path,
      tableName: TABLE_NAME
    });

    try {
      await dynamoDb.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { todoId },
        ConditionExpression: 'attribute_exists(todoId)',
      }));

      logInfo('Todo deleted successfully', { todoId });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      logError('DynamoDB error deleting todo', { 
        error: errorMessage, 
        todoId,
        errorName: dbError instanceof Error ? dbError.name : 'Unknown'
      });

      // Check if this is a conditional check failure (todo not found)
      if (dbError instanceof Error && dbError.name === 'ConditionalCheckFailedException') {
        return errorResponse(404, 'TODO_NOT_FOUND', 'Todo not found');
      }
      
      return errorResponse(500, 'DB_ERROR', 'Database error occurred while deleting todo');
    }

    // Publish metric (don't fail the request if this fails)
    try {
      await publishMetric('TodoDeletedCount', 1);
    } catch (metricError) {
      logError('Error publishing metric', { 
        error: metricError instanceof Error ? metricError.message : 'Unknown metric error' 
      });
      // Continue execution - metrics errors shouldn't affect the API response
    }

    const duration = Date.now() - startTime;
    logInfo('Delete operation completed successfully', {
      todoId,
      duration
    });

    // Return 204 (No Content) response
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
      },
      body: '',
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logError('Unexpected error deleting todo', {
      todoId,
      error: errorMessage,
      duration
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to delete todo');
  }
};