function setCrumbs(index) {
  var text = [
    "Rookie",
    "Hustler",
    "Mogul",
    "Kingpin"
  ];
  var $crumbs = $(".crumbs a");
  $crumbs.removeClass("active");
  for(var i = 1; i <= index; i++) {
    $('.crumbs a[data-index='+i+']').addClass("active");
  }
  var iconBar = $(".icons .crumbs a");
  iconBar.addClass('active');
  iconBar.text(text[index-1]);
}

function calculateTransactionHeight(amount) {
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

$(document).ready(function () {
  $(".crumbs a").click(function (el) {
    var index = $(this).data("index");
    setCrumbs(index);
  });

    fetchFigo();

    $("span[data-percent]").click(function() {
        if (!_yr) {
            return;
        }
        var $this = $(this);
        var percent = (+$this.attr("data-percent") / 100);
        var color = $this.attr("data-color");
        var legend = $this.attr("data-legend");
        var id = $this.attr("data-id");

        toggleSavings(id, percent, color, legend);


    });
});

var _data = null;
var _yr = 0, _cp = [], _future = [], _interest = 0.05;
var _lastTS = 0;
var _goal = 1000000, _goldenGoal = _goal * 0.62;
var _currentLegend = undefined, _currentMoneySaved = 0;
var _currentSavings = {};
var _chart = null;
var _mainChartMeta = null;
var _savingsChartMeta = null;

var fetchFigo = function () {

    $.ajax("/figo", {
        "success": function (data) {
            _data = data;
            var fakeMonthlyIncome = function (year, startMonth, endMonth, amount) {
                for (var month = startMonth; month <= endMonth; month++) {
                    var thisAmount = amount * Math.random() - 0.3;
                    _data.current_balance += amount;
                    if (month < 10) {
                        _data.transactions.push({"date":year + "-0" + month + "-01T00:00:00.000Z", "amount": amount});
                    } else {
                        _data.transactions.push({"date":year + "-" + month + "-01T00:00:00.000Z", "amount": amount});
                    }
                }
            }

            fakeMonthlyIncome(2012, 1, 12, 1300);
            fakeMonthlyIncome(2013, 1, 12, 200);
            fakeMonthlyIncome(2014, 1, 12, 1900);
            fakeMonthlyIncome(2015, 1, 5, 2000);
            crunchData();
            renderChart();
        }
    });
};

var addCustomTransaction = function(amount) {
    _data.current_balance += amount;
    _data.transactions.push({"date":Date.now(), "amount": amount});
    crunchData();
    renderChart(_currentMoneySaved, _currentLegend);
}

var projectFuture = function (year, yearlyIncome, lastTS, balance, _chartPoints) {
    var incompleteYear = true;
    var yearEnd = new Date(year, 11, 31, 23, 59, 59);
    var loopCounter = 0;
    var lastBalance = balance;
    var chartEndDate = null;
    while (balance < _goal && loopCounter < 100) {
        var roi = balance * _interest;
        var savings;
        lastBalance = balance;
        if (incompleteYear) {
            var daysLeft = (yearEnd.getTime() - lastTS) / 1000 /3600 / 24;
            savings = (yearlyIncome * daysLeft / 365)  + roi;
            incompleteYear = false;
        } else {
            savings = yearlyIncome + roi;
        }
        balance += savings;
        if (_chartPoints) {
            /* if (balance >= _goldenGoal && !_chartGoldenDate) {
                var goalPercent = 1 - (balance - _goldenGoal) / (balance - lastBalance);
                var goalTime = 365 * goalPercent;
                _chartGoldenDate = new Date(year, 0, 0, 0, 0, 0).getTime() + (goalPercent * 1000 * 24 * 3600 * 365);
            } */
            if (balance >= _goal) {
                var goalPercent = 1 - (balance - _goal) / (balance - lastBalance);
                var goalTime = 365 * goalPercent;
                chartEndDate = new Date(year, 0, 0, 0, 0, 0).getTime() + (goalPercent * 1000 * 24 * 3600 * 365);
                _chartPoints.push([
                    chartEndDate, _goal / 1000]);
            } else {
                _chartPoints.push([
                    new Date(year++, 11, 31, 23, 59, 59).getTime(), Math.round(balance / 10) / 100]);
            }
        }
        loopCounter++;
    }

    return {
        "balance": balance,
        "year": year,
        "endDate": chartEndDate
    };

}

var crunchData = function() {

    var balance = _data.current_balance;
    var firstDate = null, lastDate = null;

    _cp = [];
    for (var i in _data.transactions) {
        if (_data.transactions.hasOwnProperty(i)) {
            var d = _data.transactions[i];
            var date = new Date(d.date);
            _cp.push([date, d.amount]);
        }
    }


    _cp.sort(function (t1, t2) {
        return t1[0] - t2[0];
    });

    for (var i = _cp.length - 1; i >= 0; i--) {
        balance -= _cp[i][1];
        _cp[i][1] = Math.round(balance / 10) / 100;
        _cp[i][0] = _cp[i][0].getTime();
    }

    // Calculate the date range for the whole data set
    var firstTS = _cp[0][0];
    _lastTS  = _cp[_cp.length - 1][0];
    var firstBalance = _cp[0][1], lastBalance = _cp[_cp.length - 1][1];

    var duration = (_lastTS - firstTS) / (1000 * 3600 * 24 * 365);
    _yr = (lastBalance - firstBalance) /  duration * 1000;

    // Calculate net worth and other parameters for future projection
    _future = [];
    _future.push(_cp[_cp.length - 1]);

    var year = new Date(_lastTS).getFullYear();

    _mainChartMeta = projectFuture(year, _yr, _lastTS, _data.current_balance, _future);

};

var renderChart = function(moneySaved, legend, color) {
    _slower = [];
    if (moneySaved) {
        _current = {
            id: 'savings',
            "name": legend,
            data: _slower,
            lineWidth: 3,
            color: color
        };
        var year = new Date(_lastTS).getFullYear();
        _savingsChartMeta = projectFuture(year, _yr + moneySaved, _lastTS, _data.current_balance, _slower);

        if (Highcharts.charts.length) {
            var existingSeries = Highcharts.charts[0].get("savings");
            var xAxis = Highcharts.charts[0].xAxis[0];
            try {
                xAxis.removePlotBand("savings");
            } catch (e) { }

            xAxis.addPlotBand({
                "color": "#ffd472",
                id: "savings",
                from: _savingsChartMeta.endDate,
                to: _mainChartMeta.endDate
            });

            if (existingSeries) {
                existingSeries.update(_current, true, true);
                Highcharts.charts[0].redraw();
                return;
            } else {
                Highcharts.charts[0].addSeries(_current);
                Highcharts.charts[0].redraw();
                return;
            }
        }
    }

    try {
        xAxis.removePlotBand("savings");
    } catch (e) { }



    var settings = {
        title: {
            text: 'Your path to riches',
            style: { "color": "#333333", "fontSize": "22px" }
        },
        chart: {
            type: 'spline',
            spacingLeft: 0,
            spacingRight: 0
        },
        xAxis: {
            type: 'datetime',
            maxPadding: 0.02,
            plotLines: [
                {
                    color: '#FFC802',
                    id: "million",
                    width: 2,
                    value: _mainChartMeta.endDate,
                    label: {
                        /* text: '<a href="http://www.google.com">Million!</a>',
                        useHTML: true */
                        text: "Million!"
                    }
                }
            ]
        },
        yAxis: {
            title: {
                text: null
            },
            plotLines: [],
            maxPadding: 0.01
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%m.%Y}: {point.y:.2f} k€'
        },
        series: [{
                id: 'past',
                name: 'Past',
                data: _cp,
                lineWidth: 3,
                color: '#5EA3F9'
            }, {
                id: 'future',
                name: 'Future',
                lineWidth: 3,
                data: _future,
                color: '#56EAC6'
            }
        ]
    };

    if (moneySaved) {
        settings.series.push(_current);
    }

    _chart = $('#mainChart').highcharts(settings);
};


function toggleSavings(id, percent, color, legend) {
  if (_currentSavings[id]) {
      delete _currentSavings[id];
  } else {
      _currentSavings[id] = {
          "percent": percent,
          "color": color,
          "legend": legend
      };
  }

  var savings = null;

  for (var key in _currentSavings) {
      if (!savings) {
          savings = $.extend({}, _currentSavings[key]);
      } else {
          savings.color = "#92DBA4";
          savings.percent += _currentSavings[key].percent;
          savings.legend += ", " + _currentSavings[key].legend;
      }
  }

  var onAfter = function () {
    if (savings) {
        renderChart(savings.percent * _yr, savings.legend, savings.color);
    } else {
        renderChart();
    }
  };
  $.scrollTo("#mainChart", 700, {
    offset: -100,
    onAfter: onAfter
  })
}
