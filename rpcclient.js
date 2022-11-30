var rpc = require('node-json-rpc');
var data = require("./config/config")

var options = {
    port: 8085,
    host: data.ws_provider,
    path: '/',
    strict: true
  };
  var client = new rpc.Client(options);

module.exports=client
