/**
 * Load the configuration from the environment, when available.
 * Set defaults otherwise.
 */
let configuration = {
    beanstalkd: {
        host: process.env.BEANSTALKD_HOST || 'localhost',
        port: process.env.BEANSTALKD_PORT || 11300
    },
    cors: {
        allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200'
    },
    twitter: {
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        accessTokenKey: process.env.ACCESS_TOKEN_KEY,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
    },
    errorLevel: process.env.ERROR_LEVEL || 'trace'
};

module.exports = configuration;