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
      tableName: TABLE_NAME
    });

    let result;
    try {
      result = await dynamoDb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
        })
      );

      logInfo('DynamoDB scan completed', { 
        itemCount: result.Items?.length || 0,
        tableName: TABLE_NAME 
      });
    } catch (dbError) {
      logError('DynamoDB scan failed', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        tableName: TABLE_NAME
      });
      return errorResponse(500, 'DB_ERROR', 'Database operation failed');
    }

    // Asegurarse de que result.Items existe antes de continuar
    const todos = result.Items || [];
    
    // Ordenar los todos por fecha de creación (más recientes primero)
    if (todos.length > 0) {
      todos.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    try {
      await publishMetric('TodosListedCount', 1);
    } catch (metricError) {
      logError('Error publishing metric', { 
        error: metricError instanceof Error ? metricError.message : 'Unknown metric error' 
      });
      // Continue execution even if metric publishing fails
    }

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
    
    logError('Unexpected error listing todos', {
      error: errorMessage,
      duration,
    });
    
    // Cambiar a DB_ERROR para mantener consistencia con otros handlers
    return errorResponse(500, 'DB_ERROR', 'Failed to list todos');
  }
};