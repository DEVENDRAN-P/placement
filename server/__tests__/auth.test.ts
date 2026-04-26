import request from 'supertest';
import app from '../index'; // Adjust the import path to your app's entry point
import mongoose from 'mongoose';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || '');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return API status', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});
