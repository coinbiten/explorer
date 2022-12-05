const express = require('express')
const router = express.Router();


router.get('/', (request, response) => { 
  response.render("index.ejs", {title: 'MCash Cryptocurrency'});
})
  

module.exports=router    