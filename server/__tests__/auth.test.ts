import request from 'supertest';
import app from '../index'; // Adjust the import path to your app's entry point

describe('Auth Routes', () => {
  it('should return API status', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});
