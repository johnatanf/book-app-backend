const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const saltRounds = 10;

const usersRouter = express.Router();

usersRouter.post('/', async (request, response) => {
  const { body } = request;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  await user.save();

  response.json(user);
});

module.exports = usersRouter;
