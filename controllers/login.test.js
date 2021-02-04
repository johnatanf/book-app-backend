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
    .send({ username: 'tim', name: 'Tim', password: 'tim' });
});

describe('post /login', () => {
  test('correct user credentials', async () => {
    await request
      .post('/login')
      .redirects(1)
      .send({
        username: 'tim',
        password: 'tim',
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
        username: 'tima',
        password: 'tim',
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
        username: 'tim',
        password: 'tima',
      })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect({ error: 'login failed' });
  });
});

afterAll(async () => {
  mongoose.connection.close();
});
