const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const api = require("./routes/api");
const route = require("./routes/route");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/",route);
app.use("/api",api);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})