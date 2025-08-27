import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';
import { logInfo, logError } from '../utils/logger';
import { UpdateTodoRequest } from '../types/todo';
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

    if (!event.body) {
      logError('Request body is missing');
      return errorResponse(400, 'MISSING_BODY', 'Request body is required');
    }

    
    let requestBody: UpdateTodoRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      logError('Invalid JSON in request body', { error: errorMessage });
      return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON');
    }

    logInfo('Updating todo', {
      todoId,
      updates: requestBody,
      httpMethod: event.httpMethod,
      path: event.path,
    });

   
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (requestBody.title !== undefined) {
      if (typeof requestBody.title !== 'string' || requestBody.title.trim() === '') {
        return errorResponse(400, 'INVALID_TITLE', 'Title must be a non-empty string');
      }
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = requestBody.title.trim();
    }

    if (requestBody.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = requestBody.description?.trim() || '';
    }

    if (requestBody.completed !== undefined) {
      if (typeof requestBody.completed !== 'boolean') {
        return errorResponse(400, 'INVALID_COMPLETED', 'Completed must be a boolean');
      }
      updateExpressions.push('#completed = :completed');
      expressionAttributeNames['#completed'] = 'completed';
      expressionAttributeValues[':completed'] = requestBody.completed;
    }

    if (updateExpressions.length === 0) {
      return errorResponse(400, 'NO_UPDATES', 'No valid fields to update');
    }

    
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    
    const result = await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { todoId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
        ConditionExpression: 'attribute_exists(todoId)',
      })
    );
    
    await publishMetric('TodoUpdatedCount', 1);
    
    const duration = Date.now() - startTime;
    
    logInfo('Todo updated successfully', {
      todoId,
      fieldsUpdated: Object.keys(requestBody),
      duration,
    });

    return successResponse(result.Attributes, 'Todo updated successfully');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
  
    const isConditionalCheckError = error instanceof Error && 'name' in error && error.name === 'ConditionalCheckFailedException';
    
    if (isConditionalCheckError) {
      logError('Todo not found for update', {
        todoId: event.pathParameters?.id,
        duration,
      });
      return errorResponse(404, 'NOT_FOUND', 'Todo not found');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('Error updating todo', {
      todoId: event.pathParameters?.id,
      error: errorMessage,
      stack: errorStack,
      duration,
    });
    
    return errorResponse(500, 'INTERNAL_ERROR', 'Failed to update todo');
  }
};