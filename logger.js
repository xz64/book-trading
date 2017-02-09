const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: function() {
        var date = new Date();
        return `${date.getTime()} ${date.toISOString()}`;
      },
      formatter: function(options) {
        return `${options.timestamp()} ${options.level} ${options.message}`;
      }
    })
  ]
});

module.exports = logger;
