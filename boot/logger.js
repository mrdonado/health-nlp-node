/**
 * logger.js 
 * 
 * It initializes the logger for the app.
 * 
 */
const log4js = require('log4js'), /* From https://www.npmjs.com/package/log4js */
    config = require('./configuration');


// Don't log to a file while unit testing
if (process.env.NODE_ENV !== 'test') {
    // Only one log file will be used
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('logs/app.log'), 'app');
}

var logger = log4js.getLogger('app');
logger.setLevel(config.errorLevel);

/**
 * Use examples, from the documentation:
 * 
 *     logger.trace('Entering cheese testing');
 *     logger.debug('Got cheese.');
 *     logger.info('Cheese is Gouda.');
 *     logger.warn('Cheese is quite smelly.');
 *     logger.error('Cheese is too ripe!');
 *     logger.fatal('Cheese was breeding ground for listeria.');
 * 
 */

module.exports = logger;
