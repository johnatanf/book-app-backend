const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  books: {
    type: [mongoose.Types.ObjectId],
    ref: 'Book',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
