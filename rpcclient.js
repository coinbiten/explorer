var rpc = require('node-json-rpc');

var options = {
    port: 8085,
    host: 'http://84.46.247.245:8085',
    path: '/',
    strict: true
  };
  var client = new rpc.Client(options);

module.exports=client
