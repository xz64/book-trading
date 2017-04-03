const convict = require('convict');

const conf = convict({
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 8080,
    env: 'PORT',
  },
  mongoURI: {
    doc: 'The mongodb URI',
    default: 'mongodb://localhost:27017/booktrading',
    env: 'MONGODB_URI',
  },
  logLevel: {
    doc: 'logging level',
    default: 'error',
    env: 'LOG_LEVEL',
  },
  recaptchaSecretKey: {
    doc: 'Secret key for recaptcha',
    default: 'UNSPECIFIED',
    env: 'RECAPTCHA_SECRET_KEY',
  },
});

conf.validate({ allowed: 'strict' });

module.exports = conf;
