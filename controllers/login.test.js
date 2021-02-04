const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const config = require('../utils/config');
const User = require('../models/User');

const request = supertest(app);

beforeAll(async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });
  await User.deleteMany({});
  await request
    .post('/users')
    .send({ username: 'tim123', name: 'Tim', password: 'tim123' });
});

describe('post /login', () => {
  test('correct user credentials', async () => {
    await request
      .post('/login')
      .redirects(1)
      .send({
        username: 'tim123',
        password: 'tim123',
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'login successful' });
  });

  test('incorrect username', async () => {
    await request
      .post('/login')
      .redirects(1)
      .send({
        username: 'tima123',
        password: 'tim123',
      })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect({ error: 'login failed' });
  });

  test('incorrect password', async () => {
    await request
      .post('/login')
      .redirects(1)
      .send({
        username: 'tim123',
        password: 'tima123',
      })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect({ error: 'login failed' });
  });
});

afterAll(async () => {
  mongoose.connection.close();
});
