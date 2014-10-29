// var http = require("http");
'use strict';
require('locus');
var https = require('https');
var io = require('socket.io').listen(3000);

var token = process.env.TOKEN

var options = {
  hostname: 'sandbox.tradier.com',
  path: '/v1/markets/options/chains?symbol=vxx&expiration=2014-11-14',
  method: 'GET',
  headers: {'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
  }
};

var allData = new Array();
var filteredData = new Array();
var triggers = new Array();
var underlyingPrice = 31.02
var lowPct = 0.05
var highPct = 0.15

// // 44 - 39 put side
// // 48 - 53 call side
// function significantMovement(optionChain, currentPrice, lowPct, HighPct) {
//   for(i = 0; i < optionChain.length; i++) {
//     if( optionChain[i] ){
//
//     }
//   }
// }
//
// var filterData = function (optionArray, callLowBound, callHighBound, putHighBound, putLowBound) {
//   console.log('Beginning to filter single option chain');
//
// }

var filterAll = function (allData, currentPrice, lowPct, HighPct) {
  console.log('Beginning to filter all data');
  var callLowBound = currentPrice * (1 + lowPct);
  var callHighBound = currentPrice * (1 + highPct);
  var putHighBound = currentPrice * (1 - lowPct);
  var putLowBound = currentPrice * (1 - highPct);
  console.log(callLowBound);
  var filteredArray;
  allData.forEach(function(optionArray) {
    filteredArray = optionArray.filter(function(option) {
      console.log('Filter single option chain');
      return (option.strike >= putLowBound && option.strike <= putHighBound && option.option_type === 'put') || (option.strike >= callLowBound && option.strike <= callHighBound && option.option_type === 'call')
    });
  });
  return filteredArray;
}

var insertMidpointAndTimestamp = function (optionsChain) {
  console.log('Method works');
  var options = optionsChain['options']['option'];
  console.log(options);
  options.forEach(function(singleOption){
    singleOption["midpoint"] = (singleOption['bid'] + singleOption['ask']) / 2.0;
    singleOption["timestamp"] = new Date().toString();
  });
  console.log(options[0]);
  console.log('6. Data emitted to client');
}

setInterval(function() {
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
        io.emit('option-chain-received', data);
        console.log('5. Data emitted to client');
        insertMidpointAndTimestamp(data);
        allData.push(data["options"]["option"]);
        console.log(allData);
        console.log('Response callback complete.')

        if (allData.length > 0) {
          console.log('Entered conditional Filtering Functions')
          filteredData.push(filterAll(allData, underlyingPrice, lowPct, highPct));
        }
        if (filteredData.length >= 2) {
          checkTriggers(filteredData);
        }
      });
  });

  req.on('error',function(err){
      console.log(err);
  });

  req.end();
}, 5000);
// Triggers:
// midpoint of any option moves up 50% or more
function midpoint50(newOption, oldOption) {
  if( (oldOption.midpoint * 1.5) <= newOption.midpoint) {
    return true;
  }
  else {
    return false;
  }
}

function checkTriggers(filteredData) {
  var arrLength = filteredData.length;
  var lastChain = filteredData[arrLength - 1];
  var penultimateChain = filteredData[arrLength -2];
  for(var i = 0; i < arrLength; i++) {
    eval(locus);
    if (midpoint50(lastChain[i], penultimateChain[i]) ) {
      var trigger = { 'option': lastChain[i],
                      'trigger': "50%+"
                    };
      triggers.push(trigger);
    }
  }
}
