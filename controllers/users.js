const express = require('express');

const usersRouter = express.Router();

usersRouter.post('/', (request, response) => {
  response.send('Save user');
});

module.exports = usersRouter;
