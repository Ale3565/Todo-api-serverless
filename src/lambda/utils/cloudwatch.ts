import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';

const cloudWatch = new CloudWatchClient({
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

export const publishMetric = async (
  metricName: string,
  value: number,
  unit: StandardUnit = StandardUnit.Count,
  namespace: string = 'TodoAPI'
): Promise<void> => {
  try {
    await cloudWatch.send(
      new PutMetricDataCommand({
        Namespace: namespace,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit, 
            Timestamp: new Date(),
          },
        ],
      })
    );
  } catch (error) {
    console.error('Error publishing metric:', error);
    
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
  }
};