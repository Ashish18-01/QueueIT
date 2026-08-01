const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../errors');
const { QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const validate = (req, _res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return next(new ValidationError('Validation failed', errors.array())); next(); };
exports.queueId = [param('queueId').isMongoId(), validate];
exports.entryId = [param('entryId').isMongoId(), validate];
exports.join = [param('queueId').isMongoId(), body('customerId').optional().isMongoId(), body('organizationId').optional().isMongoId(), body('branchId').optional().isMongoId(), body('venueId').optional().isMongoId(), body('metadata').optional().isObject(), validate];
exports.list = [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('queueId').optional().isMongoId(), query('customerId').optional().isMongoId(), query('status').optional().isIn(QUEUE_ENTRY_STATUSES), query('sortOrder').optional().isIn(['asc', 'desc']), validate];
