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
        (0, logger_1.logInfo)('Listing all todos', {
            httpMethod: event.httpMethod,
            path: event.path,
            tableName: dynamodb_1.TABLE_NAME
        });
        let result;
        try {
            result = await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.ScanCommand({
                TableName: dynamodb_1.TABLE_NAME,
            }));
            (0, logger_1.logInfo)('DynamoDB scan completed', {
                itemCount: result.Items?.length || 0,
                tableName: dynamodb_1.TABLE_NAME
            });
        }
        catch (dbError) {
            (0, logger_1.logError)('DynamoDB scan failed', {
                error: dbError instanceof Error ? dbError.message : 'Unknown database error',
                tableName: dynamodb_1.TABLE_NAME
            });
            return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Database operation failed');
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
            await (0, cloudwatch_1.publishMetric)('TodosListedCount', 1);
        }
        catch (metricError) {
            (0, logger_1.logError)('Error publishing metric', {
                error: metricError instanceof Error ? metricError.message : 'Unknown metric error'
            });
            // Continue execution even if metric publishing fails
        }
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Todos listed successfully', {
            count: todos.length,
            duration,
        });
        return (0, response_1.successResponse)({
            todos,
            count: todos.length,
        }, 'Todos retrieved successfully');
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        (0, logger_1.logError)('Unexpected error listing todos', {
            error: errorMessage,
            duration,
        });
        // Cambiar a DB_ERROR para mantener consistencia con otros handlers
        return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Failed to list todos');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC10b2Rvcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QtdG9kb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0RBQW9EO0FBRXBELGdEQUF5RDtBQUN6RCxnREFBbUU7QUFDbkUsNENBQW9EO0FBQ3BELG9EQUFvRDtBQUU3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQzFCLEtBQTJCLEVBQ0ssRUFBRTtJQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFN0IsSUFBSSxDQUFDO1FBQ0gsSUFBQSxnQkFBTyxFQUFDLG1CQUFtQixFQUFFO1lBQzNCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsU0FBUyxFQUFFLHFCQUFVO1NBQ3RCLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDO1FBQ1gsSUFBSSxDQUFDO1lBQ0gsTUFBTSxHQUFHLE1BQU0sbUJBQVEsQ0FBQyxJQUFJLENBQzFCLElBQUksMEJBQVcsQ0FBQztnQkFDZCxTQUFTLEVBQUUscUJBQVU7YUFDdEIsQ0FBQyxDQUNILENBQUM7WUFFRixJQUFBLGdCQUFPLEVBQUMseUJBQXlCLEVBQUU7Z0JBQ2pDLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO2dCQUNwQyxTQUFTLEVBQUUscUJBQVU7YUFDdEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLE9BQU8sT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBQSxpQkFBUSxFQUFDLHNCQUFzQixFQUFFO2dCQUMvQixLQUFLLEVBQUUsT0FBTyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCO2dCQUM1RSxTQUFTLEVBQUUscUJBQVU7YUFDdEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCwyREFBMkQ7UUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFFakMsa0VBQWtFO1FBQ2xFLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNyQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE1BQU0sSUFBQSwwQkFBYSxFQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFBQyxPQUFPLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLElBQUEsaUJBQVEsRUFBQyx5QkFBeUIsRUFBRTtnQkFDbEMsS0FBSyxFQUFFLFdBQVcsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjthQUNuRixDQUFDLENBQUM7WUFDSCxxREFBcUQ7UUFDdkQsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFeEMsSUFBQSxnQkFBTyxFQUFDLDJCQUEyQixFQUFFO1lBQ25DLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNuQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLDBCQUFlLEVBQ3BCO1lBQ0UsS0FBSztZQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTTtTQUNwQixFQUNELDhCQUE4QixDQUMvQixDQUFDO0lBRUosQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLE1BQU0sWUFBWSxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDO1FBRXZGLElBQUEsaUJBQVEsRUFBQyxnQ0FBZ0MsRUFBRTtZQUN6QyxLQUFLLEVBQUUsWUFBWTtZQUNuQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsbUVBQW1FO1FBQ25FLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUNoRSxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBaEZXLFFBQUEsT0FBTyxXQWdGbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XHJcbmltcG9ydCB7IFNjYW5Db21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuXHJcbmltcG9ydCB7IGR5bmFtb0RiLCBUQUJMRV9OQU1FIH0gZnJvbSAnLi4vdXRpbHMvZHluYW1vZGInO1xyXG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XHJcbmltcG9ydCB7IGxvZ0luZm8sIGxvZ0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcclxuaW1wb3J0IHsgcHVibGlzaE1ldHJpYyB9IGZyb20gJy4uL3V0aWxzL2Nsb3Vkd2F0Y2gnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoXHJcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XHJcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XHJcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICBcclxuICB0cnkge1xyXG4gICAgbG9nSW5mbygnTGlzdGluZyBhbGwgdG9kb3MnLCB7XHJcbiAgICAgIGh0dHBNZXRob2Q6IGV2ZW50Lmh0dHBNZXRob2QsXHJcbiAgICAgIHBhdGg6IGV2ZW50LnBhdGgsXHJcbiAgICAgIHRhYmxlTmFtZTogVEFCTEVfTkFNRVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHJlc3VsdDtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RiLnNlbmQoXHJcbiAgICAgICAgbmV3IFNjYW5Db21tYW5kKHtcclxuICAgICAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgbG9nSW5mbygnRHluYW1vREIgc2NhbiBjb21wbGV0ZWQnLCB7IFxyXG4gICAgICAgIGl0ZW1Db3VudDogcmVzdWx0Lkl0ZW1zPy5sZW5ndGggfHwgMCxcclxuICAgICAgICB0YWJsZU5hbWU6IFRBQkxFX05BTUUgXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZGJFcnJvcikge1xyXG4gICAgICBsb2dFcnJvcignRHluYW1vREIgc2NhbiBmYWlsZWQnLCB7IFxyXG4gICAgICAgIGVycm9yOiBkYkVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBkYkVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBkYXRhYmFzZSBlcnJvcicsXHJcbiAgICAgICAgdGFibGVOYW1lOiBUQUJMRV9OQU1FXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdEQl9FUlJPUicsICdEYXRhYmFzZSBvcGVyYXRpb24gZmFpbGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXNlZ3VyYXJzZSBkZSBxdWUgcmVzdWx0Lkl0ZW1zIGV4aXN0ZSBhbnRlcyBkZSBjb250aW51YXJcclxuICAgIGNvbnN0IHRvZG9zID0gcmVzdWx0Lkl0ZW1zIHx8IFtdO1xyXG4gICAgXHJcbiAgICAvLyBPcmRlbmFyIGxvcyB0b2RvcyBwb3IgZmVjaGEgZGUgY3JlYWNpw7NuIChtw6FzIHJlY2llbnRlcyBwcmltZXJvKVxyXG4gICAgaWYgKHRvZG9zLmxlbmd0aCA+IDApIHtcclxuICAgICAgdG9kb3Muc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGVBID0gbmV3IERhdGUoYS5jcmVhdGVkQXQpLmdldFRpbWUoKTtcclxuICAgICAgICBjb25zdCBkYXRlQiA9IG5ldyBEYXRlKGIuY3JlYXRlZEF0KS5nZXRUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGVCIC0gZGF0ZUE7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9zTGlzdGVkQ291bnQnLCAxKTtcclxuICAgIH0gY2F0Y2ggKG1ldHJpY0Vycm9yKSB7XHJcbiAgICAgIGxvZ0Vycm9yKCdFcnJvciBwdWJsaXNoaW5nIG1ldHJpYycsIHsgXHJcbiAgICAgICAgZXJyb3I6IG1ldHJpY0Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBtZXRyaWNFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gbWV0cmljIGVycm9yJyBcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIENvbnRpbnVlIGV4ZWN1dGlvbiBldmVuIGlmIG1ldHJpYyBwdWJsaXNoaW5nIGZhaWxzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgXHJcbiAgICBsb2dJbmZvKCdUb2RvcyBsaXN0ZWQgc3VjY2Vzc2Z1bGx5Jywge1xyXG4gICAgICBjb3VudDogdG9kb3MubGVuZ3RoLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UoXHJcbiAgICAgIHtcclxuICAgICAgICB0b2RvcyxcclxuICAgICAgICBjb3VudDogdG9kb3MubGVuZ3RoLFxyXG4gICAgICB9LFxyXG4gICAgICAnVG9kb3MgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseSdcclxuICAgICk7XHJcbiAgICBcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCc7XHJcbiAgICBcclxuICAgIGxvZ0Vycm9yKCdVbmV4cGVjdGVkIGVycm9yIGxpc3RpbmcgdG9kb3MnLCB7XHJcbiAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgIGR1cmF0aW9uLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIENhbWJpYXIgYSBEQl9FUlJPUiBwYXJhIG1hbnRlbmVyIGNvbnNpc3RlbmNpYSBjb24gb3Ryb3MgaGFuZGxlcnNcclxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDUwMCwgJ0RCX0VSUk9SJywgJ0ZhaWxlZCB0byBsaXN0IHRvZG9zJyk7XHJcbiAgfVxyXG59OyJdfQ==