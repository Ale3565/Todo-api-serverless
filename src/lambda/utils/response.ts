import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types/todo';

const createResponse = (
  statusCode: number,
  body: ApiResponse,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: true,
    data,
    message,
  });
};

export const errorResponse = (
  statusCode: number,
  error: string,
  message: string = 'An error occurred'
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    error,
    message,
  });
};