import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';
import { logInfo, logError } from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    logInfo('Listing all todos', {
      httpMethod: event.httpMethod,
      path: event.path,
    });

    
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const todos = result.Items || [];
    
    
    todos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const duration = Date.now() - startTime;
    
    logInfo('Todos listed successfully', {
      count: todos.length,
      duration,
    });

    return successResponse(
      {
        todos,
        count: todos.length,
      },
      'Todos retrieved successfully'
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logError('Error listing todos', {
      error: error.message,
      stack: error.stack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to list todos');
  }
};