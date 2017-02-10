const server = require('./server');
const logger = require('./logger');

server.start();

function shutdown() {
  server.stop(() => {
    logger.info('exiting process');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
