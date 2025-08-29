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
        });
        const result = await dynamodb_1.dynamoDb.send(new lib_dynamodb_1.ScanCommand({
            TableName: dynamodb_1.TABLE_NAME,
        }));
        const todos = result.Items || [];
        todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        await (0, cloudwatch_1.publishMetric)('TodosListedCount', 1);
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
        const errorStack = error instanceof Error ? error.stack : undefined;
        (0, logger_1.logError)('Error listing todos', {
            error: errorMessage,
            stack: errorStack,
            duration,
        });
        return (0, response_1.errorResponse)(500, 'INTERNAL_ERROR', 'Failed to list todos');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC10b2Rvcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QtdG9kb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0RBQW9EO0FBRXBELGdEQUF5RDtBQUN6RCxnREFBbUU7QUFDbkUsNENBQW9EO0FBQ3BELG9EQUFvRDtBQUU3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQzFCLEtBQTJCLEVBQ0ssRUFBRTtJQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFN0IsSUFBSSxDQUFDO1FBQ0gsSUFBQSxnQkFBTyxFQUFDLG1CQUFtQixFQUFFO1lBQzNCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBR0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxtQkFBUSxDQUFDLElBQUksQ0FDaEMsSUFBSSwwQkFBVyxDQUFDO1lBQ2QsU0FBUyxFQUFFLHFCQUFVO1NBQ3RCLENBQUMsQ0FDSCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFHakMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUNsQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUNsRSxDQUFDO1FBRUYsTUFBTSxJQUFBLDBCQUFhLEVBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFM0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUV4QyxJQUFBLGdCQUFPLEVBQUMsMkJBQTJCLEVBQUU7WUFDbkMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ25CLFFBQVE7U0FDVCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsMEJBQWUsRUFDcEI7WUFDRSxLQUFLO1lBQ0wsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO1NBQ3BCLEVBQ0QsOEJBQThCLENBQy9CLENBQUM7SUFFSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFeEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUM7UUFDdkYsTUFBTSxVQUFVLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXBFLElBQUEsaUJBQVEsRUFBQyxxQkFBcUIsRUFBRTtZQUM5QixLQUFLLEVBQUUsWUFBWTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDdEUsQ0FBQztBQUNILENBQUMsQ0FBQztBQXhEVyxRQUFBLE9BQU8sV0F3RGxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBTY2FuQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XHJcblxyXG5pbXBvcnQgeyBkeW5hbW9EYiwgVEFCTEVfTkFNRSB9IGZyb20gJy4uL3V0aWxzL2R5bmFtb2RiJztcclxuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xyXG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcbmltcG9ydCB7IHB1Ymxpc2hNZXRyaWMgfSBmcm9tICcuLi91dGlscy9jbG91ZHdhdGNoJztcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKFxyXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxyXG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xyXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIGxvZ0luZm8oJ0xpc3RpbmcgYWxsIHRvZG9zJywge1xyXG4gICAgICBodHRwTWV0aG9kOiBldmVudC5odHRwTWV0aG9kLFxyXG4gICAgICBwYXRoOiBldmVudC5wYXRoLFxyXG4gICAgfSk7XHJcblxyXG4gICAgXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EYi5zZW5kKFxyXG4gICAgICBuZXcgU2NhbkNvbW1hbmQoe1xyXG4gICAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdG9kb3MgPSByZXN1bHQuSXRlbXMgfHwgW107XHJcbiAgICBcclxuICAgIFxyXG4gICAgdG9kb3Muc29ydCgoYSwgYikgPT4gXHJcbiAgICAgIG5ldyBEYXRlKGIuY3JlYXRlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCkuZ2V0VGltZSgpXHJcbiAgICApO1xyXG5cclxuICAgIGF3YWl0IHB1Ymxpc2hNZXRyaWMoJ1RvZG9zTGlzdGVkQ291bnQnLCAxKTtcclxuXHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICBcclxuICAgIGxvZ0luZm8oJ1RvZG9zIGxpc3RlZCBzdWNjZXNzZnVsbHknLCB7XHJcbiAgICAgIGNvdW50OiB0b2Rvcy5sZW5ndGgsXHJcbiAgICAgIGR1cmF0aW9uLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZShcclxuICAgICAge1xyXG4gICAgICAgIHRvZG9zLFxyXG4gICAgICAgIGNvdW50OiB0b2Rvcy5sZW5ndGgsXHJcbiAgICAgIH0sXHJcbiAgICAgICdUb2RvcyByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5J1xyXG4gICAgKTtcclxuICAgIFxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICBcclxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xyXG4gICAgY29uc3QgZXJyb3JTdGFjayA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5zdGFjayA6IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgbG9nRXJyb3IoJ0Vycm9yIGxpc3RpbmcgdG9kb3MnLCB7XHJcbiAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgIHN0YWNrOiBlcnJvclN0YWNrLFxyXG4gICAgICBkdXJhdGlvbixcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg1MDAsICdJTlRFUk5BTF9FUlJPUicsICdGYWlsZWQgdG8gbGlzdCB0b2RvcycpO1xyXG4gIH1cclxufTsiXX0=