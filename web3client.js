var data = require("./config/config")
var Web3 = require('web3');
var web3Provider = new Web3.providers.HttpProvider(data.http_provider);
var web3 = new Web3(web3Provider);
web3.setProvider(new Web3.providers.WebsocketProvider(data.ws_provider,{
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
    },
    reconnect: {
      auto: true,
      delay: 4000,
      onTimeout: true,
    }
  })); 

module.exports = web3