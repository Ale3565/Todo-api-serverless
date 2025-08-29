import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { join } from 'path';

export class TodoApiServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const todoTable = new dynamodb.Table(this, 'TodoTable', {
      tableName: 'Todos',
      partitionKey: {
        name: 'todoId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaRole = new iam.Role(this, 'TodoLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Scan',
              ],
              resources: [todoTable.tableArn],
            }),
          ],
        }),
        CloudWatchPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['cloudwatch:PutMetricData'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      role: lambdaRole,
      environment: {
        TABLE_NAME: todoTable.tableName,
      },
      
      code: lambda.Code.fromAsset(join(__dirname, '../src/lambda')), 
    };

    const createTodoFunction = new lambda.Function(this, 'CreateTodoFunction', {
      ...commonLambdaProps,
      functionName: 'todo-create',
      handler: 'handlers/create-todo.handler', 
    });

    const getTodoFunction = new lambda.Function(this, 'GetTodoFunction', {
      ...commonLambdaProps,
      functionName: 'todo-get',
      handler: 'handlers/get-todo.handler',
    });

    const listTodosFunction = new lambda.Function(this, 'ListTodosFunction', {
      ...commonLambdaProps,
      functionName: 'todo-list',
      handler: 'handlers/list-todos.handler',
    });

    const updateTodoFunction = new lambda.Function(this, 'UpdateTodoFunction', {
      ...commonLambdaProps,
      functionName: 'todo-update',
      handler: 'handlers/update-todo.handler',
    });

    const deleteTodoFunction = new lambda.Function(this, 'DeleteTodoFunction', {
      ...commonLambdaProps,
      functionName: 'todo-delete',
      handler: 'handlers/delete-todo.handler',
    });

    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo API',
      description: 'Serverless Todo API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    const todosResource = api.root.addResource('todos');
    todosResource.addMethod('POST', new apigateway.LambdaIntegration(createTodoFunction));
    todosResource.addMethod('GET', new apigateway.LambdaIntegration(listTodosFunction));

    const todoResource = todosResource.addResource('{id}');
    todoResource.addMethod('GET', new apigateway.LambdaIntegration(getTodoFunction));
    todoResource.addMethod('PUT', new apigateway.LambdaIntegration(updateTodoFunction));
    todoResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodoFunction));

    new cdk.CfnOutput(this, 'TodoApiUrl', {
      value: api.url,
      description: 'URL of the Todo API',
    });

    new cdk.CfnOutput(this, 'TodoTableName', {
      value: todoTable.tableName,
      description: 'Name of the Todo table',
    });
  }
}