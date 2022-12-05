const express = require('express')
const router = express.Router();


router.get('/', (request, response) => { 
  response.render("index.ejs", {title: 'Biten Coin Explorer'});
})
  

module.exports=router    