const express = require('express'),
  router = express.Router();

/**
 * An active connection to beanstalkd must be injected in order
 * to save the jobs in the jobs queue.
 * @param {Object} beanstalkd Active connection to beanstalkd, fivebeans based.
 */
module.exports = function (beanstalkd) {
  /* POST a new analysis. */
  router.post('/', function (req, res, next) {
    let analysis = Object.assign({}, req.body);
    analysis.created_at = (new Date()).toISOString();
    beanstalkd.put(0, 0, 60, JSON.stringify(analysis),
      function (err, jobid) {
        res.json({
          message: 'Job received',
          data: analysis
        })
      })
  });
  return router;
};
