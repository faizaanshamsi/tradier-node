'use strict';
require('locus');
var https = require('https');
var io = require('socket.io').listen(3000);

var token = process.env.TOKEN

function buildTradierOptionQuery (symbol, expiration) {
  var queryData = {
    hostname: 'sandbox.tradier.com',
    path: '/v1/markets/options/chains?symbol=' + symbol + '&expiration=' + expiration,
    method: 'GET',
    headers: {'Accept': 'application/json',
              'Authorization': 'Bearer ' + token
    }
  };
  return queryData;
}

function buildAllQueries(symbols) {
  var result = new Array();

  for(var i = 0; i < symbols.length; i++) {
    result.push(buildTradierOptionQuery(symbols[i][0], symbols[i][1]));
  }
  return result;
}

function queryOptionChain(options) {
  var buffer = "",
      data;

  var req = https.request(options, function(res){
      console.log("1. Connected");
      res.on('data',function(chunk){
          buffer += chunk;
          console.log('2. Concatenate chunk to buffer');
      });

      res.on('end', function(err) {
        console.log('3. Response ended, beginning callback');
        data = JSON.parse(buffer);
        console.log('4. Buffer parsed to JSON');
        allData.push(data);
      });
  });

  req.on('error',function(err){
      console.log(err);
  });

  req.end();
}

function performQueries(queries) {
  for(var i = 0; i < queries.length; i++) {
    queryOptionChain(queries[i]);
  }
}


var allData = new Array();
// var filteredData = new Array();
// var triggers = new Array();
// var underlyingPrice = 31.02
// var lowPct = 0.05
// var highPct = 0.15

var symbols = new Array(['vxx', '2014-11-14'],
                        ['msft', '2014-11-14'],
                        ['aapl', '2014-11-14']);

var queries = buildAllQueries(symbols);

performQueries(queries);
