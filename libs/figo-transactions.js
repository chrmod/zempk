var figo = require('figo');

var transactions = function (callback) {
  var session = new figo.Session("ASHWLIkouP2O6_bgA2wWReRhletgWKHYjLqDaqb0LFfamim9RjexTo22ujRIP_cjLiRiSyQXyt2kM1eXU2XLFZQ0Hro15HikJQT_eNeT_9XQ");
  session.get_transactions(null, function (err, tts) {
    callback(tts);
  });
}

module.exports = transactions;
