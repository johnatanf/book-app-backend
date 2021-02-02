const express = require('express');
const middleware = require('../utils/middleware');
const Book = require('../models/Book');
const User = require('../models/User');

const booksRouter = express.Router();

booksRouter.get('/', middleware.checkLoggedIn, async (request, response, next) => {
  const userId = request.user._id;
  try {
    const books = await Book.find({ userId });
    response.json(books);
  } catch (e) {
    next(e);
  }
});

booksRouter.post('/', middleware.checkLoggedIn, async (request, response, next) => {
  const userId = request.user._id;

  try {
    const { body } = request;
    const user = await User.findById(userId);

    const book = new Book({
      googleBookId: body.googleBookId,
      title: body.title,
      subtitle: body.subtitle,
      authors: body.authors,
      read: false,
      bookCoverUrl: body.bookCoverUrl,
      userId,
    });

    user.books = user.books.concat(book._id);

    await book.save();
    await user.save();

    response.json(book);
  } catch (e) {
    next(e);
  }
});

booksRouter.get('/:id', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const { id } = request.params;
    const book = await Book.findById(id);

    if (!book.userId.equals(userId)) {
      return response.json({ error: 'You do not have permission to view this book.' });
    }
    return response.json(book);
  } catch (e) {
    return next(e);
  }
});

booksRouter.put('/:id', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const { id } = request.params;
    const { body } = request;
    const book = await Book.findById(id);

    if (!book.userId.equals(userId)) {
      return response.json({ error: 'You do not have permission to edit this book.' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { read: body.read },
      { new: true },
    );

    return response.json(updatedBook);
  } catch (e) {
    return next(e);
  }
});

booksRouter.delete('/:id', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const { id } = request.params;
    const book = await Book.findById(id);
    const user = await User.findById(userId);

    if (!book.userId.equals(userId)) {
      return response.json({ error: 'You do not have permission to delete this book.' });
    }

    user.books = user.books.filter((iterateBook) => !iterateBook._id.equals(book._id));

    await Book.findByIdAndDelete(id);
    await user.save();
    return response.status(200).json({ message: 'delete successful' });
  } catch (e) {
    return next(e);
  }
});

module.exports = booksRouter;
