var MongoClient = require('mongodb').MongoClient;
var data = require("./config/config")
var url = "mongodb://localhost:27017/"+data.dbname;

const client = new MongoClient(url);
const db = client.db(data.dbname);

  db.createCollection("blocks", function (err, res) {
    if (err) {
        if (err.codeName =="NamespaceExists") {
            console.log("Already Exists Blocks Collection ");
            return;
        }
    }
    console.log("Blocks Collection created! : ");
  });

  db.createCollection("transaction", function (err, res) {
    if (err) {
        if (err.codeName =="NamespaceExists") {
            console.log("Already Exists Transaction Collection ");
            return;
        }
    }
    console.log("Transaction Collection created! : ");
   });

   db.createCollection("blockscan", function (err, res) {
    if (err) {
        if (err.codeName =="NamespaceExists") {
            console.log("BlockScan Exists  Collection ");
            return;
        }
    }
    console.log("BlockScan Collection created! : ");
   });
   var myobj = { id:1,startblock: 0,endblock:0 };
   var blockscan = db.collection("blockscan")
   blockscan.find( { id: 1 } ).toArray(function(err, result) {
     if (err) throw err;
     if(result.length==0){
         blockscan.insertOne(myobj, function(err, res) {
         if (err) throw err;
         console.log("Blockscan ID created");
       });
     }else{
       console.log("Blockscan ID Exits in Database")
     }
   })

/*
MongoClient.connect(url, (err, client)=>{
  if (err) throw err;
  console.log("Database created!");
  db=client.db(dbname)

  db.createCollection("blocks", function (err, res) {
    if (err) {
        if (err.codeName =="NamespaceExists") {
            console.log("Already Exists Blocks Collection ");
            return;
        }
    }
    console.log("Blocks Collection created! : ");
  });

  db.createCollection("transaction", function (err, res) {
    if (err) {
        if (err.codeName =="NamespaceExists") {
            console.log("Already Exists Transaction Collection ");
            return;
        }
    }
    console.log("Transaction Collection created! : ");
   });

   console.log(db.collection)
});
*/

module.exports=db