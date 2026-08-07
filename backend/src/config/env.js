const dotenv = require('dotenv');

dotenv.config();

const bool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};
const num = (value, fallback) => (Number.isNaN(Number(value)) ? fallback : Number(value));

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  app: {
    name: process.env.APP_NAME || 'QueueIt API',
    version: process.env.APP_VERSION || '0.1.0',
    port: num(process.env.PORT, 5000),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: bool(process.env.TRUST_PROXY),
    apiPrefix: process.env.API_PREFIX || '/api',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queueit',
    connectTimeoutMS: num(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10000),
    socketTimeoutMS: num(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000),
    maxPoolSize: num(process.env.MONGODB_MAX_POOL_SIZE, 10),
    minPoolSize: num(process.env.MONGODB_MIN_POOL_SIZE, 0),
    retryAttempts: num(process.env.MONGODB_RETRY_ATTEMPTS, 5),
    retryDelayMs: num(process.env.MONGODB_RETRY_DELAY_MS, 2000),
  },
  redis: { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379', enabled: bool(process.env.REDIS_ENABLED) },
  jwt: { secret: process.env.JWT_SECRET || '', expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  refreshToken: { secret: process.env.REFRESH_TOKEN_SECRET || '', expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' },
  cors: { origin: process.env.CORS_ORIGIN || '*', credentials: bool(process.env.CORS_CREDENTIALS, true) },
  socket: { corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*', pingTimeoutMs: num(process.env.SOCKET_PING_TIMEOUT_MS, 20000), pingIntervalMs: num(process.env.SOCKET_PING_INTERVAL_MS, 25000), connectTimeoutMs: num(process.env.SOCKET_CONNECT_TIMEOUT_MS, 45000), ackTimeoutMs: num(process.env.SOCKET_ACK_TIMEOUT_MS, 5000) },
  logging: { level: process.env.LOG_LEVEL || 'info', toFile: bool(process.env.LOG_TO_FILE, true), dir: process.env.LOG_DIR || 'logs' },
  rateLimit: { windowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 900000), max: num(process.env.RATE_LIMIT_MAX, 100) },
  features: { registrationEnabled: bool(process.env.FEATURE_REGISTRATION_ENABLED, true), queueEnabled: bool(process.env.FEATURE_QUEUE_ENABLED) },
};

const validateEnv = () => {
  const missing = [];
  if (config.isProduction) {
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!process.env.REFRESH_TOKEN_SECRET) missing.push('REFRESH_TOKEN_SECRET');
    if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
    if (config.cors.credentials && config.cors.origin === '*') missing.push('CORS_ORIGIN');
  }
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
};

module.exports = { config, validateEnv };
