const logger = require('./logger');

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method);
  logger.info('Path: ', request.path);
  logger.info('Body: ', request.body);
  logger.info('---');
  next();
};

const checkLoggedIn = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({ error: 'Please log in first' });
  }
  return next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(404).json({ error: 'That book does not exist.' });
  }

  return next(error);
};

module.exports = {
  requestLogger,
  checkLoggedIn,
  unknownEndpoint,
  errorHandler,
};
