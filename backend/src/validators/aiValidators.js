const { body, validate, isMongoId } = require('./index');
const ask = [body('question').isString().trim().isLength({ min: 1, max: 1000 }), validate];
const ingest = [
  body('title').isString().trim().isLength({ min: 2, max: 160 }), body('source').isString().trim().isLength({ min: 1, max: 500 }),
  body('content').isString().trim().isLength({ min: 1, max: 50000 }), body('visibility').optional().isIn(['organization', 'public']),
  body('organizationId').optional().isMongoId(), body('branchId').optional().isMongoId(), body('venueId').optional().isMongoId(), body('queueId').optional().isMongoId(), validate,
];
module.exports = { ask, ingest, documentId: [isMongoId('documentId'), validate] };
