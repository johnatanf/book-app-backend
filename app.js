const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const booksRouter = require('./controllers/books');
const loginRouter = require('./controllers/login');
const searchRouter = require('./controllers/search');
const usersRouter = require('./controllers/users');

const app = express();

logger.info(`Connecting to ${config.MONGODB_URI}`);

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
  })
    .then(() => {
      logger.info('Successfully connected to MongoDB');
    })
    .catch((err) => {
      logger.error(`Failed to establish connection with MongoDB ${err.message}`);
    });
}

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ credentials: true, origin: config.ORIGIN }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middleware.requestLogger);

app.use(cookieParser());
app.use(session({
  secret: config.SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: config.SECURE_COOKIE_CONFIG,
    sameSite: config.SAME_SITE,
  },
}));

app.use('/books', booksRouter);
app.use('/login', loginRouter);
app.use('/search', searchRouter);
app.use('/users', usersRouter);
app.use('/', (request, response) => {
  response.end();
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
