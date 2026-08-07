const request = require('supertest');
const { signAccessToken } = require('../src/services/tokenService');

jest.mock('../src/services/authService', () => ({
  register: jest.fn(),
  login: jest.fn(),
  rotateRefreshToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../src/models', () => ({
  User: { findById: jest.fn() },
  Session: { find: jest.fn() },
}));

const authService = require('../src/services/authService');
const { User } = require('../src/models');
const app = require('../src/app');

const activeUser = { _id: '507f1f77bcf86cd799439011', status: 'active', roleNames: ['user'] };

describe('authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue(activeUser);
  });

  test('register validates request body before calling the service', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', name: '', password: 'short' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(expect.any(Array));
    expect(authService.register).not.toHaveBeenCalled();
  });

  test('register returns created user response shape', async () => {
    authService.register.mockResolvedValue({
      user: { id: 'user-1', email: 'new@example.com', roleNames: ['user'] },
      verificationToken: 'verify-token',
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@example.com', name: 'New User', password: 'StrongerPass1!' })
      .expect(201);

    expect(res.body).toMatchObject({
      success: true,
      message: 'Registered',
      data: { user: { email: 'new@example.com' }, verificationToken: 'verify-token' },
    });
    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }), expect.any(Object));
  });

  test('login sets auth cookies and returns tokens', async () => {
    authService.login.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'StrongerPass1!' })
      .expect(200);

    expect(res.headers['set-cookie'].join(';')).toContain('accessToken=access-token');
    expect(res.headers['set-cookie'].join(';')).toContain('refreshToken=refresh-token');
    expect(res.body.data).toMatchObject({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });

  test('refresh accepts refresh token from cookie when body is absent', async () => {
    authService.rotateRefreshToken.mockResolvedValue({
      user: { id: 'user-1' },
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=cookie-refresh'])
      .send({})
      .expect(200);

    expect(authService.rotateRefreshToken).toHaveBeenCalledWith('cookie-refresh', expect.any(Object));
    expect(res.body.data.accessToken).toBe('new-access');
  });

  test('logout requires authentication and clears cookies', async () => {
    const token = signAccessToken(activeUser);

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send({ refreshToken: 'refresh-token' })
      .expect(200);

    expect(authService.logout).toHaveBeenCalledWith('refresh-token', activeUser._id, false, expect.any(Object));
    expect(res.headers['set-cookie'].join(';')).toContain('accessToken=;');
    expect(res.headers['set-cookie'].join(';')).toContain('refreshToken=;');
  });

  test('logout rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({ refreshToken: 'refresh-token' }).expect(401);

    expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
