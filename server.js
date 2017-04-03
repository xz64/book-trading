const app = require('koa')();
const HttpStatus = require('http-status-codes');
const bodyParser = require('koa-bodyparser');
const logger = require('./logger');
const db = require('./db');
const config = require('./config');
const router = require('./routes');

app.use(bodyParser());

app.use(function* CSRFProtection(next) {
  if (this.request.header['x-requested-with'] !== 'XMLHttpRequest') {
    this.status = HttpStatus.BAD_REQUEST;
    this.body = { error: 'Missing/incorrect CSRF protection' };
    return;
  }
  yield next;
});

app.use(router.routes());
app.use(router.allowedMethods());

let server;

module.exports = {
  start() {
    db.initialize().then(() => {
      const port = config.get('port');
      server = app.listen(port);
      logger.info(`Server listening at port ${port}`);
    });
  },
  stop(callback) {
    if (server) {
      logger.info('shutting down server');
      server.close(() => {
        logger.info('server shut down');
        callback();
      });
    }
  },
};
