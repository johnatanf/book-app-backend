const express = require('express');
const axios = require('axios');

const searchRouter = express.Router();

searchRouter.get('/', async (request, response) => {
  // url format: baseUrl/search?query=...
  const { query } = request.query;

  const axiosData = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  let googleData = await axiosData.data.items;

  googleData = googleData.map((data) => ({
    title: data.volumeInfo.title,
    subtitle: data.volumeInfo.subtitle,
    authors: data.volumeInfo.authors,
    bookCoverUrl: data.volumeInfo.imageLinks.thumbnail,
    description: data.volumeInfo.description,
    categories: data.volumeInfo.categories,
    releaseDate: data.volumeInfo.publishedDate,
    rating: data.volumeInfo.averageRating,
    pageCount: data.volumeInfo.pageCount,
    printedPageCount: data.volumeInfo.printedPageCount,
    linkToPurchase: data.saleInfo.buyLink,
  }));

  response.json(googleData);
});

module.exports = searchRouter;
