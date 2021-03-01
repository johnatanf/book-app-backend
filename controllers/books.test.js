const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/User');
const config = require('../utils/config');

let authorizationTokenAgent1 = null;
let authorizationTokenAgent2 = null;
let validBook = null;
let validBookId = null;
let notOwnedValidBook = null;
let notOwnedValidBookId = null;

beforeAll(async () => {
  // connect to database
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  });

  // clear database
  await User.deleteMany({});
  await Book.deleteMany({});

  // first agent (tim)
  const agent = supertest.agent(app);

  await agent
    .post('/users')
    .send({ username: 'tim123', name: 'Tim', password: 'tim123' });

  const loggedInAgent1 = await agent
    .post('/login')
    .send({ username: 'tim123', password: 'tim123' });

  authorizationTokenAgent1 = `Bearer ${loggedInAgent1.body.token}`;

  await agent
    .post('/books')
    .set('Authorization', authorizationTokenAgent1)
    .send({
      googleBookId: 'W7ZMDwAAQBAJ',
      title: '21 Lessons for the 21st Century',
      subtitle: '',
      authors: ['Yuval Noah Harari'],
      bookCoverUrl: 'http://books.google.com/books/content?id=W7ZMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    });

  validBook = await Book.findOne({ googleBookId: 'W7ZMDwAAQBAJ' });
  validBookId = validBook._id;

  // second agent (bob)
  const agent2 = supertest.agent(app);

  await agent2
    .post('/users')
    .send({ username: 'bob456', name: 'Bob', password: 'bob456' });

  const loggedInAgent2 = await agent2
    .post('/login')
    .send({ username: 'bob456', password: 'bob456' });

  authorizationTokenAgent2 = `Bearer ${loggedInAgent2.body.token}`;

  await agent2
    .post('/books')
    .set('Authorization', authorizationTokenAgent2)
    .send({
      googleBookId: 'pD6arNyKyi8C',
      title: 'The Hobbit',
      subtitle: '',
      authors: ['J.R.R. Tolkien'],
      bookCoverUrl: 'http://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    });

  notOwnedValidBook = await Book.findOne({ googleBookId: 'pD6arNyKyi8C' });
  notOwnedValidBookId = notOwnedValidBook._id;
});

describe('get /books', () => {
  test('trying to retrieve /books without being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .get('/books')
      .set('Authorization', null)
      .expect(401)
      .expect({ error: 'Please log in.' });
  });

  test('retrieving /books when logged in returns books in json format', async () => {
    const agent = supertest.agent(app);

    await agent
      .get('/books')
      .set('Authorization', authorizationTokenAgent1)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('post /books', () => {
  test('trying to create a book without being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .post('/books')
      .set('Authorization', null)
      .send({
        googleBookId: 'i6q_zQEACAAJ',
        title: 'Nineteen Eighty-Four',
        subtitle: '',
        authors: ['George Orwell'],
        bookCoverUrl: 'http://books.google.com/books/content?id=i6q_zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      })
      .expect(401)
      .expect({ error: 'Please log in.' });
  });

  test('creating a book when logged in returns the book in json format, appears in user\'s book array, and appears in book collection', async () => {
    const agent = supertest.agent(app);
    let userAfterUpdate = {};
    let book = {};

    await agent
      .post('/books')
      .set('Authorization', authorizationTokenAgent1)
      .send({
        googleBookId: 'i6q_zQEACAAJ',
        title: 'Nineteen Eighty-Four',
        subtitle: '',
        authors: ['George Orwell'],
        bookCoverUrl: 'http://books.google.com/books/content?id=i6q_zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    userAfterUpdate = await User.findOne({ username: 'tim123' });
    book = await Book.findOne({ title: 'Nineteen Eighty-Four' });

    expect(userAfterUpdate.books).toHaveLength(2); // there is already one in the database
    expect(book).toBeTruthy();
  });
});

describe('get /books/:id', () => {
  test('trying to view a specific book without being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .get(`/books/${validBookId}`)
      .set('Authorization', null)
      .expect(401)
      .expect({ error: 'Please log in.' });
  });

  test('trying to view an invalid book id while being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .get('/books/123456')
      .set('Authorization', authorizationTokenAgent1)
      .expect(404)
      .expect({ error: 'That book does not exist.' });
  });

  test('trying to view a valid book id that a user does not own returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .get(`/books/${notOwnedValidBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .expect(401)
      .expect({ error: 'You do not have permission to view this book.' });
  });

  test('trying to view a valid book id that a user owns returns the book in json format', async () => {
    const agent = supertest.agent(app);

    await agent
      .get(`/books/${validBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('put /books/:id', () => {
  test('trying to edit a specific book without being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .put(`/books/${validBookId}`)
      .set('Authorization', null)
      .send({ read: true })
      .expect(401)
      .expect({ error: 'Please log in.' });
  });

  test('trying to edit an invalid book id while being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .put('/books/123456')
      .set('Authorization', authorizationTokenAgent1)
      .send({ read: true })
      .expect(404)
      .expect({ error: 'That book does not exist.' });
  });

  test('trying to edit a valid book id that a user does not own returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .put(`/books/${notOwnedValidBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .send({ read: true })
      .expect(401)
      .expect({ error: 'You do not have permission to edit this book.' });
  });

  test('trying to edit a valid book id that a user owns returns the book in json format, and changes read property of book to true', async () => {
    const agent = supertest.agent(app);
    let editedBook = {};

    await agent
      .put(`/books/${validBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .send({ read: true })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    editedBook = await Book.findById(validBookId);
    expect(editedBook.read).toBe(true);
  });
});

describe('delete /books/:id', () => {
  test('trying to delete a specific book without being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .delete(`/books/${validBookId}`)
      .set('Authorization', null)
      .expect(401)
      .expect({ error: 'Please log in.' });
  });

  test('trying to edit an invalid book id while being logged in returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .delete('/books/123456')
      .set('Authorization', authorizationTokenAgent1)
      .expect(404)
      .expect({ error: 'That book does not exist.' });
  });

  test('trying to delete a valid book id that a user does not own returns an error', async () => {
    const agent = supertest.agent(app);

    await agent
      .delete(`/books/${notOwnedValidBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .expect(401)
      .expect({ error: 'You do not have permission to delete this book.' });
  });

  test('trying to delete a valid book id that a user owns returns status 200 with a success message, removes book from user\'s book array, and removes book from book collection', async () => {
    const agent = supertest.agent(app);
    let user = {};
    let deletedBook = {};

    await agent
      .delete(`/books/${validBookId}`)
      .set('Authorization', authorizationTokenAgent1)
      .expect(200)
      .expect({ message: 'delete successful' });

    user = await User.findOne({ username: 'tim123' });
    deletedBook = await Book.findById(validBookId);

    expect(user.books).toHaveLength(1); // 2 books prior to deletion (see beforeAll and post test)
    expect(deletedBook).toBe(null);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
