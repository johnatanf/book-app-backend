const express = require('express');
const Book = require('../models/Book');

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
  try {
    const { body } = request;

    const book = new Book({
      name: body.name,
      author: body.author,
      read: body.read,
      // userId: 12312312312,
      bookCoverUrl: body.bookCoverUrl,
    });
    await book.save();
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
