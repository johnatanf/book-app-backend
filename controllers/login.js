const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const config = require('../utils/config');

const loginRouter = express.Router();

loginRouter.post('/', async (request, response, next) => {
  try {
    let { username, password } = request.body;
    username = sanitizeHtml(username);
    password = sanitizeHtml(password);
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ error: 'wrong username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return response.status(401).json({ error: 'wrong username or password' });
    }

    const payload = { _id: user._id, username };
    const token = jwt.sign(payload, config.SECRET, { expiresIn: '7d' });

    return response.status(200).json({ token });
  } catch (e) {
    return next(e);
  }
});

module.exports = loginRouter;
