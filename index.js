// var http = require("http");
var https = require('https');

var token = process.env.TOKEN

var options = {
  hostname: 'sandbox.tradier.com',
  path: '/v1/markets/options/chains?symbol=msft&expiration=2014-11-14',
  method: 'GET',
  headers: {'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
  }
};

console.log("Start");
var x = https.request(options, function(res){
    console.log("Connected");
    res.on('data',function(data){
        // data comes back as node buffer, can be converted to string or JSON
        // console.log(JSON.stringify(data));
        console.log(data.toString('utf-8'));
    });
});

x.on('error',function(err){
    console.log(err);
});

x.end();
