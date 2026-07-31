const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const rbacRoutes = require('./rbacRoutes');
const router = express.Router();
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/rbac', rbacRoutes);
module.exports = router;
