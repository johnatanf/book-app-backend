const express = require('express');

const booksRouter = express.Router();

booksRouter.get('/', (request, response) => {
  response.send('Retrieve and display books here from database');
});

booksRouter.post('/', (request, response) => {
  response.send('Save book');
});

booksRouter.get('/:id', (request, response) => {
  response.send(`Retrieve details about book id ${request.params.id}`);
});

booksRouter.put('/:id', (request, response) => {
  response.send(`Update book id ${request.params.id}`);
});

booksRouter.delete('/:id', (request, response) => {
  response.send(`Delete book id ${request.params.id}`);
});

module.exports = booksRouter;
