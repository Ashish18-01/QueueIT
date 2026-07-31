const jwt = require('jsonwebtoken');
const passwordService = require('../src/services/passwordService');
const tokenService = require('../src/services/tokenService');

describe('authentication services', () => {
  test('password strength rejects weak passwords', () => {
    expect(() => passwordService.assertStrong('password')).toThrow('Password is too weak');
  });

  test('hashes and verifies strong passwords with bcrypt', async () => {
    const hash = await passwordService.hashPassword('StrongerPass1!');
    expect(hash).not.toBe('StrongerPass1!');
    await expect(passwordService.verifyPassword('StrongerPass1!', hash)).resolves.toBe(true);
  });

  test('signs access tokens with the user subject and roles', () => {
    const token = tokenService.signAccessToken({ _id: '507f1f77bcf86cd799439011', roleNames: ['admin'] });
    const payload = jwt.decode(token);
    expect(payload.sub).toBe('507f1f77bcf86cd799439011');
    expect(payload.roles).toContain('admin');
  });
});
