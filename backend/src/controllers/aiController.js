const assistant = require('../ai/assistantService');
const rag = require('../ai/ragService');
const telemetry = require('../ai/telemetry');
const { success } = require('../utils/response');

exports.ask = async (req, res) => success(res, await assistant.ask(req.body, req.user), 'Grounded queue assistant response');
exports.insights = async (req, res) => success(res, await assistant.insights(req.user), 'AI operational insights');
exports.ingest = async (req, res) => success(res, await rag.ingest(req.body, req.user), 'Knowledge document ingested', 201);
exports.listDocuments = async (req, res) => success(res, await rag.listDocuments(req.user), 'Knowledge documents');
exports.removeDocument = async (req, res) => success(res, await rag.remove(req.params.documentId, req.user), 'Knowledge document deleted');
exports.metrics = (_req, res) => success(res, telemetry.summary(), 'AI telemetry');
