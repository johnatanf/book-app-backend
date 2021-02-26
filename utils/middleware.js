const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../models/User');
const config = require('./config');

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method);
  logger.info('Path: ', request.path);
  logger.info('Body: ', request.body);
  logger.info('---');
  next();
};

const checkLoggedIn = async (request, response, next) => {
  try {
    const requestToken = request.header('Authorization');
    const decodedToken = jwt.verify(requestToken.slice(7, requestToken.length), config.SECRET);
    const userIsInDatabase = await User.findById(decodedToken._id);

    if (!userIsInDatabase) {
      return response.status(401).json({ error: 'Please log in first' });
    }

    request.user = decodedToken;

    return next();
  } catch (e) {
    return next(e);
  }
};

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(404).json({ error: 'That book does not exist.' });
  }

  if (error.name === 'ValidationError' && error.errors.username.kind === 'unique') {
    return response.status(400).json({ error: 'Username is already taken.' });
  }

  if (error.name === 'ValidationError' && error.errors.username.kind === 'minlength') {
    return response.status(400).json({ error: 'Username should be at least 6 characters long.' });
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Please log in.' });
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Please log in again.' });
  }

  return next(error);
};

module.exports = {
  requestLogger,
  checkLoggedIn,
  unknownEndpoint,
  errorHandler,
};
