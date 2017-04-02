var express = require('express');
var router = express.Router();

/* POST a new analysis. */
router.post('/', function (req, res, next) {
  let analysis = Object.assign({}, req.body);
  analysis.created_at = (new Date()).toISOString();
  res.json({
    message: 'Analysis received',
    data: analysis
  })
});

module.exports = router;
