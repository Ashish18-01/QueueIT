const { Server } = require('socket.io');
const { createClient } = require('redis');
const { User } = require('../models');
const { verifyAccessToken } = require('../services/tokenService');
const { AuthenticationError, AuthorizationError } = require('../errors');
const { config } = require('../config/env');
const { corsOptions } = require('../middlewares/security');
const logger = require('../utils/logger');
const { roomsForUser, roomsForResource, canJoinRoom } = require('./rooms');
const presence = require('./presence');
const EVENTS = require('./events');

let io;
const recentEvents = new Map();
const ttl = 60000;
const maxRecentEvents = 1000;
const getToken = (socket) => socket.handshake.auth?.token || (socket.handshake.headers.authorization || '').replace(/^Bearer /i, '');
const eventId = (name, payload) => payload?.eventId || `${name}:${payload?.id || payload?._id || payload?.queueId || ''}:${payload?.updatedAt || Date.now()}`;

const authenticate = async (socket, next) => {
  try {
    const token = getToken(socket);
    if (!token) throw new AuthenticationError('Socket authentication token required');
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') throw new AuthenticationError('Invalid socket user');
    socket.data.user = user;
    socket.data.auth = payload;
    socket.data.counterId = socket.handshake.auth?.counterId;
    next();
  } catch (err) {
    logger.warn('Socket authentication failed', { socketId: socket.id, message: err.message });
    next(new AuthenticationError('Invalid or expired socket token'));
  }
};

const configureRedisAdapter = async (server) => {
  if (!config.redis.enabled) return null;
  try {
    // Optional dependency: installed in production deployments that enable Redis sockets.
    // eslint-disable-next-line global-require
    const { createAdapter } = require('@socket.io/redis-adapter');
    const pubClient = createClient({ url: config.redis.url });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    server.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.IO Redis adapter configured');
    return { pubClient, subClient };
  } catch (err) {
    logger.error('Socket.IO Redis adapter configuration failed', { err: { name: err.name, message: err.message, stack: err.stack } });
    throw err;
  }
};

const setupHandlers = (server) => {
  server.use(authenticate);
  server.on('connection', (socket) => {
    roomsForUser(socket.data.user).forEach((r) => { socket.join(r); logger.info('Socket room joined', { socketId: socket.id, room: r }); });
    presence.connected(socket);
    server.to('admin').emit(EVENTS.PRESENCE_UPDATED, presence.snapshot());
    logger.info('Socket connected', { socketId: socket.id, userId: socket.data.user.id });

    socket.on('room:join', (roomName, ack) => {
      try {
        if (!canJoinRoom(socket.data.user, roomName)) throw new AuthorizationError('Room access denied');
        socket.join(roomName); logger.info('Socket room joined', { socketId: socket.id, room: roomName });
        if (ack) ack({ ok: true, room: roomName });
      } catch (err) { if (ack) ack({ ok: false, error: err.message }); }
    });
    socket.on('room:leave', (roomName, ack) => { socket.leave(roomName); logger.info('Socket room left', { socketId: socket.id, room: roomName }); if (ack) ack({ ok: true, room: roomName }); });
    socket.on('counter:active', (payload = {}, ack) => { socket.data.counterId = payload.counterId; presence.connected(socket); if (ack) ack({ ok: true }); server.to('admin').emit(EVENTS.PRESENCE_UPDATED, presence.snapshot()); });
    socket.on('disconnect', (reason) => { presence.disconnected(socket); logger.info('Socket disconnected', { socketId: socket.id, reason }); server.to('admin').emit(EVENTS.PRESENCE_UPDATED, presence.snapshot()); });
  });
};

const socketCorsOrigin = config.socket.corsOrigin === '*' ? corsOptions.origin : config.socket.corsOrigin.split(',').map((origin) => origin.trim());
const init = async (httpServer) => {
  io = new Server(httpServer, { cors: { origin: socketCorsOrigin, credentials: config.cors.credentials }, pingTimeout: config.socket.pingTimeoutMs, pingInterval: config.socket.pingIntervalMs, connectTimeout: config.socket.connectTimeoutMs });
  await configureRedisAdapter(io);
  setupHandlers(io);
  return io;
};

const broadcast = (name, payload = {}, options = {}) => {
  if (!io) return false;
  const id = eventId(name, payload);
  const now = Date.now();
  for (const [k, expires] of recentEvents) if (expires < now || recentEvents.size > maxRecentEvents) recentEvents.delete(k);
  if (recentEvents.has(id)) return false;
  recentEvents.set(id, now + ttl);
  const rooms = options.rooms || roomsForResource(payload);
  try {
    rooms.forEach((r) => io.to(r).timeout(config.socket.ackTimeoutMs).emit(name, { eventId: id, ...payload }, () => {}));
    logger.info('Socket event broadcast', { event: name, rooms });
    return true;
  } catch (err) { logger.error('Socket broadcast failure', { event: name, err: { name: err.name, message: err.message } }); return false; }
};

module.exports = { init, broadcast, get io() { return io; }, EVENTS, roomsForUser, roomsForResource, canJoinRoom, presence, configureRedisAdapter };
