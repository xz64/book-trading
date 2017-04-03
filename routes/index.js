const Router = require('koa-router');
const publicRouter = require('./public');

const router = new Router({
  prefix: '/api',
});

router.use('', publicRouter.routes(), publicRouter.allowedMethods());

module.exports = router;
