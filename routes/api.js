const express = require('express')
const router = express.Router();
const client = require("../rpcclient");
const web3 = require("../web3client")
const account = require("../module/account")
const block = require("../module/block")
const contract = require("../module/contract")
const logs = require("../module/logs")
const stats = require("../module/stats")
const token = require("../module/token")
const transaction = require("../module/transaction")
const AbiContract = require("../module/AbiContract")
const db = require("../db")
var blockcollection = db.collection("blocks")
var trxcollection = db.collection("transaction")
var blockscan = db.collection("blockscan")
require("./blockscanner")

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


    router.get("/",(req,res)=>{
      //Account
      var module = req.query.module
      var action = req.query.action
      var address = req.query.address
      var txhash = req.query.txhash
      var contractaddress = req.query.contractaddress
      //Logs
      var fromBlock = req.query.fromBlock
      var toBlock = req.query.toBlock
      var topic0 = req.query.topic0
      //Logsend
   
      //Stats
      var date = req.query.date
      //Block
      var blockno = req.query.blockno
      var closest = req.query.closest
      //Contract //Transaction
      var addressHash = req.query.addressHash
      var name = req.query.name
      var compilerVersion = req.query.compilerVersion
      var optimization = req.query.optimization
      var contractSourceCode = req.query.contractSourceCode
      var codeformat = req.query.codeformat
      var contractname = req.query.contractname
      var compilerversion = req.query.compilerversion
      var sourceCode = req.query.sourceCode
      var guid = req.query.guid
      
      res.json({module,action,address,txhash,contractaddress,
        fromBlock,topic0,date,blockno,closest,addressHash,
        name,compilerVersion,optimization,contractSourceCode,toBlock,codeformat,
        contractname,compilerversion,sourceCode,guid,txhash
      })
    })


module.exports=router    