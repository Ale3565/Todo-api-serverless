import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';
import { logInfo, logError } from '../utils/logger';
import { publishMetric } from '../utils/cloudwatch';
import { Todo, CreateTodoRequest } from '../types/todo';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    logInfo('Creating new todo', {
      httpMethod: event.httpMethod,
      path: event.path,
    });

   
    if (!event.body) {
      logError('Request body is missing');
      return errorResponse(400, 'MISSING_BODY', 'Request body is required');
    }

    
    let requestBody: CreateTodoRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      logError('Invalid JSON in request body', { error: errorMessage });
      return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON');
    }

    
    if (!requestBody.title || typeof requestBody.title !== 'string' || requestBody.title.trim() === '') {
      logError('Title validation failed', { title: requestBody.title });
      return errorResponse(400, 'INVALID_TITLE', 'Title is required and must be a non-empty string');
    }

   
    const todoId = randomUUID();
    const now = new Date().toISOString();
    
    const todo: Todo = {
      todoId,
      title: requestBody.title.trim(),
      description: requestBody.description?.trim() || '',
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await dynamoDb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: todo,
        })
      );
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      logError('DynamoDB error creating todo', { error: errorMessage, todoId });
      return errorResponse(500, 'DB_ERROR', 'Database error occurred while creating todo');
    }

    try {
      await publishMetric('TodoCreatedCount', 1);
    } catch (metricError) {
      // Log metric error but don't fail the request
      logError('Error publishing metric', { error: metricError instanceof Error ? metricError.message : 'Unknown metric error' });
      // Continue execution - metrics errors shouldn't affect the API response
    }

    const duration = Date.now() - startTime;
    
    logInfo('Todo created successfully', {
      todoId: todo.todoId,
      title: todo.title,
      duration,
    });

    // Return response with 'id' field for compatibility with tests
    const responseData = {
      id: todo.todoId,
      todoId: todo.todoId,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
    

    return successResponse(responseData, 'Todo created successfully', 201);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('Error creating todo', {
      error: errorMessage,
      stack: errorStack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to create todo');
  }
};