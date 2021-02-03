const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const saltRounds = 10;

const usersRouter = express.Router();

usersRouter.post('/', async (request, response) => {
  const { body } = request;

  if (!body.username || !body.name || !body.password) {
    return response.status(400).json({ error: 'username, name and password are required' });
  }

  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  await user.save();

  return response.json({
    username: user.username,
    name: user.name,
  });
});

module.exports = usersRouter;
