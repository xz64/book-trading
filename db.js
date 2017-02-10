const mongoose = require('mongoose');
const config = require('./config');

mongoose.Promise = Promise;

mongoose.connect(config.get('mongoURI'));

const db = mongoose.connection;

const initPromise = new Promise((resolve, reject) => {
  db.once('open', resolve);
  db.once('error', reject);
});

module.exports = {
  initialize() {
    return initPromise;
  },
};
