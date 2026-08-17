jest.mock('../src/models', () => ({
  User: { findOne: jest.fn() },
  Session: { updateMany: jest.fn() },
  AuthToken: { create: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('../src/services/auditService', () => ({ record: jest.fn() }));

const { User, AuthToken } = require('../src/models');
const emailService = require('../src/services/emailService');
const authService = require('../src/services/authService');

describe('password reset service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('forgotPassword sends a reset email for existing users without returning the token', async () => {
    const user = { _id: '507f1f77bcf86cd799439011', email: 'user@example.com', name: 'Test User' };
    User.findOne.mockResolvedValue(user);
    AuthToken.create.mockResolvedValue({});

    await expect(authService.forgotPassword('USER@example.com')).resolves.toEqual({ sent: true });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(AuthToken.create).toHaveBeenCalledWith(expect.objectContaining({ user: user._id, type: 'password_reset' }));
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(user, expect.any(String));
  });

  test('forgotPassword keeps anti-enumeration response for unknown users and does not send email', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(authService.forgotPassword('missing@example.com')).resolves.toEqual({ sent: true });

    expect(AuthToken.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
