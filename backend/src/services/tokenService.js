const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

const jwtSecret = () => config.jwt.secret || 'test-jwt-secret';
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex');
const randomToken = () => crypto.randomBytes(48).toString('base64url');
const signAccessToken = (user) => jwt.sign({ sub: String(user._id), roles: user.roleNames || [] }, jwtSecret(), { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' });
const verifyAccessToken = (token) => jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] });
const msFrom = (value, fallbackMs) => {
  const m = String(value || '').match(/^(\d+)([smhd])$/); if (!m) return fallbackMs;
  const n = Number(m[1]); return n * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]]);
};
const refreshExpiresAt = () => new Date(Date.now() + msFrom(config.refreshToken.expiresIn, 7 * 86400000));
module.exports = { hash, randomToken, signAccessToken, verifyAccessToken, refreshExpiresAt };
