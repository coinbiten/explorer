const express = require('express')
const router = express.Router();
const client = require("../rpcclient");
const web3 = require("../web3client")

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


module.exports=router    