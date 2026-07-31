const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { config, validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./database/connection');
const logger = require('./utils/logger');

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
  const io = new Server(server, { cors: { origin: config.socket.corsOrigin } });
  app.set('io', io);
  server.listen(config.app.port, config.app.host, () => logger.info('Server started', { port: config.app.port, env: config.nodeEnv }));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => { logger.error('Unhandled rejection', { reason }); shutdown('unhandledRejection'); });
process.on('uncaughtException', (err) => { logger.error('Uncaught exception', { err }); shutdown('uncaughtException'); });
start().catch((err) => { logger.error('Startup failed', { err }); process.exit(1); });
