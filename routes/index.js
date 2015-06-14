var express = require('express');
var router = express.Router();
var figo = require('../libs/figo-transactions');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Hello World!',
  });
});

router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'Demo' });
});

module.exports = router;
