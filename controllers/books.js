const express = require('express');
const Book = require('../models/Book');
const User = require('../models/User');

const booksRouter = express.Router();

booksRouter.get('/', async (request, response, next) => {
  try {
    const books = await Book.find({});
    response.json(books);
  } catch (e) {
    next(e);
  }
});

booksRouter.post('/', async (request, response, next) => {
  const userId = '6017a1112870db05f8c89562'; // test

  try {
    const { body } = request;
    const user = await User.findById(userId);

    const book = new Book({
      name: body.name,
      author: body.author,
      read: body.read,
      userId,
      bookCoverUrl: body.bookCoverUrl,
    });

    user.books = user.books.concat(book._id);

    await book.save();
    await user.save();

    response.json(book);
  } catch (e) {
    next(e);
  }
});

booksRouter.get('/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    const book = await Book.findById(id);
    response.json(book);
  } catch (e) {
    next(e);
  }
});

booksRouter.put('/:id', async (request, response, next) => {
  try {
    const { body } = request;
    const updatedBook = await Book.findByIdAndUpdate(
      request.params.id,
      { read: body.read },
      { new: true },
    );

    response.json(updatedBook);
  } catch (e) {
    next(e);
  }
});

booksRouter.delete('/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    await Book.findByIdAndDelete(id);
    response.status(200).json({ message: 'delete successful' });
  } catch (e) {
    next(e);
  }
});

module.exports = booksRouter;
