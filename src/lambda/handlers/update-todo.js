"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamodb_1 = require("../utils/dynamodb");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const cloudwatch_1 = require("../utils/cloudwatch");
const handler = async (event) => {
    const startTime = Date.now();
    try {
        const todoId = event.pathParameters?.id;
        if (!todoId) {
            (0, logger_1.logError)('TodoId parameter is missing');
            return (0, response_1.errorResponse)(400, 'MISSING_ID', 'Todo ID is required');
        }
        if (!event.body) {
            (0, logger_1.logError)('Request body is missing');
            return (0, response_1.errorResponse)(400, 'MISSING_BODY', 'Request body is required');
        }
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        }
        catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
            (0, logger_1.logError)('Invalid JSON in request body', { error: errorMessage });
            return (0, response_1.errorResponse)(400, 'INVALID_JSON', 'Request body must be valid JSON');
        }
        (0, logger_1.logInfo)('Updating todo', {
            todoId,
            updates: requestBody,
            httpMethod: event.httpMethod,
            path: event.path,
        });
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        if (requestBody.title !== undefined) {
            if (typeof requestBody.title !== 'string' || requestBody.title.trim() === '') {
                return (0, response_1.errorResponse)(400, 'INVALID_TITLE', 'Title must be a non-empty string');
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
                return (0, response_1.errorResponse)(400, 'INVALID_COMPLETED', 'Completed must be a boolean');
            }
            updateExpressions.push('#completed = :completed');
            expressionAttributeNames['#completed'] = 'completed';
            expressionAttributeValues[':completed'] = requestBody.completed;
        }
        if (updateExpressions.length === 0) {
            return (0, response_1.errorResponse)(400, 'NO_UPDATES', 'No valid fields to update');
        }
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();
        let result;
        try {
            result = await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.UpdateCommand({
                TableName: dynamodb_1.TABLE_NAME,
                Key: { todoId },
                UpdateExpression: `SET ${updateExpressions.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW',
                ConditionExpression: 'attribute_exists(todoId)',
            }));
        }
        catch (dbError) {
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
            (0, logger_1.logError)('DynamoDB error updating todo', { error: errorMessage, todoId });
            // Check if this is a conditional check failure (todo not found)
            if (dbError instanceof Error && dbError.name === 'ConditionalCheckFailedException') {
                return (0, response_1.errorResponse)(404, 'TODO_NOT_FOUND', 'Todo not found');
            }
            return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Database error occurred while updating todo');
        }
        try {
            await (0, cloudwatch_1.publishMetric)('TodoUpdatedCount', 1);
        }
        catch (metricError) {
            // Log metric error but don't fail the request
            (0, logger_1.logError)('Error publishing metric', { error: metricError instanceof Error ? metricError.message : 'Unknown metric error' });
            // Continue execution - metrics errors shouldn't affect the API response
        }
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todo updated successfully', {
            todoId,
            fieldsUpdated: Object.keys(requestBody),
            duration,
        });
        return (0, response_1.successResponse)(result.Attributes, 'Todo updated successfully');
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const isConditionalCheckError = error instanceof Error && 'name' in error && error.name === 'ConditionalCheckFailedException';
        if (isConditionalCheckError) {
            (0, logger_1.logError)('Todo not found for update', {
                todoId: event.pathParameters?.id,
                duration,
            });
            return (0, response_1.errorResponse)(404, 'NOT_FOUND', 'Todo not found');
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;
        (0, logger_1.logError)('Error updating todo', {
            todoId: event.pathParameters?.id,
            error: errorMessage,
            stack: errorStack,
            duration,
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to update todo');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1cGRhdGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBc0Q7QUFFdEQsZ0RBQXlEO0FBQ3pELGdEQUFtRTtBQUNuRSw0Q0FBb0Q7QUFFcEQsb0RBQW9EO0FBRTdDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDMUIsS0FBMkIsRUFDSyxFQUFFO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUU3QixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztRQUV4QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsSUFBQSxpQkFBUSxFQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDcEMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFHRCxJQUFJLFdBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDO1lBQ0gsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFBQyxPQUFPLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sWUFBWSxHQUFHLFVBQVUsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDO1lBQ2hHLElBQUEsaUJBQVEsRUFBQyw4QkFBOEIsRUFBRSxFQUFFLEtBQUss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LENBQUM7SUFDdkUsQ0FBQztBQUNILENBQUMsQ0FBQztBQS9JVyxRQUFBLE9BQU8sV0ErSWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBVcGRhdGVDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuXHJcbmltcG9ydCB7IGR5bmFtb0RiLCBUQUJMRV9OQU1FIH0gZnJvbSAnLi4vdXRpbHMvZHluYW1vZGInO1xyXG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XHJcbmltcG9ydCB7IGxvZ0luZm8sIGxvZ0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcclxuaW1wb3J0IHsgVXBkYXRlVG9kb1JlcXVlc3QgfSBmcm9tICcuLi90eXBlcy90b2RvJztcclxuaW1wb3J0IHsgcHVibGlzaE1ldHJpYyB9IGZyb20gJy4uL3V0aWxzL2Nsb3Vkd2F0Y2gnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoXHJcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XHJcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XHJcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICBcclxuICB0cnkge1xyXG4gICAgY29uc3QgdG9kb0lkID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkO1xyXG5cclxuICAgIGlmICghdG9kb0lkKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdUb2RvSWQgcGFyYW1ldGVyIGlzIG1pc3NpbmcnKTtcclxuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnTUlTU0lOR19JRCcsICdUb2RvIElEIGlzIHJlcXVpcmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFldmVudC5ib2R5KSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdSZXF1ZXN0IGJvZHkgaXMgbWlzc2luZycpO1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdNSVNTSU5HX0JPRFknLCAnUmVxdWVzdCBib2R5IGlzIHJlcXVpcmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBsZXQgcmVxdWVzdEJvZHk6IFVwZGF0ZVRvZG9SZXF1ZXN0O1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVxdWVzdEJvZHkgPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xyXG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBwYXJzaW5nIGVycm9yJztcclxuICAgICAgbG9nRXJyb3IoJ0ludmFsaWQgSlNPTiBpbiByZXF1ZXN0IGJvZHknLCB7IGVycm9yOiBlcnJvck1lc3NhZ2UgfSk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ0lOVkFMSURfSlNPTicsICdSZXF1ZXN0IGJvZHkgbXVzdCBiZSB2YWxpZCBKU09OJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9nSW5mbygnVXBkYXRpbmcgdG9kbycsIHtcclxuICAgICAgdG9kb0lkLFxyXG4gICAgICB1cGRhdGVzOiByZXF1ZXN0Qm9keSxcclxuICAgICAgaHR0cE1ldGhvZDogZXZlbnQuaHR0cE1ldGhvZCxcclxuICAgICAgcGF0aDogZXZlbnQucGF0aCxcclxuICAgIH0pO1xyXG5cclxuICAgXHJcbiAgICBjb25zdCB1cGRhdGVFeHByZXNzaW9uczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xyXG5cclxuICAgIGlmIChyZXF1ZXN0Qm9keS50aXRsZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgcmVxdWVzdEJvZHkudGl0bGUgIT09ICdzdHJpbmcnIHx8IHJlcXVlc3RCb2R5LnRpdGxlLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJTlZBTElEX1RJVExFJywgJ1RpdGxlIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XHJcbiAgICAgIH1cclxuICAgICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI3RpdGxlID0gOnRpdGxlJyk7XHJcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3RpdGxlJ10gPSAndGl0bGUnO1xyXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6dGl0bGUnXSA9IHJlcXVlc3RCb2R5LnRpdGxlLnRyaW0oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxdWVzdEJvZHkuZGVzY3JpcHRpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKCcjZGVzY3JpcHRpb24gPSA6ZGVzY3JpcHRpb24nKTtcclxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjZGVzY3JpcHRpb24nXSA9ICdkZXNjcmlwdGlvbic7XHJcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpkZXNjcmlwdGlvbiddID0gcmVxdWVzdEJvZHkuZGVzY3JpcHRpb24/LnRyaW0oKSB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxdWVzdEJvZHkuY29tcGxldGVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0Qm9keS5jb21wbGV0ZWQgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ0lOVkFMSURfQ09NUExFVEVEJywgJ0NvbXBsZXRlZCBtdXN0IGJlIGEgYm9vbGVhbicpO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goJyNjb21wbGV0ZWQgPSA6Y29tcGxldGVkJyk7XHJcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI2NvbXBsZXRlZCddID0gJ2NvbXBsZXRlZCc7XHJcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpjb21wbGV0ZWQnXSA9IHJlcXVlc3RCb2R5LmNvbXBsZXRlZDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodXBkYXRlRXhwcmVzc2lvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ05PX1VQREFURVMnLCAnTm8gdmFsaWQgZmllbGRzIHRvIHVwZGF0ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI3VwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnKTtcclxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI3VwZGF0ZWRBdCddID0gJ3VwZGF0ZWRBdCc7XHJcbiAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6dXBkYXRlZEF0J10gPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XHJcblxyXG4gICAgXHJcbiAgICBsZXQgcmVzdWx0O1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVzdWx0ID0gYXdhaXQgZHluYW1vRGIuc2VuZChcclxuICAgICAgICBuZXcgVXBkYXRlQ29tbWFuZCh7XHJcbiAgICAgICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICAgICAgICBLZXk6IHsgdG9kb0lkIH0sXHJcbiAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBgU0VUICR7dXBkYXRlRXhwcmVzc2lvbnMuam9pbignLCAnKX1gLFxyXG4gICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBleHByZXNzaW9uQXR0cmlidXRlTmFtZXMsXHJcbiAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxyXG4gICAgICAgICAgUmV0dXJuVmFsdWVzOiAnQUxMX05FVycsXHJcbiAgICAgICAgICBDb25kaXRpb25FeHByZXNzaW9uOiAnYXR0cmlidXRlX2V4aXN0cyh0b2RvSWQpJyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfSBjYXRjaCAoZGJFcnJvcikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBkYkVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBkYkVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBkYXRhYmFzZSBlcnJvcic7XHJcbiAgICAgIGxvZ0Vycm9yKCdEeW5hbW9EQiBlcnJvciB1cGRhdGluZyB0b2RvJywgeyBlcnJvcjogZXJyb3JNZXNzYWdlLCB0b2RvSWQgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgY29uZGl0aW9uYWwgY2hlY2sgZmFpbHVyZSAodG9kbyBub3QgZm91bmQpXHJcbiAgICAgIGlmIChkYkVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZGJFcnJvci5uYW1lID09PSAnQ29uZGl0aW9uYWxDaGVja0ZhaWxlZEV4Y2VwdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDQsICdUT0RPX05PVF9GT1VORCcsICdUb2RvIG5vdCBmb3VuZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdEQl9FUlJPUicsICdEYXRhYmFzZSBlcnJvciBvY2N1cnJlZCB3aGlsZSB1cGRhdGluZyB0b2RvJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9VcGRhdGVkQ291bnQnLCAxKTtcclxuICAgIH0gY2F0Y2ggKG1ldHJpY0Vycm9yKSB7XHJcbiAgICAgIC8vIExvZyBtZXRyaWMgZXJyb3IgYnV0IGRvbid0IGZhaWwgdGhlIHJlcXVlc3RcclxuICAgICAgbG9nRXJyb3IoJ0Vycm9yIHB1Ymxpc2hpbmcgbWV0cmljJywgeyBlcnJvcjogbWV0cmljRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IG1ldHJpY0Vycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBtZXRyaWMgZXJyb3InIH0pO1xyXG4gICAgICAvLyBDb250aW51ZSBleGVjdXRpb24gLSBtZXRyaWNzIGVycm9ycyBzaG91bGRuJ3QgYWZmZWN0IHRoZSBBUEkgcmVzcG9uc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgXHJcbiAgICBsb2dJbmZvKCdUb2RvIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5Jywge1xyXG4gICAgICB0b2RvSWQsXHJcbiAgICAgIGZpZWxkc1VwZGF0ZWQ6IE9iamVjdC5rZXlzKHJlcXVlc3RCb2R5KSxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHJlc3VsdC5BdHRyaWJ1dGVzLCAnVG9kbyB1cGRhdGVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcclxuICAgIFxyXG4gIFxyXG4gICAgY29uc3QgaXNDb25kaXRpb25hbENoZWNrRXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICduYW1lJyBpbiBlcnJvciAmJiBlcnJvci5uYW1lID09PSAnQ29uZGl0aW9uYWxDaGVja0ZhaWxlZEV4Y2VwdGlvbic7XHJcbiAgICBcclxuICAgIGlmIChpc0NvbmRpdGlvbmFsQ2hlY2tFcnJvcikge1xyXG4gICAgICBsb2dFcnJvcignVG9kbyBub3QgZm91bmQgZm9yIHVwZGF0ZScsIHtcclxuICAgICAgICB0b2RvSWQ6IGV2ZW50LnBhdGhQYXJhbWV0ZXJzPy5pZCxcclxuICAgICAgICBkdXJhdGlvbixcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwNCwgJ05PVF9GT1VORCcsICdUb2RvIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcclxuICAgIGNvbnN0IGVycm9yU3RhY2sgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3Iuc3RhY2sgOiB1bmRlZmluZWQ7XHJcbiAgICBcclxuICAgIGxvZ0Vycm9yKCdFcnJvciB1cGRhdGluZyB0b2RvJywge1xyXG4gICAgICB0b2RvSWQ6IGV2ZW50LnBhdGhQYXJhbWV0ZXJzPy5pZCxcclxuICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcclxuICAgICAgc3RhY2s6IGVycm9yU3RhY2ssXHJcbiAgICAgIGR1cmF0aW9uLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDUwMCwgJ0lOVEVSTkFMX0VSUk9SJywgJ0ZhaWxlZCB0byB1cGRhdGUgdG9kbycpO1xyXG4gIH1cclxufTsiXX0=