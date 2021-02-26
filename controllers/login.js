const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const config = require('../utils/config');

const loginRouter = express.Router();

loginRouter.post('/', async (request, response, next) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      response.status(401).json({ error: 'wrong username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      response.status(401).json({ error: 'wrong username or password' });
    }

    const payload = { _id: user._id, username };
    const token = jwt.sign(payload, config.SECRET);

    response.status(200).json({ token });
  } catch (e) {
    next(e);
  }
});

module.exports = loginRouter;
