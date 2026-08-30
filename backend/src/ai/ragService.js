const { KnowledgeDocument, KnowledgeChunk } = require('../models');
const { AuthorizationError, NotFoundError } = require('../errors');
const chunkText = (content, size = 900) => Array.from({ length: Math.ceil(content.length / size) }, (_, i) => content.slice(i * size, (i + 1) * size).trim()).filter(Boolean);
const canManageKnowledge = (user) => (user.roleNames || []).some((r) => ['organization_admin', 'admin', 'owner', 'super_admin'].includes(r));
const scopeFor = (user) => ({ organizationId: user.organizationId });
const score = (text, question) => { const words = new Set(question.toLowerCase().match(/[a-z0-9]{3,}/g) || []); return [...words].reduce((total, word) => total + (text.toLowerCase().split(word).length - 1), 0); };
exports.ingest = async (payload, user) => {
  if (!canManageKnowledge(user)) throw new AuthorizationError('Only organization administrators can manage knowledge');
  const organizationId = ['admin', 'owner', 'super_admin'].some((r) => user.roleNames.includes(r)) ? payload.organizationId : user.organizationId;
  if (!organizationId) throw new AuthorizationError('Organization scope is required');
  const document = await KnowledgeDocument.create({ ...payload, organizationId, createdBy: user._id });
  const chunks = chunkText(payload.content).map((content, index) => ({ organizationId, branchId: payload.branchId, venueId: payload.venueId, queueId: payload.queueId, documentId: document._id, chunkId: `${document._id}:${index}`, source: payload.source, content }));
  if (chunks.length) await KnowledgeChunk.insertMany(chunks);
  return { document, chunkCount: chunks.length };
};
exports.listDocuments = async (user) => KnowledgeDocument.find({ ...scopeFor(user), status: 'ready' }).select('-content').sort('-updatedAt');
exports.retrieve = async (question, user, limit = 4) => {
  if (!user.organizationId) return [];
  const chunks = await KnowledgeChunk.find({ ...scopeFor(user) }).limit(100).lean();
  return chunks.map((chunk) => ({ ...chunk, score: score(chunk.content, question) })).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(({ content, source, documentId, chunkId }) => ({ content, source, documentId: String(documentId), chunkId }));
};
exports.remove = async (id, user) => {
  if (!canManageKnowledge(user)) throw new AuthorizationError('Only organization administrators can manage knowledge');
  const document = await KnowledgeDocument.findOne({ _id: id, ...scopeFor(user) });
  if (!document) throw new NotFoundError('Knowledge document not found');
  document.status = 'deleted'; await document.save(); await KnowledgeChunk.deleteMany({ documentId: document._id }); return document;
};
