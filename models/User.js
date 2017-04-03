const mongoose = require('mongoose');
const co = require('co');
const argon2 = require('argon2');
const logger = require('../logger');

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
  name: String,
  city: String,
  state: String,
});

const ATTEMPTS_UNTIL_LOCK = 5;
const LOCK_DURATION_MINUTES = 60;

const LOGIN_ERRORS = {
  USER_LOCKED: `Due to too many incorrect passwords, your account will remain locked for up to ${LOCK_DURATION_MINUTES} minutes from now.`,
  USER_PASSWORD_INVALID: 'Username/password invalid',
};

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
    const lockExpired = user.lockExpiration.getTime() > Date.now();
    if (!lockExpired) {
      throw new Error(LOGIN_ERRORS.USER_LOCKED);
    }

    const match = yield argon2.verify(user.password, givenPassword);
    if (!match) {
      user.invalidAttempts += 1;

      if ((user.invalidAttempts % ATTEMPTS_UNTIL_LOCK) === 0) {
        user.lockExpiration = Date.now() + (LOCK_DURATION_MINUTES * 60 * 1000);
      }

      yield user.save();

      throw new Error(LOGIN_ERRORS.USER_PASSWORD_INVALID);
    } else { // correct password
      user.invalidAttempts = 0;
      user.lockExpiration = Date.now();
      yield user.save();

      return true;
    }
  });
};

userSchema.statics.authenticate = function authenticate(username, password) {
  const model = this;
  return co(function* authenticateGenerator() {
    const user = yield model.findOne({ username });
    if (!user) { // user doesn't exist
      throw new Error(LOGIN_ERRORS.USER_PASSWORD_INVALID);
    }

    return yield user.verifyPassword(password);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
