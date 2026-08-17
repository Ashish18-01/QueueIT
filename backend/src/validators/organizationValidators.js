const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../errors');
const validate = (rules) => [...rules, (req, _res, next) => { const result = validationResult(req); return result.isEmpty() ? next() : next(new ValidationError('Validation failed', result.array())); }];
exports.create = validate([body('name').trim().isLength({ min: 2, max: 120 }), body('description').optional().trim().isLength({ max: 1000 })]);
exports.organizationId = validate([param('organizationId').isMongoId()]);
