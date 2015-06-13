var express = require('express');
var figo = require('figo');

var router = express.Router();
var session = new figo.Session("ASHWLIkouP2O6_bgA2wWReRhletgWKHYjLqDaqb0LFfamim9RjexTo22ujRIP_cjLiRiSyQXyt2kM1eXU2XLFZQ0Hro15HikJQT_eNeT_9XQ");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  session.get_accounts(function(error, accounts) {
    if (!error) {
      accounts.forEach(function(account) {
          console.log(account.account_number);
          console.log(account.balance.balance);
      })

      // Print out the list of all transaction originators/recipients of a specific account.
      session.get_account("A1.1", function(error, account) {
        if (!error) {
          account.get_transactions(null, function(error, transactions) {
            if (!error) {
              res.send(JSON.stringify(transactions));
            }
          });
        }
      });
    }
  });
});

module.exports = router;

