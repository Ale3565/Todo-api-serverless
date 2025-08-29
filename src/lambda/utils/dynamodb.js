"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_NAME = exports.dynamoDb = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Create a function to get the DynamoDB client for better testability
const createDynamoDbClient = () => {
    const client = new client_dynamodb_1.DynamoDBClient({
        ...(process.env.NODE_ENV === 'test' && {
            endpoint: 'http://localhost:8000',
            region: 'local',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test'
            }
        }),
        region: process.env.AWS_REGION || 'us-east-1',
    });
    return lib_dynamodb_1.DynamoDBDocumentClient.from(client, {
        marshallOptions: {
            removeUndefinedValues: true,
            convertEmptyValues: true
        },
        unmarshallOptions: {
            wrapNumbers: false
        }
    });
};
// Export the client instance
exports.dynamoDb = createDynamoDbClient();
exports.TABLE_NAME = process.env.TABLE_NAME || 'Todos';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkeW5hbW9kYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4REFBMEQ7QUFDMUQsd0RBQStEO0FBRS9ELHNFQUFzRTtBQUN0RSxNQUFNLG9CQUFvQixHQUFHLEdBQUcsRUFBRTtJQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFjLENBQUM7UUFDaEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sSUFBSTtZQUNyQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLE1BQU0sRUFBRSxPQUFPO1lBQ2YsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixlQUFlLEVBQUUsTUFBTTthQUN4QjtTQUNGLENBQUM7UUFDRixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVztLQUM5QyxDQUFDLENBQUM7SUFFSCxPQUFPLHFDQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDekMsZUFBZSxFQUFFO1lBQ2YscUJBQXFCLEVBQUUsSUFBSTtZQUMzQixrQkFBa0IsRUFBRSxJQUFJO1NBQ3pCO1FBQ0QsaUJBQWlCLEVBQUU7WUFDakIsV0FBVyxFQUFFLEtBQUs7U0FDbkI7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRiw2QkFBNkI7QUFDaEIsUUFBQSxRQUFRLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztBQUVsQyxRQUFBLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJztcbmltcG9ydCB7IER5bmFtb0RCRG9jdW1lbnRDbGllbnQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuXG4vLyBDcmVhdGUgYSBmdW5jdGlvbiB0byBnZXQgdGhlIER5bmFtb0RCIGNsaWVudCBmb3IgYmV0dGVyIHRlc3RhYmlsaXR5XG5jb25zdCBjcmVhdGVEeW5hbW9EYkNsaWVudCA9ICgpID0+IHtcbiAgY29uc3QgY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtcbiAgICAuLi4ocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JyAmJiB7XG4gICAgICBlbmRwb2ludDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXG4gICAgICByZWdpb246ICdsb2NhbCcsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBhY2Nlc3NLZXlJZDogJ3Rlc3QnLFxuICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6ICd0ZXN0J1xuICAgICAgfVxuICAgIH0pLFxuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJyxcbiAgfSk7XG5cbiAgcmV0dXJuIER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShjbGllbnQsIHtcbiAgICBtYXJzaGFsbE9wdGlvbnM6IHtcbiAgICAgIHJlbW92ZVVuZGVmaW5lZFZhbHVlczogdHJ1ZSxcbiAgICAgIGNvbnZlcnRFbXB0eVZhbHVlczogdHJ1ZVxuICAgIH0sXG4gICAgdW5tYXJzaGFsbE9wdGlvbnM6IHtcbiAgICAgIHdyYXBOdW1iZXJzOiBmYWxzZVxuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBFeHBvcnQgdGhlIGNsaWVudCBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGR5bmFtb0RiID0gY3JlYXRlRHluYW1vRGJDbGllbnQoKTtcblxuZXhwb3J0IGNvbnN0IFRBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5UQUJMRV9OQU1FIHx8ICdUb2Rvcyc7Il19