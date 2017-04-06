const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  index = require('./routes/index'),
  analysis = require('./routes/analysis'),
  fivebeans = require('fivebeans'),
  app = express();

// Initialize the connection with beanstalkd
const beanstalkd = new fivebeans.client('localhost', 11300);

beanstalkd
  .on('connect', function () {
    beanstalkd.use('default', function (err, name) {
      console.log('Using beanstalkd.')
    })
  }).on('error', function (err) {
    console.log('An error occurred...');
  })
  .on('close', function () {
    console.log('...Closing the tube...');
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ message: 'An error occurred.' });
});

module.exports = app;
