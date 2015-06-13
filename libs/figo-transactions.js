var figo = require('figo');

function session() {
  var key = "ASHWLIkouP2O6_bgA2wWReRhletgWKHYjLqDaqb0LFfamim9RjexTo22ujRIP_cjLiRiSyQXyt2kM1eXU2XLFZQ0Hro15HikJQT_eNeT_9XQ";
  return new figo.Session(key);
}
var transactions = function (callback) {
  session().get_transactions(null, function (err, tts) {
    callback(tts);
  });
}

var accounts = function (callback) {
  session().get_accounts(function (err, acs) {
    callback(acs);
  });
}

module.exports = {
  getTransactions: transactions,
  getAccounts: accounts,
};

