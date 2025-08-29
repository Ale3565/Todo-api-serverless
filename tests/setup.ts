// Configurar variables de entorno para pruebas ANTES de importar cualquier módulo
process.env.NODE_ENV = 'test';
process.env.TABLE_NAME = 'TestTodos';
process.env.AWS_REGION = 'local';
process.env.AWS_REQUEST_ID = 'test-request-id';

// Importar y configurar los mocks ANTES de que cualquier otro módulo importe AWS SDK
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

// Crear y configurar los mocks globalmente
export const ddbMock = mockClient(DynamoDBDocumentClient);
export const cloudWatchMock = mockClient(CloudWatchClient);

// Configurar comportamiento por defecto para evitar errores
ddbMock.resolves({});
cloudWatchMock.resolves({});

// Configurar los mocks antes de cada prueba
beforeEach(() => {
  // Resetear los mocks manteniendo la configuración base
  ddbMock.reset();
  cloudWatchMock.reset();
  
  // Restaurar comportamiento por defecto
  cloudWatchMock.resolves({});
});