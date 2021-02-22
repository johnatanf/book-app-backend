const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');
const config = require('../utils/config');

beforeAll(async () => {
  // connect to database
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });

  // clear database
  await User.deleteMany({});
  await Book.deleteMany({});

  // create account, log in and create book
  const agent = supertest.agent(app);

  await agent
    .post('/users')
    .send({ username: 'tim123', name: 'Tim', password: 'tim123' });

  await agent
    .post('/login')
    .send({ username: 'tim123', password: 'tim123' });

  await agent
    .post('/books')
    .send({
      googleBookId: 'i6q_zQEACAAJ',
      title: 'Nineteen Eighty-Four',
      subtitle: '',
      authors: ['George Orwell'],
      bookCoverUrl: 'http://books.google.com/books/content?id=i6q_zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    });
});

describe('get /logout', () => {
  test('logging out after logging in restricts user from accessing protected routes', async () => {
    const agent = supertest.agent(app);

    await agent.post('/login').send({ username: 'tim123', password: 'tim123' });
    await agent.get('/books')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await agent.get('/logout');
    await agent.get('/books')
      .expect(401)
      .expect({ error: 'Please log in first' });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
