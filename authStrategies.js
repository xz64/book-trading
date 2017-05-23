const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const logger = require('./logger');

passport.serializeUser((user, done) => {
  done(null, user._id.toString()); // eslint-disable-line no-underscore-dangle
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) {
      logger.error(err);
      done(err, null);
    } else {
      done(null, user);
    }
  });
});

const localStrategy = new LocalStrategy((username, password, done) => {
  User.authenticate(username, password)
  .then((user) => {
    done(null, user);
  })
  .catch((err) => {
    done(err, false);
  });
});

module.exports = [
  localStrategy,
];
