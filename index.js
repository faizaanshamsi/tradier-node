// var http = require("http");
// 'use strict';
// require('locus');
var https = require('https');
var io = require('socket.io').listen(3000);

var token = process.env.TOKEN

var options = {
  hostname: 'sandbox.tradier.com',
  path: '/v1/markets/options/chains?symbol=msft&expiration=2014-11-14',
  method: 'GET',
  headers: {'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
  }
};


setInterval(function() {
  var buffer = "",
      data;

  var req = https.request(options, function(res){
      console.log("Connected");
      res.on('data',function(chunk){
          buffer += chunk;
      });

      res.on('end', function(err) {
        data = JSON.parse(buffer);
        console.log(data);
        io.emit('option-chain-received', data);
      });
  });

  req.on('error',function(err){
      console.log(err);
  });


  req.end();
}, 5000);
