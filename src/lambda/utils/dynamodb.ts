
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';


const createDynamoDbClient = () => {
  const client = new DynamoDBClient({
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

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: true
    },
    unmarshallOptions: {
      wrapNumbers: false
    }
  });
};


export const dynamoDb = createDynamoDbClient();

export const TABLE_NAME = process.env.TABLE_NAME || 'Todos';