const logger = require('../utils/logger');
const records = [];
const MAX_RECORDS = 200;
const record = (event) => { const safe = { at: new Date().toISOString(), ...event }; records.unshift(safe); if (records.length > MAX_RECORDS) records.pop(); logger.info('AI telemetry', safe); };
const summary = () => ({ requests: records.length, failures: records.filter((r) => r.outcome === 'failure').length, providerCalls: records.filter((r) => r.providerCalled).length, recent: records.slice(0, 20) });
module.exports = { record, summary };
