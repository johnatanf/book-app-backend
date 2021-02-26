const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const config = require('../utils/config');
const User = require('../models/User');
const Book = require('../models/Book');

const request = supertest(app);

beforeAll(async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });
  // clear database
  await User.deleteMany({});
  await Book.deleteMany({});

  // create account
  await request
    .post('/users')
    .send({ username: 'tim123', name: 'Tim', password: 'tim123' });
});

describe('post /login', () => {
  test('log in with correct user credentials returns a success message', async () => {
    const logInRequest = await request
      .post('/login')
      .send({
        username: 'tim123',
        password: 'tim123',
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(logInRequest.body.token).toBeTruthy();
  });

  test('log in with incorrect username returns an error', async () => {
    await request
      .post('/login')
      .send({
        username: 'tima123',
        password: 'tim123',
      })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect({ error: 'wrong username or password' });
  });

  test('log in with incorrect password returns an error', async () => {
    await request
      .post('/login')
      .send({
        username: 'tim123',
        password: 'tima123',
      })
      .expect(400)
      .expect('Content-Type', /json/)
      .expect({ error: 'wrong username or password' });
  });
});

afterAll(async () => {
  mongoose.connection.close();
});
