const logger = require('../utils/logger');
const { error } = require('../utils/response');
const { AppError, NotFoundError } = require('../errors');

const notFoundHandler = (req, res, next) => next(new NotFoundError(`Route ${req.originalUrl} not found`));
const safeErrorMeta = (err) => ({ name: err.name, message: err.message, statusCode: err.statusCode, code: err.code, stack: err.stack });
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const normalized = err instanceof AppError ? err : new AppError('Internal server error');
  logger.error('Request failed', { requestId: req.id, path: req.originalUrl, method: req.method, err: safeErrorMeta(err) });
  return error(res, normalized, req.id);
};
module.exports = { notFoundHandler, errorHandler };
