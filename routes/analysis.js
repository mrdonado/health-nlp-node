const log = require('../boot/logger');

/**
 * An active connection to beanstalkd must be injected in order
 * to save the jobs in the jobs queue.
 * @param {Object} beanstalkd Active connection to beanstalkd, fivebeans based.
 */
module.exports = function (beanstalkd, router) {
  /* POST a new analysis. */
  router.post('/', function (req, res, next) {
    log.debug('POST to /analysis');
    let job = Object.assign({}, req.body);
    log.info('Job: ' + JSON.stringify(job));
    job.created_at = (new Date()).toISOString();
    beanstalkd.put(0, 0, 60, JSON.stringify(job),
      function (err, jobid) {
        res.json({
          message: 'Job received',
          data: job
        });
        log.trace('Job inserted into the beanstalkd queue.');
      });
  });
  return router;
};
