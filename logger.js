const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp() {
        const date = new Date();
        return `${date.getTime()} ${date.toISOString()}`;
      },
      formatter(options) {
        return `${options.timestamp()} ${options.level} ${options.message}`;
      },
    }),
  ],
});

module.exports = logger;
