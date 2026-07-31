const { config } = require('../config/env');
const { databaseHealth } = require('../database/connection');
const { success } = require('../utils/response');
const { nowIso } = require('../utils/date');

const health = (_req, res) => success(res, { status: 'ok', timestamp: nowIso(), uptime: process.uptime(), database: databaseHealth() });
const readiness = (_req, res) => { const db = databaseHealth(); const ready = config.isTest || db.status === 'up'; return success(res, { ready, database: db }, ready ? 'Ready' : 'Not ready', ready ? 200 : 503); };
const liveness = (_req, res) => success(res, { alive: true, uptime: process.uptime() });
const version = (_req, res) => success(res, { name: config.app.name, version: config.app.version, nodeEnv: config.nodeEnv, apiVersion: config.app.apiVersion });
const info = (_req, res) => success(res, { name: config.app.name, version: config.app.version, environment: config.nodeEnv, apiPrefix: config.app.apiPrefix, apiVersion: config.app.apiVersion, features: config.features });
module.exports = { health, readiness, liveness, version, info };
