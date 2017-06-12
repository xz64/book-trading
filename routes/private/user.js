const Router = require('koa-router');
const validator = require('is-my-json-valid');
const HttpStatus = require('http-status-codes');

const UserProfileValidationFields = require('../../validators/user').userProfile;

const router = new Router();

const validateProfile = validator({
  required: true,
  type: 'object',
  properties: UserProfileValidationFields,
});

router.get('/user', function* userInfo() { // eslint-disable-line require-yield
  const { username, fullname, city, state } = this.passport.user;
  this.body = {
    username,
    fullname,
    city,
    state,
  };
});

router.put('/profile', function* updateProfile() { // eslint-disable-line require-yield
  const params = this.request.body;

  if (!validateProfile(params)) {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = validateProfile.errors;
    return;
  }

  const currentUser = this.passport.user;

  currentUser.fullname = params.fullname;
  currentUser.city = params.city;
  currentUser.state = params.state;

  yield currentUser.save();

  this.body = {};
});

module.exports = router;
