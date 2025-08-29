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
        (0, logger_1.logInfo)('Deleting todo', {
            todoId,
            httpMethod: event.httpMethod,
            path: event.path,
        });
        await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.DeleteCommand({
            TableName: dynamodb_1.TABLE_NAME,
            Key: { todoId },
            ConditionExpression: 'attribute_exists(todoId)',
        }));
        await (0, cloudwatch_1.publishMetric)('TodoDeletedCount', 1);
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todo deleted successfully', {
            todoId,
            duration,
        });
        return {
            statusCode: 204,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
            },
            body: '',
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const isConditionalCheckError = error instanceof Error && 'name' in error && error.name === 'ConditionalCheckFailedException';
        if (isConditionalCheckError) {
            (0, logger_1.logError)('Todo not found for deletion', {
                todoId: event.pathParameters?.id,
                duration,
            });
            return (0, response_1.errorResponse)(404, 'NOT_FOUND', 'Todo not found');
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;
        (0, logger_1.logError)('Error deleting todo', {
            todoId: event.pathParameters?.id,
            error: errorMessage,
            stack: errorStack,
            duration,
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to delete todo');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWxldGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBc0Q7QUFFdEQsZ0RBQXlEO0FBQ3pELGdEQUFrRDtBQUNsRCw0Q0FBb0Q7QUFDcEQsb0RBQW9EO0FBRTdDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDMUIsS0FBMkIsRUFDSyxFQUFFO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUU3QixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztRQUV4QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUEsZ0JBQU8sRUFBQyxlQUFlLEVBQUU7WUFDdkIsTUFBTTtZQUNOLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxtQkFBUSxDQUFDLElBQUksQ0FDakIsSUFBSSw0QkFBYSxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxxQkFBVTtZQUNyQixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDZixtQkFBbUIsRUFBRSwwQkFBMEI7U0FDaEQsQ0FBQyxDQUNILENBQUM7UUFHRixNQUFNLElBQUEsMEJBQWEsRUFBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBRXhDLElBQUEsZ0JBQU8sRUFBQywyQkFBMkIsRUFBRTtZQUNuQyxNQUFNO1lBQ04sUUFBUTtTQUNULENBQUMsQ0FBQztRQUdILE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyw2QkFBNkIsRUFBRSxHQUFHO2dCQUNsQyw4QkFBOEIsRUFBRSxpREFBaUQ7Z0JBQ2pGLDhCQUE4QixFQUFFLDZCQUE2QjthQUM5RDtZQUNELElBQUksRUFBRSxFQUFFO1NBQ1QsQ0FBQztJQUVKLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUd4QyxNQUFNLHVCQUF1QixHQUFHLEtBQUssWUFBWSxLQUFLLElBQUksTUFBTSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLGlDQUFpQyxDQUFDO1FBRTlILElBQUksdUJBQXVCLEVBQUUsQ0FBQztZQUM1QixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLEVBQUU7Z0JBQ3RDLE1BQU0sRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUU7Z0JBQ2hDLFFBQVE7YUFDVCxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDO1FBQ3ZGLE1BQU0sVUFBVSxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVwRSxJQUFBLGlCQUFRLEVBQUMscUJBQXFCLEVBQUU7WUFDOUIsTUFBTSxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRTtZQUNoQyxLQUFLLEVBQUUsWUFBWTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDdkUsQ0FBQztBQUNILENBQUMsQ0FBQztBQTNFVyxRQUFBLE9BQU8sV0EyRWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBEZWxldGVDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuXHJcbmltcG9ydCB7IGR5bmFtb0RiLCBUQUJMRV9OQU1FIH0gZnJvbSAnLi4vdXRpbHMvZHluYW1vZGInO1xyXG5pbXBvcnQgeyBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xyXG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcbmltcG9ydCB7IHB1Ymxpc2hNZXRyaWMgfSBmcm9tICcuLi91dGlscy9jbG91ZHdhdGNoJztcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKFxyXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxyXG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xyXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHRvZG9JZCA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzPy5pZDtcclxuXHJcbiAgICBpZiAoIXRvZG9JZCkge1xyXG4gICAgICBsb2dFcnJvcignVG9kb0lkIHBhcmFtZXRlciBpcyBtaXNzaW5nJyk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01JU1NJTkdfSUQnLCAnVG9kbyBJRCBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvZ0luZm8oJ0RlbGV0aW5nIHRvZG8nLCB7XHJcbiAgICAgIHRvZG9JZCxcclxuICAgICAgaHR0cE1ldGhvZDogZXZlbnQuaHR0cE1ldGhvZCxcclxuICAgICAgcGF0aDogZXZlbnQucGF0aCxcclxuICAgIH0pO1xyXG5cclxuICAgIGF3YWl0IGR5bmFtb0RiLnNlbmQoXHJcbiAgICAgIG5ldyBEZWxldGVDb21tYW5kKHtcclxuICAgICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICAgICAgS2V5OiB7IHRvZG9JZCB9LFxyXG4gICAgICAgIENvbmRpdGlvbkV4cHJlc3Npb246ICdhdHRyaWJ1dGVfZXhpc3RzKHRvZG9JZCknLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICBcclxuICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9EZWxldGVkQ291bnQnLCAxKTtcclxuXHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICBcclxuICAgIGxvZ0luZm8oJ1RvZG8gZGVsZXRlZCBzdWNjZXNzZnVsbHknLCB7XHJcbiAgICAgIHRvZG9JZCxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICB9KTtcclxuXHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDIwNCxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleScsXHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnT1BUSU9OUyxQT1NULEdFVCxQVVQsREVMRVRFJyxcclxuICAgICAgfSxcclxuICAgICAgYm9keTogJycsXHJcbiAgICB9O1xyXG4gICAgXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBjb25zdCBpc0NvbmRpdGlvbmFsQ2hlY2tFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ25hbWUnIGluIGVycm9yICYmIGVycm9yLm5hbWUgPT09ICdDb25kaXRpb25hbENoZWNrRmFpbGVkRXhjZXB0aW9uJztcclxuICAgIFxyXG4gICAgaWYgKGlzQ29uZGl0aW9uYWxDaGVja0Vycm9yKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdUb2RvIG5vdCBmb3VuZCBmb3IgZGVsZXRpb24nLCB7XHJcbiAgICAgICAgdG9kb0lkOiBldmVudC5wYXRoUGFyYW1ldGVycz8uaWQsXHJcbiAgICAgICAgZHVyYXRpb24sXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDQsICdOT1RfRk9VTkQnLCAnVG9kbyBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcclxuICAgIGNvbnN0IGVycm9yU3RhY2sgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3Iuc3RhY2sgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgbG9nRXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHRvZG8nLCB7XHJcbiAgICAgIHRvZG9JZDogZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkLFxyXG4gICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxyXG4gICAgICBzdGFjazogZXJyb3JTdGFjayxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNTAwLCAnSU5URVJOQUxfRVJST1InLCAnRmFpbGVkIHRvIGRlbGV0ZSB0b2RvJyk7XHJcbiAgfVxyXG59OyJdfQ==