const mongoose = require('mongoose');
const co = require('co');
const argon2 = require('argon2');
const logger = require('../logger');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  name: String,
  city: String,
  state: String,
});

const hashOptions = {
  timeCost: 100,
  type: argon2.argon2i,
};

const hashPassword = co.wrap(function* passwordHasher(password) {
  const salt = yield argon2.generateSalt();
  const hash = yield argon2.hash(password, salt, hashOptions);
  return hash;
});

userSchema.pre('save', function passwordMiddleware(next) {
  if (this.isModified('password')) {
    hashPassword(this.password)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      logger.error(error);
      next(error);
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function verifyPassword(givenPassword) {
  const userPassword = this.password;
  return co(function* passwordHashVerifier() {
    const match = yield argon2.verify(userPassword, givenPassword);
    if (!match) {
      throw new Error('Password did not match');
    }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
