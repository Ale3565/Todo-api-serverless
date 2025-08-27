import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

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

   
    const todoId = uuidv4();
    const now = new Date().toISOString();
    
    const todo: Todo = {
      todoId,
      title: requestBody.title.trim(),
      description: requestBody.description?.trim() || '',
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: todo,
      })
    );

    
    await publishMetric('TodoCreatedCount', 1);

    const duration = Date.now() - startTime;
    
    logInfo('Todo created successfully', {
      todoId: todo.todoId,
      title: todo.title,
      duration,
    });

    return successResponse(todo, 'Todo created successfully', 201);
    
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