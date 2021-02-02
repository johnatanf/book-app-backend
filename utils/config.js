require('dotenv').config();

const { PORT, MONGODB_URI, SESSION_SECRET } = process.env;

module.exports = {
  MONGODB_URI,
  PORT,
  SESSION_SECRET,
};
