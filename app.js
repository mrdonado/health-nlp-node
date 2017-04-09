/**
 * app.js 
 * Initialize the express app.
 */
// First of all, the environment is loaded.
const dotenv = require('dotenv');
dotenv.load();

const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  index = require('./routes/index'),
  config = require('./boot/configuration'),
  analysis = require('./routes/analysis'),
  fivebeans = require('fivebeans'),
  log = require('./boot/logger'),
  app = express();

// Initialize the connection with beanstalkd
const beanstalkd = new fivebeans.client(config.beanstalkd.host, config.beanstalkd.port);

beanstalkd
  .on('connect', function () {
    beanstalkd.use('default', function (err, name) {
      log.info('Connected to beanstalkd: ' + config.beanstalkd.host + ':' + config.beanstalkd.port);
    })
  }).on('error', function (err) {
    log.error('Error while connecting to beanstalkd: ' + config.beanstalkd.host + ':' + config.beanstalkd.port + ' ' + err);
  })
  .on('close', function () {
    log.info('Connection to beanstalkd closed: ' + config.beanstalkd.host + ':' + config.beanstalkd.port);
  })
  .connect();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/analysis', analysis(beanstalkd));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  let returnError = process.env.NODE_ENV !== 'production';
  res.locals.error = returnError ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json(res.locals.error);
  log.error('An error occurred: ' + err.message);
});

module.exports = app;
