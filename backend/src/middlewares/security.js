const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { config } = require('../config/env');

const apiLimiter = rateLimit({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max, standardHeaders: true, legacyHeaders: false });
module.exports = { apiLimiter, sanitizeRequest: mongoSanitize(), preventParameterPollution: hpp() };
