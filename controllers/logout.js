const express = require('express');

const logoutRouter = express.Router();

logoutRouter.get('/', (request, response) => {
  request.logout();
  response.redirect('/');
});

module.exports = logoutRouter;
