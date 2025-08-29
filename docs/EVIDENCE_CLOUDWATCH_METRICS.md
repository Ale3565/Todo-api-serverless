# Evidencia de Métricas Custom en CloudWatch - Todo API

## Resumen Ejecutivo
Este documento presenta la evidencia de implementación exitosa de métricas personalizadas (custom metrics) en Amazon CloudWatch para el proyecto Todo API. Las métricas están configuradas bajo el namespace `TodoAPI` y rastrean las principales operaciones CRUD de la aplicación.

## Métricas Custom Implementadas

### Namespace: `TodoAPI`
- **TodoCreatedCount**: Contador de TODOs creados
- **TodoRetrievedCount**: Contador de TODOs obtenidos/consultados  
- **TodoUpdatedCount**: Contador de TODOs actualizados
- **TodoDeletedCount**: Contador de TODOs eliminados
- **TodosListedCount**: Contador de operaciones de listado de TODOs

## Evidencia de Funcionamiento

### Fecha de Prueba: 29 de Agosto de 2025
### Período de Medición: 16:46:03 UTC - 17:16:03 UTC

### Actividades Generadas para Testing:
```
LIST_INITIAL: 200 (Listado inicial)
CREATE_TODO_1: 201 (5 TODOs creados)
CREATE_TODO_2: 201
CREATE_TODO_3: 201  
CREATE_TODO_4: 201
CREATE_TODO_5: 201
GET_TODO_1: 200 (3 TODOs consultados individualmente)
GET_TODO_2: 200
GET_TODO_3: 200
UPDATE_TODO_1: 200 (2 TODOs actualizados)
UPDATE_TODO_2: 200
LIST_UPDATED: 200 (Listado después de actualizaciones)
DELETE_TODO_1: 204 (2 TODOs eliminados)
DELETE_TODO_2: 204
ERROR_GET_404: 404 (Pruebas de error intencionales)
ERROR_CREATE_400: 400
```

### Datos de Métricas Capturados:

#### 1. TodoCreatedCount
- **Timestamp**: 2025-08-29T17:11:00.000Z
- **Sum**: 5 (total de TODOs creados)
- **Average**: 1 (promedio por período)
- **Maximum**: 1 (máximo en un período)

#### 2. TodoRetrievedCount  
- **Timestamp**: 2025-08-29T17:11:00.000Z
- **Sum**: 3 (total de TODOs consultados)
- **Average**: 1 
- **Maximum**: 1

#### 3. TodoUpdatedCount
- **Timestamp**: 2025-08-29T17:11:00.000Z
- **Sum**: 2 (total de TODOs actualizados)
- **Average**: 1
- **Maximum**: 1

#### 4. TodoDeletedCount
- **Timestamp**: 2025-08-29T17:11:00.000Z  
- **Sum**: 2 (total de TODOs eliminados)
- **Average**: 1
- **Maximum**: 1

#### 5. TodosListedCount
- **Timestamp**: 2025-08-29T17:11:00.000Z
- **Sum**: 2 (total de operaciones de listado)
- **Average**: 1
- **Maximum**: 1

## Configuración Técnica

### Herramientas Utilizadas:
- **AWS CloudWatch**: Para almacenamiento y consulta de métricas
- **AWS SDK v3**: Cliente de CloudWatch para Node.js
- **Script de Generación**: `generate-metrics-evidence.js`

### Configuración de Métricas:
- **Región AWS**: us-east-1
- **Namespace**: TodoAPI
- **Período de Agregación**: 300 segundos (5 minutos)
- **Estadísticas Capturadas**: Sum, Average, Maximum

### API Endpoint:
- **URL**: `https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod`
- **Método**: API Gateway + Lambda Functions

## Acceso a CloudWatch Console

Las métricas están disponibles en la consola de AWS CloudWatch en:
```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#metricsV2:graph=~();query=TodoAPI
```

## Validación de Funcionalidad

### Criterios Cumplidos:
1. **Métricas Custom Creadas**: 5 métricas diferentes implementadas
2. **Namespace Personalizado**: `TodoAPI` configurado correctamente
3. **Datos Reales Capturados**: Evidencia de métricas con valores reales
4. **Múltiples Estadísticas**: Sum, Average, Maximum disponibles
5. **Persistencia en CloudWatch**: Datos consultables desde la consola AWS
6. **Automatización**: Script funcional para generar y consultar métricas


