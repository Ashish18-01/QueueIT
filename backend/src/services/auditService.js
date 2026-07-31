const { AuditLog } = require('../models');
const record = async (action, { actor, target, metadata, req } = {}) => AuditLog.create({ action, actor, target, metadata, ip: req?.ip, userAgent: req?.get?.('user-agent') });
module.exports = { record };
