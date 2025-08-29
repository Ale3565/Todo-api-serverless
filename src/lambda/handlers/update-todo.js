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
        const result = await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.UpdateCommand({
            TableName: dynamodb_1.TABLE_NAME,
            Key: { todoId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(todoId)',
        }));
        await (0, cloudwatch_1.publishMetric)('TodoUpdatedCount', 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1cGRhdGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBc0Q7QUFFdEQsZ0RBQXlEO0FBQ3pELGdEQUFtRTtBQUNuRSw0Q0FBb0Q7QUFFcEQsb0RBQW9EO0FBRTdDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDMUIsS0FBMkIsRUFDSyxFQUFFO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUU3QixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztRQUV4QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsSUFBQSxpQkFBUSxFQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDcEMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFHRCxJQUFJLFdBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDO1lBQ0gsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFBQyxPQUFPLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sWUFBWSxHQUFHLFVBQVUsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDO1lBQ2hHLElBQUEsaUJBQVEsRUFBQyw4QkFBOEIsRUFBRSxFQUFFLEtBQUss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QUM7UUFFcEUsSUFBQSxpQkFBUSxFQUFDLHFCQUFxQixFQUFFO1lBQzlCLE1BQU0sRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUU7WUFDaEMsS0FBSyxFQUFFLFlBQVk7WUFDbkIsS0FBSyxFQUFFLFVBQVU7WUFDakIsUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7QUFDSCxDQUFDLENBQUM7QUE1SFcsUUFBQSxPQUFPLFdBNEhsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcclxuaW1wb3J0IHsgVXBkYXRlQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XHJcblxyXG5pbXBvcnQgeyBkeW5hbW9EYiwgVEFCTEVfTkFNRSB9IGZyb20gJy4uL3V0aWxzL2R5bmFtb2RiJztcclxuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xyXG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcbmltcG9ydCB7IFVwZGF0ZVRvZG9SZXF1ZXN0IH0gZnJvbSAnLi4vdHlwZXMvdG9kbyc7XHJcbmltcG9ydCB7IHB1Ymxpc2hNZXRyaWMgfSBmcm9tICcuLi91dGlscy9jbG91ZHdhdGNoJztcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKFxyXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxyXG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xyXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHRvZG9JZCA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzPy5pZDtcclxuXHJcbiAgICBpZiAoIXRvZG9JZCkge1xyXG4gICAgICBsb2dFcnJvcignVG9kb0lkIHBhcmFtZXRlciBpcyBtaXNzaW5nJyk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01JU1NJTkdfSUQnLCAnVG9kbyBJRCBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZXZlbnQuYm9keSkge1xyXG4gICAgICBsb2dFcnJvcignUmVxdWVzdCBib2R5IGlzIG1pc3NpbmcnKTtcclxuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnTUlTU0lOR19CT0RZJywgJ1JlcXVlc3QgYm9keSBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgbGV0IHJlcXVlc3RCb2R5OiBVcGRhdGVUb2RvUmVxdWVzdDtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcclxuICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gcGFyc2luZyBlcnJvcic7XHJcbiAgICAgIGxvZ0Vycm9yKCdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5JywgeyBlcnJvcjogZXJyb3JNZXNzYWdlIH0pO1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJTlZBTElEX0pTT04nLCAnUmVxdWVzdCBib2R5IG11c3QgYmUgdmFsaWQgSlNPTicpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvZ0luZm8oJ1VwZGF0aW5nIHRvZG8nLCB7XHJcbiAgICAgIHRvZG9JZCxcclxuICAgICAgdXBkYXRlczogcmVxdWVzdEJvZHksXHJcbiAgICAgIGh0dHBNZXRob2Q6IGV2ZW50Lmh0dHBNZXRob2QsXHJcbiAgICAgIHBhdGg6IGV2ZW50LnBhdGgsXHJcbiAgICB9KTtcclxuXHJcbiAgIFxyXG4gICAgY29uc3QgdXBkYXRlRXhwcmVzc2lvbnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcclxuXHJcbiAgICBpZiAocmVxdWVzdEJvZHkudGl0bGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBpZiAodHlwZW9mIHJlcXVlc3RCb2R5LnRpdGxlICE9PSAnc3RyaW5nJyB8fCByZXF1ZXN0Qm9keS50aXRsZS50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnSU5WQUxJRF9USVRMRScsICdUaXRsZSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goJyN0aXRsZSA9IDp0aXRsZScpO1xyXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyN0aXRsZSddID0gJ3RpdGxlJztcclxuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnRpdGxlJ10gPSByZXF1ZXN0Qm9keS50aXRsZS50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlcXVlc3RCb2R5LmRlc2NyaXB0aW9uICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdXBkYXRlRXhwcmVzc2lvbnMucHVzaCgnI2Rlc2NyaXB0aW9uID0gOmRlc2NyaXB0aW9uJyk7XHJcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lc1snI2Rlc2NyaXB0aW9uJ10gPSAnZGVzY3JpcHRpb24nO1xyXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6ZGVzY3JpcHRpb24nXSA9IHJlcXVlc3RCb2R5LmRlc2NyaXB0aW9uPy50cmltKCkgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlcXVlc3RCb2R5LmNvbXBsZXRlZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgcmVxdWVzdEJvZHkuY29tcGxldGVkICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJTlZBTElEX0NPTVBMRVRFRCcsICdDb21wbGV0ZWQgbXVzdCBiZSBhIGJvb2xlYW4nKTtcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKCcjY29tcGxldGVkID0gOmNvbXBsZXRlZCcpO1xyXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNjb21wbGV0ZWQnXSA9ICdjb21wbGV0ZWQnO1xyXG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6Y29tcGxldGVkJ10gPSByZXF1ZXN0Qm9keS5jb21wbGV0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVwZGF0ZUV4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdOT19VUERBVEVTJywgJ05vIHZhbGlkIGZpZWxkcyB0byB1cGRhdGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goJyN1cGRhdGVkQXQgPSA6dXBkYXRlZEF0Jyk7XHJcbiAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyN1cGRhdGVkQXQnXSA9ICd1cGRhdGVkQXQnO1xyXG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnVwZGF0ZWRBdCddID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG5cclxuICAgIFxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vRGIuc2VuZChcclxuICAgICAgbmV3IFVwZGF0ZUNvbW1hbmQoe1xyXG4gICAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcclxuICAgICAgICBLZXk6IHsgdG9kb0lkIH0sXHJcbiAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogYFNFVCAke3VwZGF0ZUV4cHJlc3Npb25zLmpvaW4oJywgJyl9YCxcclxuICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyxcclxuICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxyXG4gICAgICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnLFxyXG4gICAgICAgIENvbmRpdGlvbkV4cHJlc3Npb246ICdhdHRyaWJ1dGVfZXhpc3RzKHRvZG9JZCknLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICAgIFxyXG4gICAgYXdhaXQgcHVibGlzaE1ldHJpYygnVG9kb1VwZGF0ZWRDb3VudCcsIDEpO1xyXG4gICAgXHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICBcclxuICAgIGxvZ0luZm8oJ1RvZG8gdXBkYXRlZCBzdWNjZXNzZnVsbHknLCB7XHJcbiAgICAgIHRvZG9JZCxcclxuICAgICAgZmllbGRzVXBkYXRlZDogT2JqZWN0LmtleXMocmVxdWVzdEJvZHkpLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UocmVzdWx0LkF0dHJpYnV0ZXMsICdUb2RvIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICBcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgXHJcbiAgXHJcbiAgICBjb25zdCBpc0NvbmRpdGlvbmFsQ2hlY2tFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ25hbWUnIGluIGVycm9yICYmIGVycm9yLm5hbWUgPT09ICdDb25kaXRpb25hbENoZWNrRmFpbGVkRXhjZXB0aW9uJztcclxuICAgIFxyXG4gICAgaWYgKGlzQ29uZGl0aW9uYWxDaGVja0Vycm9yKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdUb2RvIG5vdCBmb3VuZCBmb3IgdXBkYXRlJywge1xyXG4gICAgICAgIHRvZG9JZDogZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkLFxyXG4gICAgICAgIGR1cmF0aW9uLFxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDA0LCAnTk9UX0ZPVU5EJywgJ1RvZG8gbm90IGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xyXG4gICAgY29uc3QgZXJyb3JTdGFjayA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5zdGFjayA6IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgbG9nRXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHRvZG8nLCB7XHJcbiAgICAgIHRvZG9JZDogZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkLFxyXG4gICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxyXG4gICAgICBzdGFjazogZXJyb3JTdGFjayxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNTAwLCAnSU5URVJOQUxfRVJST1InLCAnRmFpbGVkIHRvIHVwZGF0ZSB0b2RvJyk7XHJcbiAgfVxyXG59OyJdfQ==