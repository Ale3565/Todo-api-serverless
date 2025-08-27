import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';
import { logInfo, logError } from '../utils/logger';
import { publishMetric } from '../utils/cloudwatch';

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

    await publishMetric('TodosListedCount', 1);

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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('Error listing todos', {
      error: errorMessage,
      stack: errorStack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to list todos');
  }
};