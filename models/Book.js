const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: String,
  author: String,
  read: Boolean,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bookCoverUrl: String,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
