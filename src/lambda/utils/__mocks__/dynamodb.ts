// Mock implementation for DynamoDB utility
export const dynamoDb = {
  send: jest.fn().mockResolvedValue({})
};

export const TABLE_NAME = process.env.TABLE_NAME || 'TestTodos';
