var express = require('express');
var router = express.Router();
var figo = require('../libs/figo-transactions');

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  figo.getTransactions(function (tts) {
    tts = shuffle(tts).slice(tts.length - 15, tts.length);
    res.render('index', {
      title: 'Hello World!',
      transactions: tts
    });
  });
});

router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'Demo' });
});

module.exports = router;
