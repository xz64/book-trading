const Router = require('koa-router');

const router = new Router();

router.get('/user', function* userInfo() { // eslint-disable-line require-yield
  const { username, city, state } = this.passport.user;
  this.body = {
    username,
    city,
    state,
  };
});

module.exports = router;
