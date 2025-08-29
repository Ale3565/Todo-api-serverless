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
    const todoId = event.pathParameters?.id;
    try {
        if (!todoId) {
            (0, logger_1.logError)('TodoId parameter is missing');
            return (0, response_1.errorResponse)(400, 'MISSING_ID', 'Todo ID is required');
        }
        (0, logger_1.logInfo)('Getting todo by ID', {
            todoId,
            httpMethod: event.httpMethod,
            path: event.path,
            tableName: dynamodb_1.TABLE_NAME
        });
        let result;
        try {
            result = await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.GetCommand({
                TableName: dynamodb_1.TABLE_NAME,
                Key: { todoId }
            }));
            (0, logger_1.logInfo)('DynamoDB response received', {
                result,
                hasItem: !!result.Item,
                todoId
            });
        }
        catch (dbError) {
            (0, logger_1.logError)('DynamoDB operation failed', {
                error: dbError,
                todoId,
                tableName: dynamodb_1.TABLE_NAME
            });
            return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Database operation failed');
        }
        if (!result.Item) {
            (0, logger_1.logInfo)('Todo not found', { todoId });
            return (0, response_1.errorResponse)(404, 'NOT_FOUND', 'Todo not found');
        }
        try {
            await (0, cloudwatch_1.publishMetric)('TodoRetrievedCount', 1);
        }
        catch (metricError) {
            (0, logger_1.logError)('Error publishing metric', { error: metricError });
            // Continue execution even if metric publishing fails
        }
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todo retrieved successfully', {
            todoId,
            duration
        });
        return (0, response_1.successResponse)(result.Item, 'Todo retrieved successfully');
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        (0, logger_1.logError)('Unexpected error getting todo', {
            todoId,
            error: errorMessage,
            duration
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to get todo');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZXQtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBbUQ7QUFFbkQsZ0RBQXlEO0FBQ3pELGdEQUFtRTtBQUNuRSw0Q0FBb0Q7QUFDcEQsb0RBQW9EO0FBRTdDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDMUIsS0FBMkIsRUFDSyxFQUFFO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM3QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztJQUV4QyxJQUFJLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUEsZ0JBQU8sRUFBQyxvQkFBb0IsRUFBRTtZQUM1QixNQUFNO1lBQ04sVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO1lBQzVCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixTQUFTLEVBQUUscUJBQVU7U0FDdEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLENBQUM7WUFDSCxNQUFNLEdBQUcsTUFBTSxtQkFBUSxDQUFDLElBQUksQ0FDMUIsSUFBSSx5QkFBVSxDQUFDO2dCQUNiLFNBQVMsRUFBRSxxQkFBVTtnQkFDckIsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFO2FBQ2hCLENBQUMsQ0FDSCxDQUFDO1lBRUYsSUFBQSxnQkFBTyxFQUFDLDRCQUE0QixFQUFFO2dCQUNwQyxNQUFNO2dCQUNOLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQ3RCLE1BQU07YUFDUCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFBLGlCQUFRLEVBQUMsMkJBQTJCLEVBQUU7Z0JBQ3BDLEtBQUssRUFBRSxPQUFPO2dCQUNkLE1BQU07Z0JBQ04sU0FBUyxFQUFFLHFCQUFVO2FBQ3RCLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQixJQUFBLGdCQUFPLEVBQUMsZ0JBQWdCLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFBLDBCQUFhLEVBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUFDLE9BQU8sV0FBVyxFQUFFLENBQUM7WUFDckIsSUFBQSxpQkFBUSxFQUFDLHlCQUF5QixFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDNUQscURBQXFEO1FBQ3ZELENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLElBQUEsZ0JBQU8sRUFBQyw2QkFBNkIsRUFBRTtZQUNyQyxNQUFNO1lBQ04sUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILE9BQU8sSUFBQSwwQkFBZSxFQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDeEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUM7UUFFdkYsSUFBQSxpQkFBUSxFQUFDLCtCQUErQixFQUFFO1lBQ3hDLE1BQU07WUFDTixLQUFLLEVBQUUsWUFBWTtZQUNuQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDcEUsQ0FBQztBQUNILENBQUMsQ0FBQztBQXpFVyxRQUFBLE9BQU8sV0F5RWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBHZXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuXHJcbmltcG9ydCB7IGR5bmFtb0RiLCBUQUJMRV9OQU1FIH0gZnJvbSAnLi4vdXRpbHMvZHluYW1vZGInO1xyXG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XHJcbmltcG9ydCB7IGxvZ0luZm8sIGxvZ0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcclxuaW1wb3J0IHsgcHVibGlzaE1ldHJpYyB9IGZyb20gJy4uL3V0aWxzL2Nsb3Vkd2F0Y2gnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoXHJcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XHJcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XHJcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICBjb25zdCB0b2RvSWQgPSBldmVudC5wYXRoUGFyYW1ldGVycz8uaWQ7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBpZiAoIXRvZG9JZCkge1xyXG4gICAgICBsb2dFcnJvcignVG9kb0lkIHBhcmFtZXRlciBpcyBtaXNzaW5nJyk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01JU1NJTkdfSUQnLCAnVG9kbyBJRCBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvZ0luZm8oJ0dldHRpbmcgdG9kbyBieSBJRCcsIHtcclxuICAgICAgdG9kb0lkLFxyXG4gICAgICBodHRwTWV0aG9kOiBldmVudC5odHRwTWV0aG9kLFxyXG4gICAgICBwYXRoOiBldmVudC5wYXRoLFxyXG4gICAgICB0YWJsZU5hbWU6IFRBQkxFX05BTUVcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCByZXN1bHQ7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXN1bHQgPSBhd2FpdCBkeW5hbW9EYi5zZW5kKFxyXG4gICAgICAgIG5ldyBHZXRDb21tYW5kKHtcclxuICAgICAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcclxuICAgICAgICAgIEtleTogeyB0b2RvSWQgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBsb2dJbmZvKCdEeW5hbW9EQiByZXNwb25zZSByZWNlaXZlZCcsIHsgXHJcbiAgICAgICAgcmVzdWx0LFxyXG4gICAgICAgIGhhc0l0ZW06ICEhcmVzdWx0Lkl0ZW0sXHJcbiAgICAgICAgdG9kb0lkIFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGRiRXJyb3IpIHtcclxuICAgICAgbG9nRXJyb3IoJ0R5bmFtb0RCIG9wZXJhdGlvbiBmYWlsZWQnLCB7IFxyXG4gICAgICAgIGVycm9yOiBkYkVycm9yLFxyXG4gICAgICAgIHRvZG9JZCxcclxuICAgICAgICB0YWJsZU5hbWU6IFRBQkxFX05BTUVcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDUwMCwgJ0RCX0VSUk9SJywgJ0RhdGFiYXNlIG9wZXJhdGlvbiBmYWlsZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3VsdC5JdGVtKSB7XHJcbiAgICAgIGxvZ0luZm8oJ1RvZG8gbm90IGZvdW5kJywgeyB0b2RvSWQgfSk7XHJcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwNCwgJ05PVF9GT1VORCcsICdUb2RvIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9SZXRyaWV2ZWRDb3VudCcsIDEpO1xyXG4gICAgfSBjYXRjaCAobWV0cmljRXJyb3IpIHtcclxuICAgICAgbG9nRXJyb3IoJ0Vycm9yIHB1Ymxpc2hpbmcgbWV0cmljJywgeyBlcnJvcjogbWV0cmljRXJyb3IgfSk7XHJcbiAgICAgIC8vIENvbnRpbnVlIGV4ZWN1dGlvbiBldmVuIGlmIG1ldHJpYyBwdWJsaXNoaW5nIGZhaWxzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgbG9nSW5mbygnVG9kbyByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5Jywge1xyXG4gICAgICB0b2RvSWQsXHJcbiAgICAgIGR1cmF0aW9uXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHJlc3VsdC5JdGVtLCAnVG9kbyByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcclxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xyXG4gICAgXHJcbiAgICBsb2dFcnJvcignVW5leHBlY3RlZCBlcnJvciBnZXR0aW5nIHRvZG8nLCB7XHJcbiAgICAgIHRvZG9JZCxcclxuICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcclxuICAgICAgZHVyYXRpb25cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdJTlRFUk5BTF9FUlJPUicsICdGYWlsZWQgdG8gZ2V0IHRvZG8nKTtcclxuICB9XHJcbn07Il19