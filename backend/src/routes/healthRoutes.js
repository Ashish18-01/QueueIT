const express = require('express');
const controller = require('../controllers/healthController');
const router = express.Router();
router.get('/health', controller.health);
router.get('/ready', controller.readiness);
router.get('/live', controller.liveness);
router.get('/version', controller.version);
router.get('/info', controller.info);
module.exports = router;
