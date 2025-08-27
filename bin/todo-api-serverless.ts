
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TodoApiServerlessStack } from '../lib/todo-api-serverless-stack';

const app = new cdk.App();
new TodoApiServerlessStack(app, 'TodoApiServerlessStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});