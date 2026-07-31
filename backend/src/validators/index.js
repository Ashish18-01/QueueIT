const { validationResult, body, param, query } = require('express-validator');
const { ValidationError } = require('../errors');

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return next(new ValidationError('Validation failed', result.array().map(({ msg, path, location, value }) => ({ message: msg, field: path, location, value }))));
};
const isMongoId = (field, location = param) => location(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId`);
const optionalEmail = (field) => body(field).optional().isEmail().normalizeEmail();
const limits = { shortTextMax: 120, longTextMax: 2000, pageMaxLimit: 100 };
module.exports = { validate, isMongoId, optionalEmail, limits, body, param, query };
