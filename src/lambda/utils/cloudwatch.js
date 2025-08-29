"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMetric = void 0;
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const cloudWatch = new client_cloudwatch_1.CloudWatchClient({
    ...(process.env.NODE_ENV === 'test' && {
        endpoint: 'http://localhost:4566',
        region: 'local',
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    }),
    region: process.env.AWS_REGION || 'us-east-1',
});
const publishMetric = async (metricName, value, unit = client_cloudwatch_1.StandardUnit.Count, namespace = 'TodoAPI') => {
    try {
        await cloudWatch.send(new client_cloudwatch_1.PutMetricDataCommand({
            Namespace: namespace,
            MetricData: [
                {
                    MetricName: metricName,
                    Value: value,
                    Unit: unit,
                    Timestamp: new Date(),
                },
            ],
        }));
    }
    catch (error) {
        console.error('Error publishing metric:', error);
        // No re-throw error in test environment to prevent test failures due to metrics
        if (process.env.NODE_ENV !== 'test') {
            throw error;
        }
    }
};
exports.publishMetric = publishMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWR3YXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNsb3Vkd2F0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0VBQWtHO0FBRWxHLE1BQU0sVUFBVSxHQUFHLElBQUksb0NBQWdCLENBQUM7SUFDdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sSUFBSTtRQUNyQyxRQUFRLEVBQUUsdUJBQXVCO1FBQ2pDLE1BQU0sRUFBRSxPQUFPO1FBQ2YsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFLE1BQU07WUFDbkIsZUFBZSxFQUFFLE1BQU07U0FDeEI7S0FDRixDQUFDO0lBQ0YsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVc7Q0FDOUMsQ0FBQyxDQUFDO0FBRUksTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUNoQyxVQUFrQixFQUNsQixLQUFhLEVBQ2IsT0FBcUIsZ0NBQVksQ0FBQyxLQUFLLEVBQ3ZDLFlBQW9CLFNBQVMsRUFDZCxFQUFFO0lBQ2pCLElBQUksQ0FBQztRQUNILE1BQU0sVUFBVSxDQUFDLElBQUksQ0FDbkIsSUFBSSx3Q0FBb0IsQ0FBQztZQUN2QixTQUFTLEVBQUUsU0FBUztZQUNwQixVQUFVLEVBQUU7Z0JBQ1Y7b0JBQ0UsVUFBVSxFQUFFLFVBQVU7b0JBQ3RCLEtBQUssRUFBRSxLQUFLO29CQUNaLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtpQkFDdEI7YUFDRjtTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELGdGQUFnRjtRQUNoRixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDLENBQUM7QUEzQlcsUUFBQSxhQUFhLGlCQTJCeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbG91ZFdhdGNoQ2xpZW50LCBQdXRNZXRyaWNEYXRhQ29tbWFuZCwgU3RhbmRhcmRVbml0IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gnO1xyXG5cclxuY29uc3QgY2xvdWRXYXRjaCA9IG5ldyBDbG91ZFdhdGNoQ2xpZW50KHtcclxuICAuLi4ocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JyAmJiB7XHJcbiAgICBlbmRwb2ludDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDU2NicsXHJcbiAgICByZWdpb246ICdsb2NhbCcsXHJcbiAgICBjcmVkZW50aWFsczoge1xyXG4gICAgICBhY2Nlc3NLZXlJZDogJ3Rlc3QnLFxyXG4gICAgICBzZWNyZXRBY2Nlc3NLZXk6ICd0ZXN0J1xyXG4gICAgfVxyXG4gIH0pLFxyXG4gIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJyxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgcHVibGlzaE1ldHJpYyA9IGFzeW5jIChcclxuICBtZXRyaWNOYW1lOiBzdHJpbmcsXHJcbiAgdmFsdWU6IG51bWJlcixcclxuICB1bml0OiBTdGFuZGFyZFVuaXQgPSBTdGFuZGFyZFVuaXQuQ291bnQsXHJcbiAgbmFtZXNwYWNlOiBzdHJpbmcgPSAnVG9kb0FQSSdcclxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGNsb3VkV2F0Y2guc2VuZChcclxuICAgICAgbmV3IFB1dE1ldHJpY0RhdGFDb21tYW5kKHtcclxuICAgICAgICBOYW1lc3BhY2U6IG5hbWVzcGFjZSxcclxuICAgICAgICBNZXRyaWNEYXRhOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIE1ldHJpY05hbWU6IG1ldHJpY05hbWUsXHJcbiAgICAgICAgICAgIFZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgVW5pdDogdW5pdCwgXHJcbiAgICAgICAgICAgIFRpbWVzdGFtcDogbmV3IERhdGUoKSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHB1Ymxpc2hpbmcgbWV0cmljOicsIGVycm9yKTtcclxuICAgIC8vIE5vIHJlLXRocm93IGVycm9yIGluIHRlc3QgZW52aXJvbm1lbnQgdG8gcHJldmVudCB0ZXN0IGZhaWx1cmVzIGR1ZSB0byBtZXRyaWNzXHJcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICB9XHJcbn07Il19