var express = require('express');
var figo = require('../libs/figo-transactions');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  figo(function (tts) {
    res.send(JSON.stringify(tts));
  });
});

module.exports = router;

