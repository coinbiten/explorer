const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const path = require('path');
const api = require("./routes/api");
const route = require("./routes/route");

const cors = require('cors');
app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));



app.use("/",route);
app.use("/api",api);

setInterval(()=>{
  try{
   require("./routes/blockscanner")
   blockScan()
  }catch(err){
   console.log("web3 error")
  }
 },20000)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

