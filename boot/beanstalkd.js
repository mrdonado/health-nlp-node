const onConnect = (beanstalkd, config, log) => {
  return function () {
    beanstalkd.use('default', function (err, name) {
      log.info('Connected to beanstalkd: ' + config.beanstalkd.host + ':' + config.beanstalkd.port);
    });
  };
};

const onError = (config, log) => {
  return function (err) {
    log.error('Error while connecting to beanstalkd: ' + config.beanstalkd.host + ':' + config.beanstalkd.port + ' ' + err);
  }
};

const onClose = (config, log) => {
  return function () {
    log.info('Connection to beanstalkd closed: ' + config.beanstalkd.host + ':' + config.beanstalkd.port);
  };
};

const init = function (fivebeans, config, log) {
  const beanstalkd = new fivebeans
    .client(config.beanstalkd.host,
    config.beanstalkd.port);

  beanstalkd
    .on('connect', onConnect(beanstalkd, config, log))
    .on('error', onError(config, log))
    .on('close', onClose(config, log))
    .connect();

  return beanstalkd;
};
module.exports = { init }