const log = require('../boot/logger');


module.exports = function (router) {
  /* GET home page. */
  return router.get('/', function (req, res, next) {
    log.trace('GET /');
    res.json({ message: 'health-nlp-node' })
  });
};
