const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tradeSchema = new Schema({
  requesterBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  requestedBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
});

tradeSchema.index({ requesterBook: 1, requestedBook: 1 }, { unique: true });

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
