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
        (0, logger_1.logInfo)('Deleting todo', {
            todoId,
            httpMethod: event.httpMethod,
            path: event.path,
            tableName: dynamodb_1.TABLE_NAME
        });
        try {
            await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.DeleteCommand({
                TableName: dynamodb_1.TABLE_NAME,
                Key: { todoId },
                ConditionExpression: 'attribute_exists(todoId)',
            }));
            (0, logger_1.logInfo)('Todo deleted successfully', { todoId });
        }
        catch (dbError) {
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
            (0, logger_1.logError)('DynamoDB error deleting todo', {
                error: errorMessage,
                todoId,
                errorName: dbError instanceof Error ? dbError.name : 'Unknown'
            });
            // Check if this is a conditional check failure (todo not found)
            if (dbError instanceof Error && dbError.name === 'ConditionalCheckFailedException') {
                return (0, response_1.errorResponse)(404, 'TODO_NOT_FOUND', 'Todo not found');
            }
            return (0, response_1.errorResponse)(500, 'DB_ERROR', 'Database error occurred while deleting todo');
        }
        // Publish metric (don't fail the request if this fails)
        try {
            await (0, cloudwatch_1.publishMetric)('TodoDeletedCount', 1);
        }
        catch (metricError) {
            (0, logger_1.logError)('Error publishing metric', {
                error: metricError instanceof Error ? metricError.message : 'Unknown metric error'
            });
            // Continue execution - metrics errors shouldn't affect the API response
        }
        const duration = Date.now() - startTime;
        (0, logger_1.logInfo)('Delete operation completed successfully', {
            todoId,
            duration
        });
        // Return 204 (No Content) response
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
            },
            body: '',
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        (0, logger_1.logError)('Unexpected error deleting todo', {
            todoId,
            error: errorMessage,
            duration
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to delete todo');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLXRvZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWxldGUtdG9kby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBc0Q7QUFFdEQsZ0RBQXlEO0FBQ3pELGdEQUFrRDtBQUNsRCw0Q0FBb0Q7QUFDcEQsb0RBQW9EO0FBRTdDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDMUIsS0FBMkIsRUFDSyxFQUFFO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM3QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztJQUV4QyxJQUFJLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixJQUFBLGlCQUFRLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUEsZ0JBQU8sRUFBQyxlQUFlLEVBQUU7WUFDdkIsTUFBTTtZQUNOLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsU0FBUyxFQUFFLHFCQUFVO1NBQ3RCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQztZQUNILE1BQU0sbUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBYSxDQUFDO2dCQUNwQyxTQUFTLEVBQUUscUJBQVU7Z0JBQ3JCLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRTtnQkFDZixtQkFBbUIsRUFBRSwwQkFBMEI7YUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFBLGdCQUFPLEVBQUMsMkJBQTJCLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFBQyxPQUFPLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLE1BQU0sWUFBWSxHQUFHLE9BQU8sWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDO1lBQzNGLElBQUEsaUJBQVEsRUFBQyw4QkFBOEIsRUFBRTtnQkFDdkMsS0FBSyxFQUFFLFlBQVk7Z0JBQ25CLE1BQU07Z0JBQ04sU0FBUyxFQUFFLE9BQU8sWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDL0QsQ0FBQyxDQUFDO1lBRUgsZ0VBQWdFO1lBQ2hFLElBQUksT0FBTyxZQUFZLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGlDQUFpQyxFQUFFLENBQUM7Z0JBQ25GLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7WUFFRCxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVELHdEQUF3RDtRQUN4RCxJQUFJLENBQUM7WUFDSCxNQUFNLElBQUEsMEJBQWEsRUFBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQUMsT0FBTyxXQUFXLEVBQUUsQ0FBQztZQUNyQixJQUFBLGlCQUFRLEVBQUMseUJBQXlCLEVBQUU7Z0JBQ2xDLEtBQUssRUFBRSxXQUFXLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7YUFDbkYsQ0FBQyxDQUFDO1lBQ0gsd0VBQXdFO1FBQzFFLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLElBQUEsZ0JBQU8sRUFBQyx5Q0FBeUMsRUFBRTtZQUNqRCxNQUFNO1lBQ04sUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILG1DQUFtQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCLEVBQUUsR0FBRztnQkFDbEMsOEJBQThCLEVBQUUsaURBQWlEO2dCQUNqRiw4QkFBOEIsRUFBRSw2QkFBNkI7YUFDOUQ7WUFDRCxJQUFJLEVBQUUsRUFBRTtTQUNULENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDeEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUM7UUFFdkYsSUFBQSxpQkFBUSxFQUFDLGdDQUFnQyxFQUFFO1lBQ3pDLE1BQU07WUFDTixLQUFLLEVBQUUsWUFBWTtZQUNuQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDdkUsQ0FBQztBQUNILENBQUMsQ0FBQztBQWpGVyxRQUFBLE9BQU8sV0FpRmxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRGVsZXRlQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XG5cbmltcG9ydCB7IGR5bmFtb0RiLCBUQUJMRV9OQU1FIH0gZnJvbSAnLi4vdXRpbHMvZHluYW1vZGInO1xuaW1wb3J0IHsgZXJyb3JSZXNwb25zZSB9IGZyb20gJy4uL3V0aWxzL3Jlc3BvbnNlJztcbmltcG9ydCB7IGxvZ0luZm8sIGxvZ0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IHB1Ymxpc2hNZXRyaWMgfSBmcm9tICcuLi91dGlscy9jbG91ZHdhdGNoJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxuKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdG9kb0lkID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkO1xuXG4gIHRyeSB7XG4gICAgaWYgKCF0b2RvSWQpIHtcbiAgICAgIGxvZ0Vycm9yKCdUb2RvSWQgcGFyYW1ldGVyIGlzIG1pc3NpbmcnKTtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01JU1NJTkdfSUQnLCAnVG9kbyBJRCBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIGxvZ0luZm8oJ0RlbGV0aW5nIHRvZG8nLCB7XG4gICAgICB0b2RvSWQsXG4gICAgICBodHRwTWV0aG9kOiBldmVudC5odHRwTWV0aG9kLFxuICAgICAgcGF0aDogZXZlbnQucGF0aCxcbiAgICAgIHRhYmxlTmFtZTogVEFCTEVfTkFNRVxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGR5bmFtb0RiLnNlbmQobmV3IERlbGV0ZUNvbW1hbmQoe1xuICAgICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXG4gICAgICAgIEtleTogeyB0b2RvSWQgfSxcbiAgICAgICAgQ29uZGl0aW9uRXhwcmVzc2lvbjogJ2F0dHJpYnV0ZV9leGlzdHModG9kb0lkKScsXG4gICAgICB9KSk7XG5cbiAgICAgIGxvZ0luZm8oJ1RvZG8gZGVsZXRlZCBzdWNjZXNzZnVsbHknLCB7IHRvZG9JZCB9KTtcbiAgICB9IGNhdGNoIChkYkVycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBkYkVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBkYkVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBkYXRhYmFzZSBlcnJvcic7XG4gICAgICBsb2dFcnJvcignRHluYW1vREIgZXJyb3IgZGVsZXRpbmcgdG9kbycsIHsgXG4gICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsIFxuICAgICAgICB0b2RvSWQsXG4gICAgICAgIGVycm9yTmFtZTogZGJFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZGJFcnJvci5uYW1lIDogJ1Vua25vd24nXG4gICAgICB9KTtcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGNvbmRpdGlvbmFsIGNoZWNrIGZhaWx1cmUgKHRvZG8gbm90IGZvdW5kKVxuICAgICAgaWYgKGRiRXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBkYkVycm9yLm5hbWUgPT09ICdDb25kaXRpb25hbENoZWNrRmFpbGVkRXhjZXB0aW9uJykge1xuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDQsICdUT0RPX05PVF9GT1VORCcsICdUb2RvIG5vdCBmb3VuZCcpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdEQl9FUlJPUicsICdEYXRhYmFzZSBlcnJvciBvY2N1cnJlZCB3aGlsZSBkZWxldGluZyB0b2RvJyk7XG4gICAgfVxuXG4gICAgLy8gUHVibGlzaCBtZXRyaWMgKGRvbid0IGZhaWwgdGhlIHJlcXVlc3QgaWYgdGhpcyBmYWlscylcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcHVibGlzaE1ldHJpYygnVG9kb0RlbGV0ZWRDb3VudCcsIDEpO1xuICAgIH0gY2F0Y2ggKG1ldHJpY0Vycm9yKSB7XG4gICAgICBsb2dFcnJvcignRXJyb3IgcHVibGlzaGluZyBtZXRyaWMnLCB7IFxuICAgICAgICBlcnJvcjogbWV0cmljRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IG1ldHJpY0Vycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBtZXRyaWMgZXJyb3InIFxuICAgICAgfSk7XG4gICAgICAvLyBDb250aW51ZSBleGVjdXRpb24gLSBtZXRyaWNzIGVycm9ycyBzaG91bGRuJ3QgYWZmZWN0IHRoZSBBUEkgcmVzcG9uc2VcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgbG9nSW5mbygnRGVsZXRlIG9wZXJhdGlvbiBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5Jywge1xuICAgICAgdG9kb0lkLFxuICAgICAgZHVyYXRpb25cbiAgICB9KTtcblxuICAgIC8vIFJldHVybiAyMDQgKE5vIENvbnRlbnQpIHJlc3BvbnNlXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwNCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXknLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdPUFRJT05TLFBPU1QsR0VULFBVVCxERUxFVEUnLFxuICAgICAgfSxcbiAgICAgIGJvZHk6ICcnLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgIFxuICAgIGxvZ0Vycm9yKCdVbmV4cGVjdGVkIGVycm9yIGRlbGV0aW5nIHRvZG8nLCB7XG4gICAgICB0b2RvSWQsXG4gICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgZHVyYXRpb25cbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdJTlRFUk5BTF9FUlJPUicsICdGYWlsZWQgdG8gZGVsZXRlIHRvZG8nKTtcbiAgfVxufTsiXX0=