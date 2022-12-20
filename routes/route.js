const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
var config = require("../config/config")

router.get('/', (request, response) => { 
  response.render("index.ejs", {title: config.networt_name+" | Explorer",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name,rpc:config.http_provider,ws:config.ws_provider,networtid:config.networkid,baseBlockReward:config.baseBlockReward});
})
  
router.get('/blocks', (request, response) => { 
  response.render("blocks.ejs", {title: config.networt_name+"  All Blocks",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name,baseBlockReward:config.baseBlockReward});
})

router.get('/txs', (request, response) => { 
  response.render("alltrx.ejs", {title: config.networt_name+"  All Transactions",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/txsPending', (request, response) => { 
  response.render("pendingtrx.ejs", {title: config.networt_name+"  Pending Transactions",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/block/:id', (request, response) => { 
  var id = request.params.id
  response.render("blockview.ejs", {title: config.networt_name+"  Blocks #"+id ,block:id,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name,baseBlockReward:config.baseBlockReward});
})

router.get('/tx/:hash', (request, response) => { 
  var hash = request.params.hash
  response.render("trx.ejs", {title: config.networt_name+" Transaction Hash (TxHash) " ,hash:hash,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})


router.get('/address/:address', (request, response) => { 
  var address = request.params.address
  response.render("address.ejs", {title: config.networt_name+" Address "+address ,address:address,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/rpc', (request, response) => { 
  response.render("rpc.ejs", {title: config.networt_name+" RPC Info ",config:config,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/api-docs', (request, response) => { 
  response.render("api-docs.ejs", {title: config.networt_name+" API Docs Info ",config:config,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

/*
router.get('*', function(req, res){
  res.render("error.ejs", {title: config.networt_name+" 404 page not found" ,name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
});
*/


module.exports=router    