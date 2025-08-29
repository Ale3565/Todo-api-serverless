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
        await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.PutCommand({
            TableName: dynamodb_1.TABLE_NAME,
            Item: todo,
        }));
        await (0, cloudwatch_1.publishMetric)('TodoCreatedCount', 1);
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todo created successfully', {
            todoId: todo.todoId,
            title: todo.title,
            duration,
        });
        return (0, response_1.successResponse)(todo, 'Todo created successfully', 201);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjcmVhdGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBbUQ7QUFDbkQsbUNBQW9DO0FBRXBDLGdEQUF5RDtBQUN6RCxnREFBbUU7QUFDbkUsNENBQW9EO0FBQ3BELG9EQUFvRDtBQUc3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQzFCLEtBQTJCLEVBQ0ssRUFBRTtJQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFN0IsSUFBSSxDQUFDO1FBQ0gsSUFBQSxnQkFBTyxFQUFDLG1CQUFtQixFQUFFO1lBQzNCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBR0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixJQUFBLGlCQUFRLEVBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNwQyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUdELElBQUksV0FBOEIsQ0FBQztRQUNuQyxJQUFJLENBQUM7WUFDSCxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUFDLE9BQU8sVUFBVSxFQUFFLENBQUM7WUFDcEIsTUFBTSxZQUFZLEdBQUcsVUFBVSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUM7WUFDaEcsSUFBQSxpQkFBUSxFQUFDLDhCQUE4QixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDbEUsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFHRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxPQUFPLFdBQVcsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDbkcsSUFBQSxpQkFBUSxFQUFDLHlCQUF5QixFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsa0RBQWtELENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBR0QsTUFBTSxNQUFNLEdBQUcsSUFBQSxtQkFBVSxHQUFFLENBQUM7UUFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVyQyxNQUFNLElBQUksR0FBUztZQUNqQixNQUFNO1lBQ04sS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQy9CLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7WUFDbEQsU0FBUyxFQUFFLEtBQUs7WUFDaEIsU0FBUyxFQUFFLEdBQUc7WUFDZCxTQUFTLEVBQUUsR0FBRztTQUNmLENBQUM7UUFHRixNQUFNLG1CQUFRLENBQUMsSUFBSSxDQUNqQixJQUFJLHlCQUFVLENBQUM7WUFDYixTQUFTLEVBQUUscUJBQVU7WUFDckIsSUFBSSxFQUFFLElBQUk7U0FDWCxDQUFDLENBQ0gsQ0FBQztRQUdGLE1BQU0sSUFBQSwwQkFBYSxFQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTNDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFeEMsSUFBQSxnQkFBTyxFQUFDLDJCQUEyQixFQUFFO1lBQ25DLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILE9BQU8sSUFBQSwwQkFBZSxFQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVqRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFeEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUM7UUFDdkYsTUFBTSxVQUFVLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXBFLElBQUEsaUJBQVEsRUFBQyxxQkFBcUIsRUFBRTtZQUM5QixLQUFLLEVBQUUsWUFBWTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDdkUsQ0FBQztBQUNILENBQUMsQ0FBQztBQWpGVyxRQUFBLE9BQU8sV0FpRmxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBQdXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gJ2NyeXB0byc7XHJcblxyXG5pbXBvcnQgeyBkeW5hbW9EYiwgVEFCTEVfTkFNRSB9IGZyb20gJy4uL3V0aWxzL2R5bmFtb2RiJztcclxuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xyXG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcbmltcG9ydCB7IHB1Ymxpc2hNZXRyaWMgfSBmcm9tICcuLi91dGlscy9jbG91ZHdhdGNoJztcclxuaW1wb3J0IHsgVG9kbywgQ3JlYXRlVG9kb1JlcXVlc3QgfSBmcm9tICcuLi90eXBlcy90b2RvJztcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKFxyXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxyXG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xyXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIGxvZ0luZm8oJ0NyZWF0aW5nIG5ldyB0b2RvJywge1xyXG4gICAgICBodHRwTWV0aG9kOiBldmVudC5odHRwTWV0aG9kLFxyXG4gICAgICBwYXRoOiBldmVudC5wYXRoLFxyXG4gICAgfSk7XHJcblxyXG4gICBcclxuICAgIGlmICghZXZlbnQuYm9keSkge1xyXG4gICAgICBsb2dFcnJvcignUmVxdWVzdCBib2R5IGlzIG1pc3NpbmcnKTtcclxuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnTUlTU0lOR19CT0RZJywgJ1JlcXVlc3QgYm9keSBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgbGV0IHJlcXVlc3RCb2R5OiBDcmVhdGVUb2RvUmVxdWVzdDtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcclxuICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcGFyc2VFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gcGFyc2VFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gcGFyc2luZyBlcnJvcic7XHJcbiAgICAgIGxvZ0Vycm9yKCdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5JywgeyBlcnJvcjogZXJyb3JNZXNzYWdlIH0pO1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJTlZBTElEX0pTT04nLCAnUmVxdWVzdCBib2R5IG11c3QgYmUgdmFsaWQgSlNPTicpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgaWYgKCFyZXF1ZXN0Qm9keS50aXRsZSB8fCB0eXBlb2YgcmVxdWVzdEJvZHkudGl0bGUgIT09ICdzdHJpbmcnIHx8IHJlcXVlc3RCb2R5LnRpdGxlLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgbG9nRXJyb3IoJ1RpdGxlIHZhbGlkYXRpb24gZmFpbGVkJywgeyB0aXRsZTogcmVxdWVzdEJvZHkudGl0bGUgfSk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ0lOVkFMSURfVElUTEUnLCAnVGl0bGUgaXMgcmVxdWlyZWQgYW5kIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICBcclxuICAgIGNvbnN0IHRvZG9JZCA9IHJhbmRvbVVVSUQoKTtcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICAgIFxyXG4gICAgY29uc3QgdG9kbzogVG9kbyA9IHtcclxuICAgICAgdG9kb0lkLFxyXG4gICAgICB0aXRsZTogcmVxdWVzdEJvZHkudGl0bGUudHJpbSgpLFxyXG4gICAgICBkZXNjcmlwdGlvbjogcmVxdWVzdEJvZHkuZGVzY3JpcHRpb24/LnRyaW0oKSB8fCAnJyxcclxuICAgICAgY29tcGxldGVkOiBmYWxzZSxcclxuICAgICAgY3JlYXRlZEF0OiBub3csXHJcbiAgICAgIHVwZGF0ZWRBdDogbm93LFxyXG4gICAgfTtcclxuXHJcbiAgICBcclxuICAgIGF3YWl0IGR5bmFtb0RiLnNlbmQoXHJcbiAgICAgIG5ldyBQdXRDb21tYW5kKHtcclxuICAgICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICAgICAgSXRlbTogdG9kbyxcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgXHJcbiAgICBhd2FpdCBwdWJsaXNoTWV0cmljKCdUb2RvQ3JlYXRlZENvdW50JywgMSk7XHJcblxyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgXHJcbiAgICBsb2dJbmZvKCdUb2RvIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5Jywge1xyXG4gICAgICB0b2RvSWQ6IHRvZG8udG9kb0lkLFxyXG4gICAgICB0aXRsZTogdG9kby50aXRsZSxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHRvZG8sICdUb2RvIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JywgMjAxKTtcclxuICAgIFxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICBcclxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xyXG4gICAgY29uc3QgZXJyb3JTdGFjayA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5zdGFjayA6IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgbG9nRXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHRvZG8nLCB7XHJcbiAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdJTlRFUk5BTF9FUlJPUicsICdGYWlsZWQgdG8gY3JlYXRlIHRvZG8nKTtcclxuICB9XHJcbn07Il19