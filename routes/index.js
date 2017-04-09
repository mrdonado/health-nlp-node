const express = require('express'),
  router = express.Router(),
  log = require('../boot/logger');

/* GET home page. */
router.get('/', function (req, res, next) {
  log.trace('GET /');
  res.json({ message: 'health-nlp-node' })
});

module.exports = router;
