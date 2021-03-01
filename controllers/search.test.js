const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');
const config = require('../utils/config');

// authorization tokens
let authorizationToken = null;

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

  const loggedIn = await agent
    .post('/login')
    .send({ username: 'tim123', password: 'tim123' });

  authorizationToken = `Bearer ${loggedIn.body.token}`;

  await agent
    .post('/books')
    .set('Authorization', authorizationToken)
    .send({
      googleBookId: 'W7ZMDwAAQBAJ',
      title: '21 Lessons for the 21st Century',
      subtitle: '',
      authors: ['Yuval Noah Harari'],
      bookCoverUrl: 'http://books.google.com/books/content?id=W7ZMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    });
});

describe('get /search?query=...', () => {
  test('after running a search on a query, the _id property of a book will be set to the book\'s id if user already has it saved', async () => {
    const agent = supertest.agent(app);

    const books = await agent
      .get('/search?query=21 lessons for the 21st century')
      .set('Authorization', authorizationToken);

    const testBook = books.body.find((book) => book.title === '21 Lessons for the 21st Century');
    const bookInDatabase = await Book.findOne({ title: '21 Lessons for the 21st Century' });

    expect(testBook._id.toString()).toBe(bookInDatabase._id.toString());
  });
});

afterAll(() => {
  mongoose.connection.close();
});
