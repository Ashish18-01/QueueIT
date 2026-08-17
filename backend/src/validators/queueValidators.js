const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../errors');
const { QUEUE_STATUSES, QUEUE_VISIBILITIES, TOKEN_STRATEGIES, QUEUE_CATEGORIES } = require('../constants/queueConstants');
const validate = (req, _res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return next(new ValidationError('Validation failed', errors.array())); next(); };
const fieldChains = (required = true) => {
  const opt = (chain) => (required ? chain : chain.optional({ values: 'undefined' }));
  return [
    opt(body('name')).trim().isLength({ min: 2, max: 120 }),
    opt(body('description')).trim().isLength({ max: 1000 }),
    body('organizationId').optional().isMongoId(), body('branchId').optional().isMongoId(), body('venueId').optional().isMongoId(),
    body('counterId').optional().isMongoId(), body('queueTemplateId').optional().isMongoId(),
    body('category').optional().isIn(QUEUE_CATEGORIES), body('tokenPrefix').optional().trim().isLength({ min: 1, max: 8 }),
    body('tokenStrategy').optional().isIn(TOKEN_STRATEGIES),
    body('averageServiceTimeMinutes').optional().isInt({ min: 1, max: 1440 }), body('maximumCapacity').optional().isInt({ min: 1, max: 100000 }),
    body('dailyCapacity').optional().isInt({ min: 1, max: 1000000 }),
    body('operatingHours').optional().isArray(), body('operatingHours.*.dayOfWeek').optional().isInt({ min: 0, max: 6 }),
    body('visibility').optional().isIn(QUEUE_VISIBILITIES), body('status').optional().isIn(QUEUE_STATUSES), body('priorityEnabled').optional().isBoolean(), body('isActive').optional().isBoolean(),
  ];
};
exports.createQueue = [...fieldChains(true), validate];
exports.updateQueue = [...fieldChains(false), validate];
exports.queueId = [param('queueId').isMongoId(), validate];
exports.listQueues = [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('status').optional().isIn(QUEUE_STATUSES), query('visibility').optional().isIn(QUEUE_VISIBILITIES), query('sortOrder').optional().isIn(['asc', 'desc']), validate];

exports.joinQueue = [param('queueId').isMongoId(), body('customerId').optional().isMongoId(), body('organizationId').optional().isMongoId(), body('branchId').optional().isMongoId(), body('venueId').optional().isMongoId(), body('metadata').optional().isObject(), validate];
