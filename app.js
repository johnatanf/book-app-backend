const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const booksRouter = require('./controllers/books');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middleware.requestLogger);

app.use(cookieParser());
app.use(session({ secret: config.SESSION_SECRET, resave: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/books', booksRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
