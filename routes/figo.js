var express = require('express');
var figo = require('../libs/figo-transactions');

var router = express.Router();


function UserData(accounts, trans) {

  var currentDate = new Date();

  this.transactions = trans.map(function (t) {
    var date = new Date(t.booking_date);
    if(Number(date) > Number(currentDate)) return;
    return {
      date: date,
      amount: t.amount
    }
  }).filter(function(e){return e});

  this.income_by_year = this.transactions.reduce(function (prev, curr) {
    var year = curr.date.getFullYear();
    if(prev[year] === undefined) {
      prev[year] = 0
    }
    if(curr.amount > 0) {
      prev[year] += curr.amount;
    }
    return prev;
  }, {});

  this.expenses_by_year = this.transactions.reduce(function (prev, curr) {
    var year = curr.date.getFullYear();
    if(prev[year] === undefined) {
      prev[year] = 0
    }
    if(curr.amount < 0) {
      prev[year] -= curr.amount;
    }
    return prev;
  }, {});

  this.total_income = this.transactions.reduce(function (prev, curr) {
    var amount = curr.amount;
    if(amount > 0) {
      return prev + amount;
    } else {
      return prev;
    }
  }, 0);

  this.total_expenses = this.transactions.reduce(function (prev, curr) {
    var amount = curr.amount;
    if(amount < 0) {
      return prev - amount;
    } else {
      return prev;
    }
  }, 0);

  this.current_balance = accounts.map(function (account) {
    return account.balance.balance;
  }).reduce(function (prev, curr) {
    return prev + curr;
  }, 0);

  this.balance_on_end_of_year = {}
  this.balance_on_end_of_year[2015] = this.current_balance;
  this.balance_on_end_of_year[2014] = this.balance_on_end_of_year[2015] + this.expenses_by_year[2015] - this.income_by_year[2015];
  this.balance_on_end_of_year[2013] = this.balance_on_end_of_year[2014] + this.expenses_by_year[2014] - this.income_by_year[2014];
  this.balance_on_end_of_year[2012] = this.balance_on_end_of_year[2013] + this.expenses_by_year[2013] - this.income_by_year[2013];

  this.toString = function ( ) { return JSON.stringify(this) };
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  figo.getTransactions(function (trans) {
    figo.getAccounts(function (accounts) {
      var data = new UserData(accounts, trans);
      res.send(data);
    });
  });
});

module.exports = router;

