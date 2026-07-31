const request = require('supertest');
const app = require('../src/app');

describe('health endpoints', () => {
  test('GET /api/v1/health returns ok', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  test('GET /api/v1/version returns version information', async () => {
    const res = await request(app).get('/api/v1/version').expect(200);
    expect(res.body.data.name).toBeDefined();
  });
});
