const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  author: {
    type: String,
    trim: true,
    required: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

bookSchema.index({ title: 1, author: 1, owner: 1 }, { unique: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
