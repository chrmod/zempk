var express = require('express');
var figoTransactions = require('../libs/figo-transactions');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  figoTransactions(function (transactions) {
    res.send(JSON.stringify(transactions));
  });
});

module.exports = router;

