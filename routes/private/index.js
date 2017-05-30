const Router = require('koa-router');
const csrf = require('koa-csrf');
const HttpStatus = require('http-status-codes');

const userRoutes = require('./user');

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

router.use('', userRoutes.routes(), userRoutes.allowedMethods());

module.exports = router;
