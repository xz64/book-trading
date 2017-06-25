const Router = require('koa-router');
const validator = require('is-my-json-valid');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');

const BookValidationFields = require('../../validators/book').book;
const Book = require('../../models/Book');

const router = new Router();

const validateBook = validator({
  required: true,
  type: 'object',
  properties: BookValidationFields,
});

router.get('/books/:id', function* getBook() {
  try {
    const id = new mongoose.Types.ObjectId(this.params.id);
    const book = yield Book.findById(id).populate('owner', 'fullname');
    this.body = book.toObject({ versionKey: false });
  } catch (e) {
    this.status = HttpStatus.NOT_FOUND;
    this.body = {};
  }
});

router.get('/books', function* getAllBooks() {
  const books = yield Book.find().populate('owner', 'fullname');
  this.body = books.map(book => book.toObject({ versionKey: false }));
});

router.post('/books', function* addBook() {
  const params = this.request.body;

  if (!validateBook(params)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = validateBook.errors;
    return;
  }

  const book = new Book({
    title: params.title,
    author: params.author,
    owner: this.passport.user,
  });

  yield book.save();

  this.body = { _id: book._id.toString() }; // eslint-disable-line no-underscore-dangle
});

module.exports = router;
