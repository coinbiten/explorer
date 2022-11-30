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

async function checkTransactionCount() {
  transactions = [];
  allblock=[]
  latestBlock=await web3.eth.getBlockNumber()
  for (var i =0; i <= latestBlock; i++) {
    let numblock = latestBlock-i
    let block = await web3.eth.getBlock(numblock);
    if (block !== null) {
      console.log(block)
      allblock.push(block)
      if (block.transactions !== null && block.transactions.length !== 0) {
        block.transactions.forEach(function (item, index) {
          web3.eth.getTransaction(item)
          .then(tx=>{
            //console.log(tx)
            transactions = transactions.push(tx);
          })
          .catch(errr=>{
            console.log("....")
          })
        });
      }
    }
  }
  console.log([transactions,allblock])
  return [transactions,allblock];
}
router.get('/test', (req, res) => {
      web3.eth.getBlockNumber().then((result) => {
          console.log("Latest Ethereum Block is ",result);
        });
  
      web3.eth.getBalance(req.query.address).then(bal => {
          //console.log(bal)
      });

      let transactions = checkTransactionCount()
      .then(ress=>{
        console.log(ress)
      })

      //web3.eth.getChainId().then(console.log);
      //web3.eth.getBlock(0).then(console.log);
      //web3.eth.getBlock("latest").then(console.log);
      
      console.log("Block Hash")
      //web3.eth.getBlock("0xcbcd60dac0bbfd3afd1ac0748ca50614eb5df2bbfb554c06bc7c65ab3433ce74").then(console.log);
      //web3.eth.getTransaction("0xcbcd60dac0bbfd3afd1ac0748ca50614eb5df2bbfb554c06bc7c65ab3433ce74").then(console.log);

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