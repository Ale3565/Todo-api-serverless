"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMetric = void 0;
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const cloudWatch = new client_cloudwatch_1.CloudWatchClient({
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
    }
};
exports.publishMetric = publishMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWR3YXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNsb3Vkd2F0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0VBQWtHO0FBRWxHLE1BQU0sVUFBVSxHQUFHLElBQUksb0NBQWdCLENBQUM7SUFFdEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVc7Q0FDOUMsQ0FBQyxDQUFDO0FBRUksTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUNoQyxVQUFrQixFQUNsQixLQUFhLEVBQ2IsT0FBcUIsZ0NBQVksQ0FBQyxLQUFLLEVBQ3ZDLFlBQW9CLFNBQVMsRUFDZCxFQUFFO0lBQ2pCLElBQUksQ0FBQztRQUNILE1BQU0sVUFBVSxDQUFDLElBQUksQ0FDbkIsSUFBSSx3Q0FBb0IsQ0FBQztZQUN2QixTQUFTLEVBQUUsU0FBUztZQUNwQixVQUFVLEVBQUU7Z0JBQ1Y7b0JBQ0UsVUFBVSxFQUFFLFVBQVU7b0JBQ3RCLEtBQUssRUFBRSxLQUFLO29CQUNaLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtpQkFDdEI7YUFDRjtTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7QUFDSCxDQUFDLENBQUM7QUF2QlcsUUFBQSxhQUFhLGlCQXVCeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbG91ZFdhdGNoQ2xpZW50LCBQdXRNZXRyaWNEYXRhQ29tbWFuZCwgU3RhbmRhcmRVbml0IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3Vkd2F0Y2gnO1xyXG5cclxuY29uc3QgY2xvdWRXYXRjaCA9IG5ldyBDbG91ZFdhdGNoQ2xpZW50KHtcclxuICBcclxuICByZWdpb246IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMScsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IHB1Ymxpc2hNZXRyaWMgPSBhc3luYyAoXHJcbiAgbWV0cmljTmFtZTogc3RyaW5nLFxyXG4gIHZhbHVlOiBudW1iZXIsXHJcbiAgdW5pdDogU3RhbmRhcmRVbml0ID0gU3RhbmRhcmRVbml0LkNvdW50LFxyXG4gIG5hbWVzcGFjZTogc3RyaW5nID0gJ1RvZG9BUEknXHJcbik6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBjbG91ZFdhdGNoLnNlbmQoXHJcbiAgICAgIG5ldyBQdXRNZXRyaWNEYXRhQ29tbWFuZCh7XHJcbiAgICAgICAgTmFtZXNwYWNlOiBuYW1lc3BhY2UsXHJcbiAgICAgICAgTWV0cmljRGF0YTogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBNZXRyaWNOYW1lOiBtZXRyaWNOYW1lLFxyXG4gICAgICAgICAgICBWYWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIFVuaXQ6IHVuaXQsIFxyXG4gICAgICAgICAgICBUaW1lc3RhbXA6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwdWJsaXNoaW5nIG1ldHJpYzonLCBlcnJvcik7XHJcbiAgfVxyXG59OyJdfQ==