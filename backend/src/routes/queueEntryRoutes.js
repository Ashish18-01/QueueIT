const express = require('express');
const controller = require('../controllers/queueEntryController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const validators = require('../validators/queueEntryValidators');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

router.use(authenticate);
router.get('/search', requirePermission('queues:read'), validators.list, asyncHandler(controller.search));
router.route('/').get(requirePermission('queues:read'), validators.list, asyncHandler(controller.list));
router.route('/:entryId').get(requirePermission('queues:read'), validators.entryId, asyncHandler(controller.get)).delete(requirePermission('queues:write'), validators.entryId, asyncHandler(controller.remove));
router.post('/:entryId/leave', validators.entryId, asyncHandler(controller.leave));
router.post('/:entryId/cancel', requirePermission('queues:write'), validators.entryId, asyncHandler(controller.cancel));

module.exports = router;
