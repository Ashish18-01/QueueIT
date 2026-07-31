const success = (res, data = null, message = 'OK', statusCode = 200, meta = undefined) => res.status(statusCode).json({ success: true, message, data, meta });
const error = (res, err, requestId) => res.status(err.statusCode || 500).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error', details: err.details, requestId } });
module.exports = { success, error };
