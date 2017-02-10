const mongoose = require('mongoose');
const argon2 = require('argon2');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  name: String,
  city: String,
  state: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
