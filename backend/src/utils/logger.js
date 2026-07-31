const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const { config } = require('../config/env');

const formats = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const transports = [new winston.transports.Console({ format: config.isProduction ? formats : winston.format.combine(winston.format.colorize(), winston.format.simple()) })];
if (config.logging.toFile && !config.isTest) {
  transports.push(new winston.transports.DailyRotateFile({ filename: path.join(config.logging.dir, 'application-%DATE%.log'), datePattern: 'YYYY-MM-DD', maxFiles: '14d' }));
  transports.push(new winston.transports.DailyRotateFile({ filename: path.join(config.logging.dir, 'error-%DATE%.log'), level: 'error', datePattern: 'YYYY-MM-DD', maxFiles: '30d' }));
}

module.exports = winston.createLogger({ level: config.logging.level, format: formats, defaultMeta: { service: 'queueit-backend' }, transports, exitOnError: false });
