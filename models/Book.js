const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: String,
  read: Boolean,
  userId: {
    type: mongoose.Types.ObjectId(),
    ref: 'User',
  },
  bookCoverUrl: String,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
