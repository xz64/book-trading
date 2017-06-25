const mongoose = require('mongoose');
const co = require('co');
const argon2 = require('argon2');
const logger = require('../logger');
const msgKeys = require('../msgKeys');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: String,
  invalidAttempts: {
    type: Number,
    default: 0,
  },
  lockExpiration: {
    type: Date,
    default: Date.now,
  },
  fullname: {
    type: String,
    trim: true,
    required: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
});

const ATTEMPTS_UNTIL_LOCK = 5;
const LOCK_DURATION_MINUTES = 60;

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
  const user = this;
  return co(function* passwordHashVerifier() {
    const lockValid = user.lockExpiration.getTime() > Date.now();
    if (lockValid) {
      // eslint-disable-next-line no-throw-literal
      throw { error: msgKeys.USER_LOCKED, minutes: LOCK_DURATION_MINUTES };
    }

    const match = yield argon2.verify(user.password, givenPassword);
    if (!match) {
      user.invalidAttempts += 1;

      if ((user.invalidAttempts % ATTEMPTS_UNTIL_LOCK) === 0) {
        user.lockExpiration = Date.now() + (LOCK_DURATION_MINUTES * 60 * 1000);
      }

      yield user.save();

      throw { error: msgKeys.INVALID_USERNAME_PASSWORD }; // eslint-disable-line no-throw-literal
    } else { // correct password
      user.invalidAttempts = 0;
      user.lockExpiration = Date.now();
      yield user.save();

      return user;
    }
  });
};

userSchema.statics.authenticate = function authenticate(username, password) {
  const model = this;
  const adjustedUsername = username.toLowerCase();
  return co(function* authenticateGenerator() {
    const user = yield model.findOne({ username: adjustedUsername });
    if (!user) { // user doesn't exist
      throw { error: msgKeys.INVALID_USERNAME_PASSWORD }; // eslint-disable-line no-throw-literal
    }

    return yield user.verifyPassword(password);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
