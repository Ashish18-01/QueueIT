const mongoose = require('mongoose');
const { config } = require('../config/env');
const logger = require('../utils/logger');

let connectionPromise;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const options = { maxPoolSize: config.mongo.maxPoolSize, minPoolSize: config.mongo.minPoolSize, connectTimeoutMS: config.mongo.connectTimeoutMS, socketTimeoutMS: config.mongo.socketTimeoutMS, serverSelectionTimeoutMS: config.mongo.connectTimeoutMS };

const connectDatabase = async () => {
  if (config.isTest && process.env.SKIP_DB_CONNECT === 'true') return mongoose.connection;
  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= config.mongo.retryAttempts; attempt += 1) {
      try { await mongoose.connect(config.mongo.uri, options); logger.info('MongoDB connected'); return mongoose.connection; }
      catch (err) { logger.error('MongoDB connection attempt failed', { attempt, err }); if (attempt === config.mongo.retryAttempts) throw err; await sleep(config.mongo.retryDelayMs); }
    }
  })();
  return connectionPromise;
};
const disconnectDatabase = async () => { await mongoose.connection.close(false); logger.info('MongoDB disconnected'); };
const databaseHealth = () => ({ status: mongoose.connection.readyState === 1 ? 'up' : 'down', readyState: mongoose.connection.readyState, name: mongoose.connection.name || null, host: mongoose.connection.host || null });
mongoose.connection.on('error', (err) => logger.error('MongoDB error', { err }));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
module.exports = { connectDatabase, disconnectDatabase, databaseHealth };
