const { ValidationError } = require('../errors');
const validateRecommendation = (value) => {
  if (!value || !['queue_recommendation', 'support_answer'].includes(value.intent) || typeof value.answer !== 'string' || value.answer.length > 2000 || !Array.isArray(value.sources)) throw new ValidationError('AI produced an invalid structured response');
  if (value.confidence != null && (!Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1)) throw new ValidationError('AI produced an invalid confidence score');
  return value;
};
module.exports = { validateRecommendation };
