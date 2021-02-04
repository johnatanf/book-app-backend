const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const config = require('../utils/config');

const request = supertest(app);

beforeAll(async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });
});

describe('post /users', () => {
  test('complete credentials', async () => {
    const user = {
      username: 'tim',
      name: 'Tim',
      password: 'tim',
    };
    await request.post('/users')
      .send(user)
      .expect(200)
      .expect({
        username: 'tim',
        name: 'Tim',
      });
  });

  test('missing username', async () => {
    const user = {
      name: 'Tim',
      password: 'tim',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });

  test('missing name', async () => {
    const user = {
      username: 'tim',
      password: 'tim',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });

  test('missing password', async () => {
    const user = {
      username: 'tim',
      name: 'tim',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });
});

afterAll(async () => {
  await User.deleteMany({});
  mongoose.connection.close();
});
