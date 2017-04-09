/**
 * Load the configuration from the environment, when available.
 * Set defaults otherwise.
 */
let configuration = {
    beanstalkd: {
        host: process.env.BEANSTALKD_HOST || 'localhost',
        port: process.env.BEANSTALKD_PORT || 11300
    },
    errorLevel: process.env.ERROR_LEVEL || 'trace'
};

module.exports = configuration;