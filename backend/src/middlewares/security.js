const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { config } = require('../config/env');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
});

const corsOptions = {
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(',').map((origin) => origin.trim()),
  credentials: config.cors.credentials,
  optionsSuccessStatus: 204,
};

const helmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' },
};

module.exports = { apiLimiter, corsOptions, helmetOptions, sanitizeRequest: mongoSanitize(), preventParameterPollution: hpp() };
