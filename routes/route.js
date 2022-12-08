const express = require('express')
const router = express.Router();
var config = require("../config/config")

router.get('/', (request, response) => { 
  response.render("index.ejs", {title: config.networt_name+" | Explorer",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})
  
router.get('/blocks', (request, response) => { 
  response.render("blocks.ejs", {title: config.networt_name+" | All Blocks",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/txs', (request, response) => { 
  response.render("alltrx.ejs", {title: config.networt_name+" | All Transactions",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})

router.get('/txsPending', (request, response) => { 
  response.render("pendingtrx.ejs", {title: config.networt_name+" | Pending Transactions",name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})




module.exports=router    