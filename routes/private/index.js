const Router = require('koa-router');
const csrf = require('koa-csrf');
const HttpStatus = require('http-status-codes');

const userRoutes = require('./user');
const bookRoutes = require('./book');
const tradeRoutes = require('./trade');

const router = new Router();

router.use(function* AuthenticatedOnly(next) {
  if (!this.isAuthenticated()) {
    this.status = HttpStatus.UNAUTHORIZED;
    this.body = {};
    return;
  }
  yield next;
});

router.use(csrf());

router.post('/logout', function* logout() { // eslint-disable-line require-yield
  this.logout();
  this.body = {};
});

router.use('', userRoutes.routes(), userRoutes.allowedMethods());

router.use('', bookRoutes.routes(), bookRoutes.allowedMethods());

router.use('', tradeRoutes.routes(), tradeRoutes.allowedMethods());

module.exports = router;
