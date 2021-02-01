const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { body } = request;
  const user = await User.findOne({ username: body.username });
  if (!user || !body.username) {
    return response.json({ error: 'invalid username/password' });
  }

  const correctPassword = await bcrypt.compare(body.password, user.passwordHash);

  if (correctPassword) {
    return response.json({ message: 'correct username and password' });
  }
  return response.json({ error: 'invalid username/password' });
});

module.exports = loginRouter;
