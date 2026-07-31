jest.mock('../src/models', () => ({ User: { findById: jest.fn() }, Session: { findOne: jest.fn() } }));
const { User } = require('../src/models');
const { authenticate, requireRoles, requireOwnership } = require('../src/middlewares/auth');
const { signAccessToken } = require('../src/services/tokenService');

describe('authorization middleware', () => {
  test('injects authenticated user from bearer token', (done) => {
    const user = { _id: '507f1f77bcf86cd799439011', status: 'active', roleNames: ['user'] };
    User.findById.mockResolvedValue(user);
    const req = { get: () => `Bearer ${signAccessToken(user)}`, cookies: {} };
    authenticate(req, {}, (err) => {
      expect(err).toBeUndefined();
      expect(req.user).toBe(user);
      done();
    });
  });

  test('role middleware forbids missing roles', (done) => {
    requireRoles('admin')({ user: { roleNames: ['user'] } }, {}, (err) => {
      expect(err.statusCode).toBe(403);
      done();
    });
  });

  test('ownership middleware allows owner', (done) => {
    const req = { user: { _id: 'u1' } };
    requireOwnership(() => 'u1')(req, {}, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });
});
