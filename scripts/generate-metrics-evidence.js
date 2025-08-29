
const https = require('https');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');


const API_BASE_URL = process.env.API_BASE_URL || 'https://3vles3hp9f.execute-api.us-east-1.amazonaws.com/prod';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const METRIC_NAMESPACE = 'TodoAPI';


const cloudWatchClient = new CloudWatchClient({ region: AWS_REGION });


function makeHttpRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'TodoAPI-MetricsGenerator/1.0'
            }
        };

        if (data && method !== 'GET') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: responseData ? JSON.parse(responseData) : null,
                    headers: res.headers
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}


async function getCloudWatchMetrics(metricName, startTime, endTime) {
    try {
        const params = {
            Namespace: METRIC_NAMESPACE,
            MetricName: metricName,
            StartTime: startTime,
            EndTime: endTime,
            Period: 300, 
            Statistics: ['Sum', 'Average', 'Maximum']
        };

        const command = new GetMetricStatisticsCommand(params);
        const response = await cloudWatchClient.send(command);
        return response;
    } catch (error) {
        console.error(`Error obteniendo métrica ${metricName}:`, error.message);
        return null;
    }
}


async function generateApiActivity() {
    console.log('Iniciando generación de actividad en la API...');
    console.log('URL configurada:', API_BASE_URL);
    
    

    const activities = [];
    let createdTodoIds = [];

    try {
       
        console.log('Listando TODOs iniciales...');
        const listResponse1 = await makeHttpRequest(`${API_BASE_URL}/todos`);
        activities.push({ action: 'LIST_INITIAL', status: listResponse1.statusCode });

        
        console.log('Creando TODOs...');
        for (let i = 1; i <= 5; i++) {
            const todoData = {
                title: `Tarea de prueba ${i}`,
                description: `Descripción de la tarea ${i} para generar métricas en CloudWatch`
            };
            
            const createResponse = await makeHttpRequest(`${API_BASE_URL}/todos`, 'POST', todoData);
            activities.push({ action: `CREATE_TODO_${i}`, status: createResponse.statusCode });
            
            if (createResponse.statusCode === 201 && createResponse.data?.data?.todoId) {
                createdTodoIds.push(createResponse.data.data.todoId);
                console.log(`TODO ${i} creado: ${createResponse.data.data.todoId}`);
            }
            
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    
        console.log('Obteniendo TODOs individuales...');
        for (let i = 0; i < Math.min(3, createdTodoIds.length); i++) {
            const getResponse = await makeHttpRequest(`${API_BASE_URL}/todos/${createdTodoIds[i]}`);
            activities.push({ action: `GET_TODO_${i+1}`, status: getResponse.statusCode });
            console.log(`TODO obtenido: ${createdTodoIds[i]} (${getResponse.statusCode})`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }

  
        console.log('Actualizando TODOs...');
        for (let i = 0; i < Math.min(2, createdTodoIds.length); i++) {
            const updateData = {
                title: `Tarea actualizada ${i + 1}`,
                completed: true
            };
            
            const updateResponse = await makeHttpRequest(`${API_BASE_URL}/todos/${createdTodoIds[i]}`, 'PUT', updateData);
            activities.push({ action: `UPDATE_TODO_${i+1}`, status: updateResponse.statusCode });
            console.log(`TODO actualizado: ${createdTodoIds[i]} (${updateResponse.statusCode})`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log('Listando TODOs actualizados...');
        const listResponse2 = await makeHttpRequest(`${API_BASE_URL}/todos`);
        activities.push({ action: 'LIST_UPDATED', status: listResponse2.statusCode });

       
        console.log('Eliminando TODOs...');
        for (let i = 0; i < Math.min(2, createdTodoIds.length); i++) {
            const deleteResponse = await makeHttpRequest(`${API_BASE_URL}/todos/${createdTodoIds[i]}`, 'DELETE');
            activities.push({ action: `DELETE_TODO_${i+1}`, status: deleteResponse.statusCode });
            console.log(`TODO eliminado: ${createdTodoIds[i]} (${deleteResponse.statusCode})`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }

       
        console.log('Generando algunos errores intencionales...');
        
   
        const errorResponse1 = await makeHttpRequest(`${API_BASE_URL}/todos/non-existent-id`);
        activities.push({ action: 'ERROR_GET_404', status: errorResponse1.statusCode });
        
      
        const errorResponse2 = await makeHttpRequest(`${API_BASE_URL}/todos`, 'POST', { title: '' });
        activities.push({ action: 'ERROR_CREATE_400', status: errorResponse2.statusCode });

        console.log('\nActividad generada exitosamente!');
        console.log('\nResumen de actividades:');
        activities.forEach(activity => {
            const status = activity.status >= 200 && activity.status < 300 ? '[SUCCESS]' : 
                          activity.status >= 400 && activity.status < 500 ? '[WARNING]' : '[FAILED]';
            console.log(`  ${status} ${activity.action}: ${activity.status}`);
        });

        return activities;

    } catch (error) {
        console.error('Error generando actividad:', error.message);
        throw error;
    }
}


async function showCloudWatchMetrics() {
    console.log('\nConsultando métricas de CloudWatch...');
    console.log('Esperando 2 minutos para que las métricas se propaguen...');
    
    
    await new Promise(resolve => setTimeout(resolve, 120000)); 

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (30 * 60 * 1000)); 

    const metrics = [
        'TodoCreatedCount',
        'TodoRetrievedCount',
        'TodoUpdatedCount',
        'TodoDeletedCount',
        'TodosListedCount'
    ];

    console.log(`\nMétricas de CloudWatch (${startTime.toISOString()} - ${endTime.toISOString()}):`);
    console.log('=' .repeat(80));

    for (const metricName of metrics) {
        console.log(`\n${metricName}:`);
        const metricData = await getCloudWatchMetrics(metricName, startTime, endTime);
        
        if (metricData && metricData.Datapoints.length > 0) {
            metricData.Datapoints.forEach(point => {
                console.log(`${point.Timestamp.toISOString()}`);
                console.log(`Sum: ${point.Sum || 0}`);
                console.log(`Average: ${point.Average || 0}`);
                console.log(`Maximum: ${point.Maximum || 0}`);
            });
        } else {
            console.log('No hay datos disponibles para esta métrica');
            console.log('Tip: Puede tomar hasta 5-15 minutos para que aparezcan las métricas');
        }
    }

    console.log('\n' + '=' .repeat(80));
    console.log('Para ver las métricas en la consola de AWS:');
    console.log(`https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}#metricsV2:graph=~();query=TodoAPI`);
}


async function main() {
    console.log('Generador de Evidencia de Métricas - Todo API');
    console.log('=' .repeat(60));
    
    try {
        
        await generateApiActivity();
        
       
        await showCloudWatchMetrics();
        
        console.log('\n¡Proceso completado exitosamente!');
        console.log('\nResumen de evidencia generada:');
        console.log('  • Actividad de API registrada');
        console.log('  • Métricas personalizadas enviadas a CloudWatch');
        console.log('  • Datos disponibles para análisis');
        
    } catch (error) {
        console.error('\nError en el proceso:', error.message);
        process.exit(1);
    }
}


if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Generador de Evidencia de Métricas - Todo API

Uso:
  node generate-metrics-evidence.js [opciones]

Variables de entorno requeridas:
  API_BASE_URL    URL base de tu API Gateway (requerido)
  AWS_REGION      Región de AWS (por defecto: us-east-1)

Opciones:
  --help, -h      Mostrar esta ayuda
  --activity-only Solo generar actividad, sin consultar métricas
  --metrics-only  Solo consultar métricas existentes

Ejemplo:
  export API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
  node scripts/generate-metrics-evidence.js
`);
    process.exit(0);
}


if (process.argv.includes('--activity-only')) {
    generateApiActivity()
        .then(() => {
            console.log('\nActividad generada. Ejecuta con --metrics-only en unos minutos para ver las métricas.');
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
} 

else if (process.argv.includes('--metrics-only')) {
    showCloudWatchMetrics()
        .then(() => {
            console.log('\nConsulta de métricas completada.');
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}

else {
    main();
}

