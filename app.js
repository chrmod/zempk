var express = require('express');
var exphbs  = require('express-handlebars');
var Handlebars = require('handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var figo = require('./routes/figo');

var app = express();


// view engine setup
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: {
    bar: function (t) {
      var css = t.amount > 0 ? 'green' : 'red';
      var amount = Math.round(t.amount);
      function calc(amount) {
        var minHeight = 30,
            maxHeight = 90;
        if(amount < minHeight) {
          return minHeight;
        } else if(amount > minHeight && amount < maxHeight) {
          return amount;
        } else {
          return maxHeight;
        }
      }
      var height = calc(amount);
      var str = [
        '<div class="transaction-box">',
        '<a href="#" class="'+css+'" style="height: '+height+'px">'+amount+'</a>',
        '</div>'
      ].join("");
      return new Handlebars.SafeString(str);
    }
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/figo', figo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
