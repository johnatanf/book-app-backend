const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  googleBookId: String,
  title: String,
  subtitle: String,
  authors: [String],
  read: Boolean,
  bookCoverUrl: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
