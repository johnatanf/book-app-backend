const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
  books: {
    type: [mongoose.Types.ObjectId],
    ref: 'Book',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
