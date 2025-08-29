"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const crypto_1 = require("crypto");
const dynamodb_1 = require("../utils/dynamodb");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const cloudwatch_1 = require("../utils/cloudwatch");
const handler = async (event) => {
    const startTime = Date.now();
    try {
        (0, logger_1.logInfo)('Creating new todo', {
            httpMethod: event.httpMethod,
            path: event.path,
        });
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
        if (!requestBody.title || typeof requestBody.title !== 'string' || requestBody.title.trim() === '') {
            (0, logger_1.logError)('Title validation failed', { title: requestBody.title });
            return (0, response_1.errorResponse)(400, 'INVALID_TITLE', 'Title is required and must be a non-empty string');
        }
        const todoId = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const todo = {
            todoId,
            title: requestBody.title.trim(),
            description: requestBody.description?.trim() || '',
            completed: false,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.PutCommand({
                TableName: dynamodb_1.TABLE_NAME,
                Item: todo,
            }));
        }
        catch (dbError) {
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
            (0, logger_1.logError)('DynamoDB error creating todo', { error: errorMessage, todoId });
            return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Database error occurred while creating todo');
        }
        try {
            await (0, cloudwatch_1.publishMetric)('TodoCreatedCount', 1);
        }
        catch (metricError) {
            // Log metric error but don't fail the request
            (0, logger_1.logError)('Error publishing metric', { error: metricError instanceof Error ? metricError.message : 'Unknown metric error' });
            // Continue execution - metrics errors shouldn't affect the API response
        }
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todo created successfully', {
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
        return (0, response_1.successResponse)(responseData, 'Todo created successfully', 201);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;
        (0, logger_1.logError)('Error creating todo', {
            error: errorMessage,
            stack: errorStack,
            duration,
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to create todo');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjcmVhdGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBbUQ7QUFDbkQsbUNBQW9DO0FBRXBDLGdEQUF5RDtBQUN6RCxnREFBbUU7QUFDbkUsNENBQW9EO0FBQ3BELG9EQUFvRDtBQUc3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQzFCLEtBQTJCLEVBQ0ssRUFBRTtJQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFN0IsSUFBSSxDQUFDO1FBQ0gsSUFBQSxnQkFBTyxFQUFDLG1CQUFtQixFQUFFO1lBQzNCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBR0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixJQUFBLGlCQUFRLEVBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNwQyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUdELElBQUksV0FBOEIsQ0FBQztRQUNuQyxJQUFJLENBQUM7WUFDSCxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUFDLE9BQU8sVUFBVSxFQUFFLENBQUM7WUFDcEIsTUFBTSxZQUFZLEdBQUcsVUFBVSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUM7WUFDaEcsSUFBQSxpQkFBUSxFQUFDLDhCQUE4QixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDbEUsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGNBQWMsRUFB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QUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFeEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUM7UUFDdkYsTUFBTSxVQUFVLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXBFLElBQUEsaUJBQVEsRUFBQyxxQkFBcUIsRUFBRTtZQUM5QixLQUFLLEVBQUUsWUFBWTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDdkUsQ0FBQztBQUNILENBQUMsQ0FBQztBQXZHVyxRQUFBLE9BQU8sV0F1R2xCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgUHV0Q29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XG5pbXBvcnQgeyByYW5kb21VVUlEIH0gZnJvbSAnY3J5cHRvJztcblxuaW1wb3J0IHsgZHluYW1vRGIsIFRBQkxFX05BTUUgfSBmcm9tICcuLi91dGlscy9keW5hbW9kYic7XG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBwdWJsaXNoTWV0cmljIH0gZnJvbSAnLi4vdXRpbHMvY2xvdWR3YXRjaCc7XG5pbXBvcnQgeyBUb2RvLCBDcmVhdGVUb2RvUmVxdWVzdCB9IGZyb20gJy4uL3R5cGVzL3RvZG8nO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICBcbiAgdHJ5IHtcbiAgICBsb2dJbmZvKCdDcmVhdGluZyBuZXcgdG9kbycsIHtcbiAgICAgIGh0dHBNZXRob2Q6IGV2ZW50Lmh0dHBNZXRob2QsXG4gICAgICBwYXRoOiBldmVudC5wYXRoLFxuICAgIH0pO1xuXG4gICBcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHtcbiAgICAgIGxvZ0Vycm9yKCdSZXF1ZXN0IGJvZHkgaXMgbWlzc2luZycpO1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnTUlTU0lOR19CT0RZJywgJ1JlcXVlc3QgYm9keSBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIFxuICAgIGxldCByZXF1ZXN0Qm9keTogQ3JlYXRlVG9kb1JlcXVlc3Q7XG4gICAgdHJ5IHtcbiAgICAgIHJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcbiAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBwYXJzZUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBwYXJzZUVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBwYXJzaW5nIGVycm9yJztcbiAgICAgIGxvZ0Vycm9yKCdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5JywgeyBlcnJvcjogZXJyb3JNZXNzYWdlIH0pO1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnSU5WQUxJRF9KU09OJywgJ1JlcXVlc3QgYm9keSBtdXN0IGJlIHZhbGlkIEpTT04nKTtcbiAgICB9XG5cbiAgICBcbiAgICBpZiAoIXJlcXVlc3RCb2R5LnRpdGxlIHx8IHR5cGVvZiByZXF1ZXN0Qm9keS50aXRsZSAhPT0gJ3N0cmluZycgfHwgcmVxdWVzdEJvZHkudGl0bGUudHJpbSgpID09PSAnJykge1xuICAgICAgbG9nRXJyb3IoJ1RpdGxlIHZhbGlkYXRpb24gZmFpbGVkJywgeyB0aXRsZTogcmVxdWVzdEJvZHkudGl0bGUgfSk7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJTlZBTElEX1RJVExFJywgJ1RpdGxlIGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xuICAgIH1cblxuICAgXG4gICAgY29uc3QgdG9kb0lkID0gcmFuZG9tVVVJRCgpO1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICBjb25zdCB0b2RvOiBUb2RvID0ge1xuICAgICAgdG9kb0lkLFxuICAgICAgdGl0bGU6IHJlcXVlc3RCb2R5LnRpdGxlLnRyaW0oKSxcbiAgICAgIGRlc2NyaXB0aW9uOiByZXF1ZXN0Qm9keS5kZXNjcmlwdGlvbj8udHJpbSgpIHx8ICcnLFxuICAgICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICAgIGNyZWF0ZWRBdDogbm93LFxuICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBkeW5hbW9EYi5zZW5kKFxuICAgICAgICBuZXcgUHV0Q29tbWFuZCh7XG4gICAgICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxuICAgICAgICAgIEl0ZW06IHRvZG8sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGRiRXJyb3IpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGRiRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGRiRXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGRhdGFiYXNlIGVycm9yJztcbiAgICAgIGxvZ0Vycm9yKCdEeW5hbW9EQiBlcnJvciBjcmVhdGluZyB0b2RvJywgeyBlcnJvcjogZXJyb3JNZXNzYWdlLCB0b2RvSWQgfSk7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdEQl9FUlJPUicsICdEYXRhYmFzZSBlcnJvciBvY2N1cnJlZCB3aGlsZSBjcmVhdGluZyB0b2RvJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9DcmVhdGVkQ291bnQnLCAxKTtcbiAgICB9IGNhdGNoIChtZXRyaWNFcnJvcikge1xuICAgICAgLy8gTG9nIG1ldHJpYyBlcnJvciBidXQgZG9uJ3QgZmFpbCB0aGUgcmVxdWVzdFxuICAgICAgbG9nRXJyb3IoJ0Vycm9yIHB1Ymxpc2hpbmcgbWV0cmljJywgeyBlcnJvcjogbWV0cmljRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IG1ldHJpY0Vycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBtZXRyaWMgZXJyb3InIH0pO1xuICAgICAgLy8gQ29udGludWUgZXhlY3V0aW9uIC0gbWV0cmljcyBlcnJvcnMgc2hvdWxkbid0IGFmZmVjdCB0aGUgQVBJIHJlc3BvbnNlXG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgIFxuICAgIGxvZ0luZm8oJ1RvZG8gY3JlYXRlZCBzdWNjZXNzZnVsbHknLCB7XG4gICAgICB0b2RvSWQ6IHRvZG8udG9kb0lkLFxuICAgICAgdGl0bGU6IHRvZG8udGl0bGUsXG4gICAgICBkdXJhdGlvbixcbiAgICB9KTtcblxuICAgIC8vIFJldHVybiByZXNwb25zZSB3aXRoICdpZCcgZmllbGQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCB0ZXN0c1xuICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IHtcbiAgICAgIGlkOiB0b2RvLnRvZG9JZCxcbiAgICAgIHRvZG9JZDogdG9kby50b2RvSWQsXG4gICAgICB0aXRsZTogdG9kby50aXRsZSxcbiAgICAgIGRlc2NyaXB0aW9uOiB0b2RvLmRlc2NyaXB0aW9uLFxuICAgICAgY29tcGxldGVkOiB0b2RvLmNvbXBsZXRlZCxcbiAgICAgIGNyZWF0ZWRBdDogdG9kby5jcmVhdGVkQXQsXG4gICAgICB1cGRhdGVkQXQ6IHRvZG8udXBkYXRlZEF0LFxuICAgIH07XG4gICAgXG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlRGF0YSwgJ1RvZG8gY3JlYXRlZCBzdWNjZXNzZnVsbHknLCAyMDEpO1xuICAgIFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICBcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICBjb25zdCBlcnJvclN0YWNrID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnN0YWNrIDogdW5kZWZpbmVkO1xuICAgIFxuICAgIGxvZ0Vycm9yKCdFcnJvciBjcmVhdGluZyB0b2RvJywge1xuICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxuICAgICAgZHVyYXRpb24sXG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNTAwLCAnSU5URVJOQUxfRVJST1InLCAnRmFpbGVkIHRvIGNyZWF0ZSB0b2RvJyk7XG4gIH1cbn07Il19