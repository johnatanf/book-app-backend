const express = require('express');
const axios = require('axios');
const sanitizeHtml = require('sanitize-html');
const { decode } = require('html-entities');
const middleware = require('../utils/middleware');
const Book = require('../models/Book');
const User = require('../models/User');

const booksRouter = express.Router();

booksRouter.get('/', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const books = await Book.find({ userId });

    response.json(books.map((book) => {
      const decodedBook = book;
      decodedBook.bookCoverUrl = decode(decodedBook.bookCoverUrl).replace('http', 'https');
      return decodedBook;
    }));
  } catch (e) {
    next(e);
  }
});

booksRouter.post('/', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const { body } = request;
    const user = await User.findById(userId);
    const googleBookId = body.googleBookId ? sanitizeHtml(body.googleBookId) : undefined;
    const title = body.title ? sanitizeHtml(body.title) : undefined;
    const subtitle = body.subtitle ? sanitizeHtml(body.subtitle) : undefined;
    const authors = body.authors ? sanitizeHtml(body.authors) : undefined;
    const bookCoverUrl = body.bookCoverUrl ? sanitizeHtml(body.bookCoverUrl) : undefined;

    const book = new Book({
      googleBookId,
      title,
      subtitle,
      authors,
      read: false,
      bookCoverUrl,
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
      return response.status(401).json({ error: 'You do not have permission to view this book.' });
    }

    // request remaining information from google api
    const axiosData = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.googleBookId}`);
    const googleData = axiosData.data;

    return response.json({
      googleBookId: book.googleBookId,
      title: book.title,
      subtitle: book.subtitle,
      read: book.read,
      authors: book.authors,
      bookCoverUrl: decode(book.bookCoverUrl).replace('http', 'https'),
      description: googleData.volumeInfo.description,
      categories: googleData.volumeInfo.categories,
      releaseDate: googleData.volumeInfo.publishedDate,
      rating: googleData.volumeInfo.averageRating,
      pageCount: googleData.volumeInfo.pageCount,
      printedPageCount: googleData.volumeInfo.printedPageCount,
      linkToPurchase: googleData.saleInfo.buyLink,
    });
  } catch (e) {
    return next(e);
  }
});

booksRouter.put('/:id', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    const userId = request.user._id;
    const { id } = request.params;
    const read = request.body.read ? sanitizeHtml(request.body.read) : false;
    const book = await Book.findById(id);

    if (!book.userId.equals(userId)) {
      return response.status(401).json({ error: 'You do not have permission to edit this book.' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { read },
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
      return response.status(401).json({ error: 'You do not have permission to delete this book.' });
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
