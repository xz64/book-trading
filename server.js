const app = require('koa')();
const session = require('koa-session');
const passport = require('koa-passport');
const bodyParser = require('koa-bodyparser');
const csrf = require('koa-csrf');
const helmet = require('koa-helmet');
const logger = require('./logger');
const db = require('./db');
const config = require('./config');
const router = require('./routes');
const authStrategies = require('./authStrategies');

app.keys = [config.get('sessionSecretKey')];

app.use(helmet({
  noCache: true,
}));

app.use(session({
  maxAge: config.get('sessionDurationMs'),
}, app));

app.use(bodyParser());

authStrategies.forEach(passport.use.bind(passport));

app.use(passport.initialize());
app.use(passport.session());

app.use(router.routes());
app.use(router.allowedMethods());

csrf(app);

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
