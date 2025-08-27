interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: any;
}

export const createLog = (
  level: string,
  message: string,
  metadata: Record<string, any> = {}
): void => {
  const logEntry: LogEntry = {
    level: level.toUpperCase(),
    message,
    timestamp: new Date().toISOString(),
    requestId: process.env.AWS_REQUEST_ID || 'local',
    ...metadata,
  };

  console.log(JSON.stringify(logEntry));
};

export const logInfo = (message: string, metadata?: Record<string, any>) =>
  createLog('INFO', message, metadata);

export const logError = (message: string, metadata?: Record<string, any>) =>
  createLog('ERROR', message, metadata);

export const logWarn = (message: string, metadata?: Record<string, any>) =>
  createLog('WARN', message, metadata);

export const logDebug = (message: string, metadata?: Record<string, any>) =>
  createLog('DEBUG', message, metadata);