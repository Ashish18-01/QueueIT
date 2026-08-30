const { ValidationError } = require('../errors');
const injection = /ignore (previous|all) instructions|system prompt|jailbreak|(?:show|reveal|print).{0,40}(secret|token|password|credential)|execute (?:shell|command)|mongodb|database query/i;
const sensitive = /(jwt|refresh.?token|password|api.?key|secret|mongodb:\/\/)/i;
const assertSafeQuestion = (question) => {
  if (typeof question !== 'string' || !question.trim() || question.length > 1000) throw new ValidationError('Question must be between 1 and 1000 characters');
  if (injection.test(question)) throw new ValidationError('The request cannot be processed safely');
};
const redact = (value) => sensitive.test(String(value || '')) ? '[REDACTED]' : value;
module.exports = { assertSafeQuestion, redact };
