const express = require('express');
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const middleware = require('../utils/middleware');

const saltRounds = 10;

const usersRouter = express.Router();

usersRouter.get('/', middleware.checkLoggedIn, (request, response) => {
  // user token;
  response.status(200).json({ username: request.user.username });
});

usersRouter.post('/', async (request, response, next) => {
  try {
    const username = request.body.username ? sanitizeHtml(request.body.username) : undefined;
    const name = request.body.name ? sanitizeHtml(request.body.name) : undefined;
    const password = request.body.password ? sanitizeHtml(request.body.password) : undefined;

    if (!username || !name || !password) {
      return response.status(400).json({ error: 'username, name and password are required' });
    }

    if (password.length < 6) {
      return response.status(400).json({ error: 'Password should be at least 6 character long.' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({ username, name, passwordHash });

    await user.save();

    // user token;
    return response.json({
      username: user.username,
      name: user.name,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = usersRouter;
