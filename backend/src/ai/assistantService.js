const { config } = require('../config/env');
const { assertSafeQuestion } = require('./guardrails');
const { validateRecommendation } = require('./schemas');
const rag = require('./ragService');
const telemetry = require('./telemetry');
const prompt = require('./prompts/queueAssistant.v1');
const queueData = require('../services/aiQueueReadService');

const recommend = (queues, question) => queues.map((queue) => {
  const length = queue.statistics?.currentQueueLength || 0;
  const service = queue.averageServiceTimeMinutes || config.ai.defaultServiceMinutes;
  const wait = length * service;
  const capacityRatio = queue.maximumCapacity ? length / queue.maximumCapacity : 1;
  const matchesService = question.toLowerCase().split(/\W+/).some((word) => word.length > 3 && `${queue.name} ${queue.description || ''} ${queue.category || ''}`.toLowerCase().includes(word));
  return { queue, length, wait, capacityRatio, matchesService, rank: wait + capacityRatio * service * 10 - (matchesService ? service * 3 : 0) };
}).filter((item) => item.capacityRatio < 1).sort((a, b) => a.rank - b.rank)[0];
exports.ask = async ({ question }, user) => {
  const started = Date.now(); assertSafeQuestion(question);
  const [queues, sources] = await Promise.all([queueData.listEligibleQueues(user), rag.retrieve(question, user)]);
  const selected = recommend(queues, question);
  const output = selected ? {
    intent: 'queue_recommendation', recommendedQueueId: String(selected.queue._id), estimatedWaitMinutes: selected.wait,
    confidence: selected.matchesService ? 0.8 : 0.65, requiresConfirmation: false,
    answer: `${selected.queue.name} is the best available option: ${selected.length} waiting, estimated deterministic wait ${selected.wait} minutes${selected.matchesService ? ', and it matches your requested service' : ''}.`,
    reason: 'Ranked by current queue length, configured average service time, capacity, and service-name match.',
    sources: [{ type: 'queue', queueId: String(selected.queue._id), name: selected.queue.name }, ...sources.map(({ source, documentId, chunkId }) => ({ type: 'knowledge', source, documentId, chunkId }))],
    estimationMethod: 'deterministic_baseline', promptVersion: prompt.id,
  } : { intent: 'support_answer', recommendedQueueId: null, estimatedWaitMinutes: null, confidence: 0, requiresConfirmation: false, answer: sources.length ? sources.map((s) => s.content).join('\n\n') : "I don't have enough verified information to answer that.", reason: 'No eligible queue recommendation was available.', sources: sources.map(({ source, documentId, chunkId }) => ({ type: 'knowledge', source, documentId, chunkId })), estimationMethod: 'not_available', promptVersion: prompt.id };
  const validated = validateRecommendation(output);
  telemetry.record({ operation: 'assistant.ask', latencyMs: Date.now() - started, providerCalled: false, outcome: 'success', queueTool: true, retrievalResults: sources.length, model: config.ai.provider });
  return validated;
};
exports.insights = async (user) => {
  const queues = await queueData.listEligibleQueues(user); const insights = queues.filter((q) => q.maximumCapacity && (q.statistics?.currentQueueLength || 0) / q.maximumCapacity >= 0.8).map((q) => ({ type: 'observed', metric: 'capacity_ratio', queueId: String(q._id), value: (q.statistics.currentQueueLength / q.maximumCapacity), message: `${q.name} is at or above 80% of configured capacity.`, confidence: 1 }));
  return { insights, generatedBy: 'deterministic_event_safe_baseline' };
};
