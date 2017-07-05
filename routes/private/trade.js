const Router = require('koa-router');
const validator = require('is-my-json-valid');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');

const TradeRequestValidationFields = require('../../validators/trade').tradeRequest;
const Book = require('../../models/Book');
const Trade = require('../../models/Trade');

const router = new Router();

const validateTradeRequest = validator({
  required: true,
  type: 'object',
  properties: TradeRequestValidationFields,
});

router.get('/trades', function* getMyTrades() {
  const books = yield Book.find({
    owner: this.passport.user,
  });

  const trades = yield Trade.find({ requestedBook: { $in: books } })
    .populate({
      path: 'requesterBook',
      populate: {
        path: 'owner',
        select: {
          fullname: 1,
        },
      },
    })
    .populate('requestedBook');

  this.body = trades.map(trade => trade.toObject({ versionKey: false }));
});

router.post('/trades/reject/:id', function* rejectTrade() {
  const id = new mongoose.Types.ObjectId(this.params.id);
  const trade = yield Trade.findById(id);

  const requestedBook = yield Book.findById(trade.requestedBook);

  if (!this.passport.user._id.equals(requestedBook.owner)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'cannot reject a trade to a book that you do not own' };
    return;
  }

  yield trade.remove();
  this.body = {};
});

router.post('/trades/accept/:id', function* acceptTrade() {
  const id = new mongoose.Types.ObjectId(this.params.id);
  const trade = yield Trade.findById(id);

  const requesterBook = yield Book.findById(trade.requesterBook);
  const requestedBook = yield Book.findById(trade.requestedBook);

  if (!this.passport.user._id.equals(requestedBook.owner)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'cannot accept a trade to a book that you do not own' };
    return;
  }

  // remove all invalidated trade requests
  yield Trade.remove({
    requestedBook,
  });

  yield Trade.remove({
    requestedBook: requesterBook,
  });

  yield Trade.remove({
    requesterBook: requestedBook,
  });

  yield Trade.remove({
    requesterBook,
  });

  // swap book owners
  const tempOwner = requesterBook.owner;
  requesterBook.owner = requestedBook.owner;
  requestedBook.owner = tempOwner;


  yield requesterBook.save();
  yield requestedBook.save();

  this.body = {};
});

router.post('/trades', function* newTrade() {
  const params = this.request.body;

  if (!validateTradeRequest(params)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = validateTradeRequest.errors;
    return;
  }

  const requesterBook = yield Book.findById(params.requesterBook).populate('owner');
  const requestedBook = yield Book.findById(params.requestedBook).populate('owner');

  if (!this.passport.user._id.equals(requesterBook.owner._id)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'cannot propose a trade against a book you do not own' };
    return;
  }

  if (this.passport.user._id.equals(requestedBook.owner._id)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'cannot propose a trade against your own book' };
    return;
  }

  const tradeRequest = new Trade({
    requesterBook,
    requestedBook,
  });

  yield tradeRequest.save();

  this.body = {};
});

module.exports = router;
