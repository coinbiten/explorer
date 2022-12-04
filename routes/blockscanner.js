const db = require("../db")
const web3 = require("../web3client")
var blockcollection = db.collection("blocks")
var trxcollection = db.collection("transaction")
var blockscan = db.collection("blockscan")

web3ws =()=>{
    var subscription = web3.eth.subscribe('newBlockHeaders', function(error, result){
        if (!error && result !==null) {
            web3.eth.getBlock("latest",true)
            .then(block=>{
                if (block !== null) {
                    //console.log("latest",block)
                    var myobj = { number: block.number,block:block };
                    blockcollection.find( { number: block.number } ).toArray(function(err, result) {
                      if (err) throw err;
                      if(result.length==0){
                        blockcollection.insertOne(myobj, function(err, res) {
                          if (err) throw err;
                          console.log(block.number+" Latest Block Inserted");
                        });
                      }else{
                        console.log(block.number+" Latest Block Exits in Database")
                      }
                    })
                    if (block.transactions !== null && block.transactions.length !== 0) {
                      block.transactions.forEach(function (item, index) {
                        var data = {blockHash:item.blockHash,blockNumber:item.blockNumber,from:item.from,
                            gas:item.gas,gasPrice:item.gasPrice,timeStamp:block.timestamp,to:item.to,hash:item.hash,
                            value:item.value,input:item.input,nonce:item.nonce,transactionIndex:item.transactionIndex
                            }
                            var myobj2 = { hash: item.hash,number: block.number,data:data };
                            trxcollection.find( { hash: item.hash } ).toArray(function(err, result) {
                                if (err) throw err;
                                if(result.length==0){
                                    trxcollection.insertOne(myobj2, function(err, res) {
                                       if (err) throw err;
                                       console.log(item.hash+"Latest Trx Hash Inserted");
                                    });
                                }else{
                                    console.log(item.hash+" Latest Trx Hash Exits in Database")
                                }
                            })
                      });
                    }
                  }
            })
            .catch(err=>{
              console.log("block error ...")
            })
            console.log("subscribe",result.number);
        }
        //console.error(error);
    })
    subscription.unsubscribe(function(error, success){
        if (success) {
            console.log('Successfully unsubscribed!');
        }
    });
}

blockScan=async()=> {
    web3ws()
    var startblock
    await blockscan.find( { id: 1 } ).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result[0].endblock)
      if(result.length>0){
        startblock=result[0].endblock
      }else{
        startblock=0;
      }
    })
    latestBlock=await web3.eth.getBlockNumber()
        for (var i =startblock; i <= latestBlock; i++) {
          //let numblock = latestBlock-i
          await web3.eth.getBlock(i,true)
          .then(block=>{
            if (block !== null) {
              var myobj = { number: block.number,block:block };
              blockcollection.find( { number: block.number } ).toArray(function(err, result) {
                if (err) throw err;
                if(result.length==0){
                  blockcollection.insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log(block.number+" Block Inserted");
                    var myquery = { id: 1 };
                    var newvalues = { $set: {endblock: block.number } };
                    blockscan.updateOne(myquery, newvalues, function(err, res) {
                      if (err) throw err;
                      //console.log("Endblok updated");
                    });
                  });
                }else{
                  console.log(block.number+" Block Exits in Database")
                }
              })
              if (block.transactions !== null && block.transactions.length !== 0) {
                block.transactions.forEach(function (item, index) {
                  //console.log("item",item)
                  //console.log("index",item.hash)
                  var data = {blockHash:item.blockHash,blockNumber:item.blockNumber,from:item.from,
                      gas:item.gas,gasPrice:item.gasPrice,timeStamp:block.timestamp,to:item.to,hash:item.hash,
                      value:item.value,input:item.input,nonce:item.nonce,transactionIndex:item.transactionIndex,
  
                  }
                  var myobj2 = { hash: item.hash,number: block.number,data:data };
                      trxcollection.find( { hash: item.hash } ).toArray(function(err, result) {
                          if (err) throw err;
                          if(result.length==0){
                              trxcollection.insertOne(myobj2, function(err, res) {
                                 if (err) throw err;
                                 console.log(item+" Trx Hash Inserted");
                              });
                          }else{
                              console.log(item+" Trx Hash Exits in Database")
                          }
                      })
                });
              }
            }
          })
          .catch(err=>{
            console.log("block error ....")
          })
          
        }
    
  }

  var blockScaning = blockScan()
  module.exports=blockScaning