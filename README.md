# Todo API Serverless - AWS CDK Project

Este proyecto implementa una API REST serverless para gestión de tareas (TODOs) utilizando AWS CDK, Lambda Functions, DynamoDB y CloudWatch.

## Arquitectura

- **AWS Lambda**: Funciones serverless para manejar las operaciones CRUD
- **Amazon DynamoDB**: Base de datos NoSQL para almacenar las tareas
- **API Gateway**: Endpoint REST para exponer la API
- **CloudWatch**: Métricas personalizadas y logging
- **AWS CDK**: Infrastructure as Code en TypeScript

## Estructura del Proyecto

```
todo-api-serverless/
├── src/
│   └── lambda/
│       ├── handlers/              # Funciones Lambda
│       │   ├── create-todo.ts
│       │   ├── get-todo.ts
│       │   ├── list-todos.ts
│       │   ├── update-todo.ts
│       │   └── delete-todo.ts
│       ├── utils/                 # Utilidades compartidas
│       │   ├── dynamodb.ts
│       │   ├── response.ts
│       │   ├── logger.ts
│       │   ├── cloudwatch.ts
│       │   └── __mocks__/         # Mocks para testing
│       └── types/                 # Tipos TypeScript
│           └── todo.ts
├── lib/                           # Stack de CDK
│   └── todo-api-serverless-stack.ts
├── tests/                         # Pruebas
│   ├── unit/                      # Pruebas unitarias
│   ├── integration/               # Pruebas de integración
│   └── setup.ts                   # Configuración de tests
├── docs/                          # Documentación
│   ├── EVIDENCE_CLOUDWATCH_METRICS.md
│   └── images/                    # Capturas de pantalla
├── scripts/                       # Scripts de utilidad
│   └── generate-metrics-evidence.js
├── postman/                       # Colección Postman
│   ├── Todo-API.postman_collection.json
│   └── Todo-API.postman_environment.json
├── bin/                           # Punto de entrada CDK
├── cdk.out/                       # Archivos generados por CDK
├── node_modules/                  # Dependencias
├── package.json                   # Configuración del proyecto
├── tsconfig.json                  # Configuración TypeScript
├── jest.config.js                 # Configuración de Jest
├── cdk.json                       # Configuración de CDK
└── README.md                      # Documentación principal
```


## Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm 8+
- AWS CLI configurado
- AWS CDK CLI instalado globalmente


npm install -g aws-cdk


### Instalación

1. **Clonar el repositorio**

git clone https://github.com/Ale3565/Todo-api-serverless.git

cd todo-api-serverless


2. **Instalar dependencias**

npm install


3. **Compilar TypeScript**

npm run build


4. **Configurar AWS CDK (primera vez)**

npx cdk bootstrap


## Comandos Disponibles

### Desarrollo
- `npm run build` - Compilar TypeScript a JavaScript
- `npm run watch` - Compilar en modo watch
- `npm run test` - Ejecutar todas las pruebas
- `npm run test:watch` - Ejecutar pruebas en modo watch
- `npm run test:coverage` - Ejecutar pruebas con cobertura
- `npm run lint` - Ejecutar linter
- `npm run lint:fix` - Ejecutar linter y corregir automáticamente

### CDK
- `npx cdk synth` - Generar template de CloudFormation
- `npx cdk diff` - Comparar stack actual con cambios
- `npx cdk deploy` - Desplegar stack a AWS
- `npx cdk destroy` - Eliminar stack de AWS

## Despliegue

### 1. Desplegar la infraestructura


# Compilar el código
npm run build

# Desplegar el stack
npx cdk deploy


### 2. Obtener la URL del API

Después del despliegue, CDK mostrará la URL del API Gateway:


TodoApiServerlessStack.TodoApiEndpoint = https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod


### 3. Verificar el despliegue


# Probar el endpoint de health check
curl https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod/todos

# Debería retornar una lista vacía inicialmente


## Pruebas

### Ejecutar Suite de Pruebas


# Todas las pruebas
npm test

# Solo pruebas unitarias
npm test -- --testPathPattern="unit/"

# Solo pruebas de integración
npm test -- --testPathPattern="integration/"

# Con cobertura
npm run test:coverage


### Tipos de Pruebas

1. **Pruebas Unitarias**: Prueban cada handler individualmente con mocks
2. **Pruebas de Integración**: Prueban la funcionalidad completa del stack
3. **Pruebas de CDK**: Verifican la configuración de infraestructura

### Resultados Esperados


Test Suites: 7 passed, 7 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        ~4-5 segundos


## API Endpoints

### Base URL

https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod


### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/todos` | Listar todas las tareas |
| GET | `/todos/{id}` | Obtener una tarea específica |
| POST | `/todos` | Crear nueva tarea |
| PUT | `/todos/{id}` | Actualizar tarea existente |
| DELETE | `/todos/{id}` | Eliminar tarea |

### Ejemplos de Uso

#### Crear Tarea

curl -X POST https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completar proyecto",
    "description": "Finalizar la implementación de la API"
  }'


#### Listar Tareas

curl https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod/todos


#### Actualizar Tarea

curl -X PUT https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod/todos/{todo-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto completado",
    "completed": true
  }'


## Métricas y Monitoreo

### Métricas Personalizadas en CloudWatch

El proyecto registra las siguientes métricas personalizadas:

- `TodoCreatedCount`: Número de tareas creadas
- `TodoRetrievedCount`: Número de tareas consultadas
- `TodoUpdatedCount`: Número de tareas actualizadas
- `TodoDeletedCount`: Número de tareas eliminadas
- `TodosListedCount`: Número de veces que se listaron tareas

### Acceder a las Métricas

1. Ir a AWS CloudWatch Console
2. Navegar a **Metrics** → **Custom Namespaces**
3. Buscar el namespace `TodoAPI`
4. Ver las métricas disponibles

### Logs

Los logs están disponibles en CloudWatch Logs:
- Grupo de logs: `/aws/lambda/TodoApiServerlessStack-*`
- Logs estructurados en formato JSON con timestamp, nivel y contexto

### Generación de Evidencia de Métricas

El proyecto incluye un script automatizado para generar actividad en la API y evidencia de métricas:


node scripts/generate-metrics-evidence.js


node scripts/generate-metrics-evidence.js --activity-only


node scripts/generate-metrics-evidence.js --metrics-only


node scripts/generate-metrics-evidence.js --help


**Características del generador:**
- Crea 5 TODOs de prueba automáticamente
- Realiza operaciones CRUD completas (GET, POST, PUT, DELETE)
- Genera errores intencionales para testing (404, 400)
- Espera 2 minutos para propagación de métricas
- Consulta automáticamente las métricas de CloudWatch
- Genera evidencia detallada en `docs/EVIDENCE_CLOUDWATCH_METRICS.md`
- Incluye capturas de pantalla en `docs/images/`

**Variables de entorno requeridas:**
- `API_BASE_URL`: URL de tu API Gateway (opcional si coincide con la configurada)
- `AWS_REGION`: Región de AWS (por defecto: us-east-1)

## Documentación y Evidencia

### Documentación Técnica

El directorio `docs/` contiene documentación técnica detallada:

- **`EVIDENCE_CLOUDWATCH_METRICS.md`**: Evidencia completa de métricas personalizadas
- **`images/`**: Capturas de pantalla de CloudWatch y evidencia visual
  - Gráficos de métricas individuales
  - Vista general del namespace TodoAPI
  - Salidas del terminal y scripts

### Evidencia de Funcionamiento

La documentación incluye evidencia real de:
- Métricas custom funcionando en CloudWatch
- Actividad generada por el script automatizado  
- Estadísticas de Sum, Average, y Maximum
- Timestamps y períodos de medición
- Enlaces directos a la consola de AWS

## Postman Collection

Se incluye una colección completa de Postman que contiene:

**Archivos incluidos:**
- `Todo-API.postman_collection.json`: Colección completa con todos los endpoints
- `Todo-API.postman_environment.json`: Variables de entorno configurables

**Características:**
- Ejemplos de todos los endpoints CRUD
- Variables de entorno reutilizables
- Tests automatizados para validación
- Casos de prueba positivos y negativos
- Documentación integrada en cada request

### Importar en Postman

1. Abrir Postman
2. Click en **Import**
3. Seleccionar ambos archivos del directorio `postman/`
4. Configurar la variable `base_url` en el environment con tu URL de API Gateway

## Desarrollo Local

### Estructura de Respuestas

Todas las respuestas siguen el formato estándar:


{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}


### Manejo de Errores


{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descripción del error"
}


### Códigos de Error Comunes

- `MISSING_ID`: ID de tarea requerido
- `MISSING_BODY`: Cuerpo de solicitud requerido
- `INVALID_JSON`: JSON inválido en el cuerpo
- `INVALID_TITLE`: Título inválido o vacío
- `TODO_NOT_FOUND`: Tarea no encontrada
- `DB_ERROR`: Error de base de datos

## Seguridad

- Validación de entrada en todos los endpoints
- Manejo seguro de errores sin exposición de información sensible
- CORS configurado para desarrollo
- Logs estructurados para auditoría

## Escalabilidad

- Funciones Lambda con auto-scaling
- DynamoDB con capacidad bajo demanda
- API Gateway con throttling configurado
- CloudWatch para monitoreo proactivo

## Limpieza

Para eliminar todos los recursos de AWS:


npx cdk destroy


## Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
