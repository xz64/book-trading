const Router = require('koa-router');
const HttpStatus = require('http-status-codes');
const publicRouter = require('./public');
const privateRouter = require('./private');

const router = new Router({
  prefix: '/api',
});

router.use(function* CSRFProtection(next) {
  if (this.request.header['x-requested-with'] !== 'XMLHttpRequest') {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'Missing/incorrect CSRF protection' };
    return;
  }
  yield next;
});

router.use('', publicRouter.routes(), publicRouter.allowedMethods());

router.use('', privateRouter.routes(), privateRouter.allowedMethods());

module.exports = router;
