var data = require("./config/config")
var Web3 = require('web3');
//var web3Provider = new Web3.providers.HttpProvider(data.http_provider);
/*web3.setProvider(new Web3.providers.WebsocketProvider(data.ws_provider,{
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
    },
    reconnect: {
      auto: true,
      delay: 1000,
      maxAttempts: 5000000,
      onTimeout: false,
    }
  })); */
var web3Provider = new Web3.providers.WebsocketProvider(data.ws_provider,{
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
    },
    reconnect: {
      auto: true,
      delay: 1000,
      maxAttempts: 86400000,
      onTimeout: false,
    }
  }); 

  web3Provider.on('connect', () => console.log("connected to blockchain"));
  web3Provider.on('error', (err) => console.log(err.message));
  web3Provider.on('end', e => {
    console.log(e);
    console.log('WS closed');
  });




var web3 = new Web3(web3Provider);
module.exports = web3