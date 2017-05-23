const Router = require('koa-router');
const HttpStatus = require('http-status-codes');
const validator = require('is-my-json-valid');
const recaptchaValidator = require('recaptcha-validator');
const passport = require('koa-passport');

const User = require('../../models/User');
const conf = require('../../config');
const msgKeys = require('../../msgKeys');

const router = new Router();

const validateRegistration = validator({
  required: true,
  type: 'object',
  properties: {
    username: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 30,
    },
    city: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 30,
    },
    state: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 2,
    },
    password: {
      required: true,
      type: 'string',
      minLength: 15,
    },
    captchaResponse: {
      required: true,
      type: 'string',
    },
  },
});

const validateLogin = validator({
  required: true,
  type: 'object',
  properties: {
    username: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 30,
    },
    password: {
      required: true,
      type: 'string',
    },
  },
});

router.get('/csrfToken', function* getCsrfToken() { // eslint-disable-line require-yield
  const csrfToken = this.csrf;
  this.body = { csrfToken };
});

router.post('/login', function* login(next) {
  const params = this.request.body;
  const errorObj = { error: msgKeys.INVALID_USERNAME_PASSWORD };
  const ctx = this;

  this.assertCSRF();

  if (!validateLogin(params)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = errorObj;
    return;
  }

  yield passport.authenticate('local', function* handleAuth(err, user) {
    if (err) {
      ctx.status = HttpStatus.BAD_REQUEST;
      ctx.body = err;
    } else {
      yield ctx.login(user);
      const csrfToken = ctx.csrf;
      ctx.body = { csrfToken };
    }
  }).call(this, next);
});

router.post('/register', function* register() {
  if (!validateRegistration(this.request.body)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = validateRegistration.errors;
    return;
  }

  const params = this.request.body;

  try {
    yield recaptchaValidator.promise(conf.get('recaptchaSecretKey'), params.captchaResponse, true);
  } catch (e) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { errorKey: msgKeys.INVALID_CAPTCHA_RESPONSE };
    return;
  }

  params.username = params.username.toLowerCase();

  const existingUser = yield User.findOne({ username: params.username });

  if (existingUser) {
    this.status = HttpStatus.CONFLICT;
    this.body = { errorKey: msgKeys.USERNAME_ALREADY_IN_USE };
    return;
  }

  const user = new User({
    username: params.username,
    password: params.password,
    city: params.city,
    state: params.state,
  });

  yield user.save();

  this.body = {};
});

module.exports = router;
