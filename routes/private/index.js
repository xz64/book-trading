const Router = require('koa-router');
const csrf = require('koa-csrf');
const HttpStatus = require('http-status-codes');

const router = new Router();

router.use(function* AuthenticatedOnly(next) {
  if (!this.isAuthenticated()) {
    this.status = HttpStatus.NOT_AUTHORIZED;
    this.body = {};
    return;
  }
  yield next;
});

router.use(csrf());

module.exports = router;
