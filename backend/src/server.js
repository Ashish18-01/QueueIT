const http = require('http');
const app = require('./app');
const { config, validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./database/connection');
const logger = require('./utils/logger');
const socket = require('./socket');

let server;
const shutdown = async (signal) => {
  logger.info('Shutdown signal received', { signal });
  if (server) server.close(async () => { await disconnectDatabase(); logger.info('Shutdown complete'); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
};
const start = async () => {
  validateEnv();
  await connectDatabase();
  server = http.createServer(app);
  const io = await socket.init(server);
  app.set('io', io);
  server.listen(config.app.port, config.app.host, () => logger.info('Server started', { port: config.app.port, env: config.nodeEnv }));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => { logger.error('Unhandled rejection', { reason }); shutdown('unhandledRejection'); });
process.on('uncaughtException', (err) => { logger.error('Uncaught exception', { err }); shutdown('uncaughtException'); });
start().catch((err) => { logger.error('Startup failed', { err }); process.exit(1); });
