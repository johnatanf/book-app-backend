const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Book = require('../models/Book');
const config = require('../utils/config');

const request = supertest(app);

beforeAll(async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });

  // clear database
  await User.deleteMany({});
  await Book.deleteMany({});
});

describe('post /users', () => {
  test('creating an account with no username results in an error', async () => {
    const user = {
      name: 'Tim',
      password: 'tim123',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });

  test('creating an account with no name results in an error', async () => {
    const user = {
      username: 'tim123',
      password: 'tim123',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });

  test('creating an account with no password results in an error', async () => {
    const user = {
      username: 'tim123',
      name: 'Tim',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'username, name and password are required' });
  });

  test('creating an account with complete and correct credentials results in status code 200 and returns the username and name in json format', async () => {
    const user = {
      username: 'tim123',
      name: 'Tim',
      password: 'tim123',
    };
    await request.post('/users')
      .send(user)
      .expect(200)
      .expect({
        username: 'tim123',
        name: 'Tim',
      });
  });

  test('attempting to create an account with an already taken username results in an error', async () => {
    const user = {
      username: 'tim123',
      name: 'Tim',
      password: 'tim123',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'Username is already taken.' });
  });

  test('attempting to create an account with a username of less than 6 characters results in an error', async () => {
    const user = {
      username: 'tim12',
      name: 'Tim',
      password: 'tim123',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'Username should be at least 6 characters long.' });
  });

  test('attempting to create an account with a password of less than 6 characters results in an error', async () => {
    const user = {
      username: 'tim123',
      name: 'Tim',
      password: 'tim12',
    };
    await request.post('/users')
      .send(user)
      .expect(400)
      .expect({ error: 'Password should be at least 6 character long.' });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
