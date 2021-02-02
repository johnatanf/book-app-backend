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
    return response.status(403).json({ error: 'Please log in first' });
  }
  return next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  next(error);
};

module.exports = {
  requestLogger,
  checkLoggedIn,
  unknownEndpoint,
  errorHandler,
};
