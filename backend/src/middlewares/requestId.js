const { createId } = require('../utils/id');
module.exports = (req, res, next) => { req.id = req.headers['x-request-id'] || createId('req'); res.setHeader('X-Request-Id', req.id); next(); };
