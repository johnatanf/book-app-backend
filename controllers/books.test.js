const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');

const request = supertest(app);

beforeAll(async () => {
  const user = new User({ username: 'tim', name: 'Tim', password: 'tim' });
  await user.save();
});

describe('/books routes', () => {
  describe('when not logged in', () => {
    test('get /books returns status 403 if not logged in', async () => {
      await request
        .get('/books')
        .expect(403)
        .expect('Content-Type', /application\/json/);
    });
  });

  describe('when logged in', () => {

  });
});

afterAll(() => {
  mongoose.connection.close();
});
