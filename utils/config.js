require('dotenv').config();

const {
  NODE_ENV, PORT, DEVELOPMENT_MONGODB_URI, TEST_MONGODB_URI, SESSION_SECRET,
} = process.env;

let MONGODB_URI = '';
if (NODE_ENV === 'development') {
  MONGODB_URI = DEVELOPMENT_MONGODB_URI;
} else if (NODE_ENV === 'test') {
  MONGODB_URI = TEST_MONGODB_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
  SESSION_SECRET,
};
