require('dotenv').config();

const {
  NODE_ENV, PORT, DEVELOPMENT_MONGODB_URI, TEST_MONGODB_URI, SESSION_SECRET,
} = process.env;

let MONGODB_URI = '';
let SECURE_COOKIE_CONFIG = null;
let SAME_SITE = null;
if (NODE_ENV === 'development') {
  MONGODB_URI = DEVELOPMENT_MONGODB_URI;
  SECURE_COOKIE_CONFIG = false;
  SAME_SITE = false;
} else if (NODE_ENV === 'test') {
  MONGODB_URI = TEST_MONGODB_URI;
  SECURE_COOKIE_CONFIG = false;
  SAME_SITE = false;
} else if (NODE_ENV === 'production') {
  SECURE_COOKIE_CONFIG = true;
  SAME_SITE = 'none';
}

module.exports = {
  MONGODB_URI,
  PORT,
  SESSION_SECRET,
  SECURE_COOKIE_CONFIG,
  SAME_SITE,
};
