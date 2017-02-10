const app = require('koa')();
const logger = require('./logger');
const db = require('./db');
const config = require('./config');

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
