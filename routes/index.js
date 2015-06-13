var express = require('express');
var router = express.Router();
var figo = require('../libs/figo-transactions');

/* GET home page. */
router.get('/', function(req, res, next) {
  figo.getTransactions(function (transactions) {
    res.render('index', {
      title: 'Hello World!',
      transactions: transactions,
    });
  });
});

router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'Demo' });
});

module.exports = router;
