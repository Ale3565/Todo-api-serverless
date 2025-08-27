import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { logInfo, logError } from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    const todoId = event.pathParameters?.id;

    if (!todoId) {
      logError('TodoId parameter is missing');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'MISSING_ID',
          message: 'Todo ID is required',
        }),
      };
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
    
    if (error.name === 'ConditionalCheckFailedException') {
      logError('Todo not found for deletion', {
        todoId: event.pathParameters?.id,
        duration,
      });
      
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'NOT_FOUND',
          message: 'Todo not found',
        }),
      };
    }

    logError('Error deleting todo', {
      todoId: event.pathParameters?.id,
      error: error.message,
      stack: error.stack,
      duration,
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to delete todo',
      }),
    };
  }
};