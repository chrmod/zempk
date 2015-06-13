var figo = require('figo');

var transactions = function (callback) {
  var session = new figo.Session("ASHWLIkouP2O6_bgA2wWReRhletgWKHYjLqDaqb0LFfamim9RjexTo22ujRIP_cjLiRiSyQXyt2kM1eXU2XLFZQ0Hro15HikJQT_eNeT_9XQ");

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
              callback(transactions)
            }
          });
        }
      });
    }
  });
}

module.exports = transactions;
