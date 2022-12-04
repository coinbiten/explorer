const express = require('express')
const router = express.Router();
const client = require("../rpcclient");
const web3 = require("../web3client")
const db = require("../db")
var blockcollection = db.collection("blocks")
var trxcollection = db.collection("transaction")
var blockscan = db.collection("blockscan")
require("./blockscanner")

router.get("/blocks",(req,res)=>{
  var limits = 100
  var sorts = -1
  if(req.query.limit!=="" && req.query.limit!==undefined){
    limits=parseInt(req.query.limit)
  }
  if(req.query.sort!=="" && req.query.sort!==undefined){
    if(req.query.sort=="desc"){
      sorts=-1
    }
    if(req.query.sort=="asc"){
      sorts=1
    }
  }
  var blocks=[]
  blockcollection.find( { } ).sort({number:sorts}).limit(limits).toArray(function(err, result) {
    if (err){
      res.json([])
    }else{
      result.forEach(function (item, index) {
        blocks.push(item.block)
      })
      res.json(blocks)
    }
  })
  
})

router.get("/block/:id",(req,res)=>{
  web3.eth.getBlock(req.params.id,true)
  .then(rs=>{
    if (rs !== null){
      res.json([rs])
    }else{
      res.json([])
    } 
  })
  .catch(err=>{
    res.json([])
  })
})

router.get("/block-count",(req,res)=>{
  web3.eth.getBlockNumber()
  .then(rs=>{
    if (rs !== null){
      res.json({number:rs})
    }else{
      res.json([])
    } 
  })
  .catch(err=>{
    res.json([])
  })
})

router.get("/latest-block",(req,res)=>{
  web3.eth.getBlock("latest",true)
  .then(rs=>{
    if (rs !== null){
      res.json([rs])
    }else{
      res.json([])
    } 
  })
  .catch(err=>{
    res.json([])
  })
})

router.get("/trxs",(req,res)=>{
  var limits = 100
  var sorts = -1
  if(req.query.limit!=="" && req.query.limit!==undefined){
    limits=parseInt(req.query.limit)
  }
  if(req.query.sort!=="" && req.query.sort!==undefined){
    if(req.query.sort=="desc"){
      sorts=-1
    }
    if(req.query.sort=="asc"){
      sorts=1
    }
  }
  var trx=[]
  trxcollection.find( { } ).sort({number:sorts}).limit(limits).toArray(function(err, result) {
    if (err){
      res.json([])
    }else{
      result.forEach(function (item, index) {
        trx.push(item.data)
      })
      res.json(trx)
    }
  })
  
})

router.get("/trx/:hash",(req,res)=>{
  web3.eth.getTransaction(req.params.hash)
      .then(rs=>{
        res.json([rs])
      })
      .catch(err=>{
        res.json([])
      })
})

router.get("/account/:address",(req,res)=>{
      web3.eth.getBalance(req.params.address)
      .then(rs=>{
        res.json({
          status : "Ok",
          balance :rs/1000000000000000000,
          decimalBalance : rs
        });
      })
      .catch(err=>{
        res.json({
          status : "Failed",
          balance :"",
          decimalBalance : ""
        });
      })
})

router.get("/account/trx/:address",(req,res)=>{
  var trx=[]
  var address = req.params.address;
  trxcollection.find({"$or":[{"data.from": address}, {"data.to": address}]}).sort({number:-1}).toArray(function(err, result) {
    if (err){
      res.json([])
    }else{
      result.forEach(function (item, index) {
        if(item.data.from==address || item.data.to==address){
          trx.push(item.data)
        }
      })
      res.json(trx)
    }
  })
})

router.get('/test', (req, res) => {
      web3.eth.getBlockNumber().then((result) => {
          console.log("Latest Ethereum Block is ",result);
        });
  
      web3.eth.getBalance(req.query.address).then(bal => {
          //console.log(bal)
      });


      /*
      .then(ress=>{
        console.log(ress)
      })*/

      //web3.eth.getChainId().then(console.log);
      //web3.eth.getBlock(34625).then(console.log);
      //web3.eth.getBlock("latest").then(console.log);
      
      console.log("Block Hash")
      //web3.eth.getBlock("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984").then(console.log);
      /*web3.eth.getTransactionReceipt("0x3370778ff6dc3dbd79b562e3e82b1715482bb9f531a7a376bb96a604c6ea3cad")
      .then(rs=>{
        console.log(rs)
        //console.log(rs.logs)
        
      });
      web3.eth.getTransactionReceipt("0x383020f1ffbc26c623a11d76331c1a7e9ae0884a131a2ed66be02ff5824876df").then(console.log);
      web3.eth.getTransaction("0x335c253898d30011db651890ff16ea8553f70711fe54ef51fcc6d93a9fe05910")
      .then(rs=>{
        console.log(rs)
        //console.log(rs.logs)
      });*/
      web3.eth.getBlock(162,true).then(console.log);
      //web3.eth.getTransaction("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984").then(console.log);
     // web3.eth.getTransactionReceipt("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984").then(console.log);
      //console.log(web3.eth);
      var blocks=[]
      web3.eth.getBlockNumber().then((result) => {
        for (var i=0; i < 100; i++) {//100 or result
          web3.eth.getBlock(result -i)
          .then(rs=>{
            //console.log(rs)
            blocks.push(rs)
          })
          .catch(err=>{
            console.log("...")
          })
        }
    
      });
      
      setTimeout(()=>{
        blocks.sort((a, b)=>{return a.number - b.number});
        //console.log(blocks)
      },10000)


      res.json([
          {
              name:req.query.name,
              age:req.query.age
          }
      ])
    })



module.exports=router    