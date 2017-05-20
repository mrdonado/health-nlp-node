module.exports = function (router, log) {
  /* GET home page. */
  return router.get('/', function (req, res, next) {
    log.trace('GET /');
    res.json({ message: 'health-nlp-node' })
  });
};
