const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const app = express();

logger.info(`Connecting to ${config.MONGODB_URI}`);

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
})
  .then(() => {
    logger.info('Successfully connected to MongoDB');
  })
  .catch((err) => {
    logger.error(`Failed to establish connection with MongoDB ${err.message}`);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/', (request, response) => {
  response.send('Hello, world!');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
