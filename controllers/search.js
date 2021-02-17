const express = require('express');
const axios = require('axios');
const middleware = require('../utils/middleware');
const Book = require('../models/Book');

const searchRouter = express.Router();

searchRouter.get('/', middleware.checkLoggedIn, async (request, response, next) => {
  try {
    // url format: baseUrl/search?query=...
    const { query } = request.query;
    const userId = request.user._id;

    const axiosData = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    let googleData = axiosData.data.items;
    const userBooks = await Book.find({ userId });
    const userBookIds = userBooks.map((book) => book.googleBookId);

    googleData = googleData.map((data) => ({
      _id: userBookIds.includes(data.id)
        ? userBooks.find((book) => book.googleBookId === data.id)._id
        : null,
      googleBookId: data.id,
      title: data.volumeInfo.title,
      subtitle: data.volumeInfo.subtitle,
      authors: data.volumeInfo.authors,
      bookCoverUrl: data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : null,
      description: data.volumeInfo.description,
      categories: data.volumeInfo.categories,
      releaseDate: data.volumeInfo.publishedDate,
      rating: data.volumeInfo.averageRating,
      pageCount: data.volumeInfo.pageCount,
      printedPageCount: data.volumeInfo.printedPageCount,
      linkToPurchase: data.saleInfo.buyLink,
    }));

    return response.json(googleData);
  } catch (e) {
    return next(e);
  }
});

module.exports = searchRouter;
