const crypto = require('crypto');
const createId = (prefix = 'id') => `${prefix}_${crypto.randomUUID()}`;
module.exports = { createId };
