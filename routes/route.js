const express = require('express')
const router = express.Router();
var config = require("../config/config")

router.get('/', (request, response) => { 
  response.render("index.ejs", {title: 'Biten Coin Explorer',name:config.coinName,symbol:config.symbol,networt_name:config.networt_name});
})
  

module.exports=router    