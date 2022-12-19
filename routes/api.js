const express = require('express')
const router = express.Router();
const web3 = require("../web3client")
const axios = require('axios');
const db = require("../db")
var config = require("../config/config")
var blockcollection = db.collection("blocks")
var trxcollection = db.collection("transaction")
var blockscan = db.collection("blockscan")
var pricecollect = db.collection("price")
require("./blockscanner")
const abi = require('web3-eth-abi')
const moment = require("moment")
blockScan()
  .then(res => {
    //console.log(res)
  })
  .catch(err => {
    console.log(err)
  })

  function getBlockFn(number){
    web3.eth.getBlock(number)
    .then(rs => {
      return rs
    })
    .catch(err => {
      return []
    })
  }

router.get("/priceupdate", (req, res) => {
  fetch(new Request(config.livecoinwatchapi), {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      "x-api-key": config.x_api_key,
    }),
    body: JSON.stringify({
      currency: "USD",
      code: config.currency_code,
      meta: true,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      var hour = (parseFloat(data.delta.hour - 1) * 100).toFixed(2)
      var day = (parseFloat(data.delta.day - 1) * 100).toFixed(2)
      var priceval = parseFloat(data.rate).toFixed(data.rate > 1 ? 2 : 8)
      var myquery = { id: 1 };
      var newvalues = { $set: { price: priceval, change24: day, change1h: hour } };
      pricecollect.updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("Price Updated");
      });
      res.json({ "status": "success", name: config.coinName, symbol: config.symbol, data: newvalues.$set, csupply: config.csupply, supply: config.supply })
    })
    .catch(err => {
      res.json({ "status": "Failed" })
    })

})

router.get("/getgasprice", (req, res) => {
  var price = 0;
  var change24 = 0
  var change1h = 0;
  pricecollect.find({ id: 1 }).toArray(function (err, result) {
    if (err) {
      price = 0;
    } else {
      price = result[0].price;
      change24 = result[0].change24;
      change1h = result[0].change1h;
      //res.json(result[0].change24)
    }
  })
  web3.eth.getGasPrice(function (e, r) {
    res.json({
      gwei: r / 1000000000, gweidecimal: r, eth: r * 21000 / 1000000000000000000,
      price: price, change1h: change1h, change24: change24, supply: config.supply, csupply: config.csupply,
      name: config.name, symbol: config.symbol
    })
  })
})
router.get("/blocks", (req, res) => {
  blockScan()
  var limits = 50
  var sorts = -1
  var page = 1;
  if (req.query.limit !== "" && req.query.limit !== undefined) {
    limits = parseInt(req.query.limit)
  }

  if (req.query.sort !== "" && req.query.sort !== undefined) {
    if (req.query.sort == "desc") {
      sorts = -1
    }
    if (req.query.sort == "asc") {
      sorts = 1
    }
  }
  if (req.query.page !== "" && req.query.page !== undefined) {
    page = parseInt(req.query.page) * limits
  }
  var blocks = []
  blockcollection.find().sort({ number: sorts }).skip(page).limit(limits)
    .toArray(function (err, result) {
      if (err) {
        res.json([])
      } else {
        result.forEach(function (item, index) {
          blocks.push(item.block)
        })
        let data = new Map();
        for (let obj of blocks) {
          data.set(obj.number, obj);
        }
        let out = [...data.values()];
        res.json(out)
      }
    })

})

router.get("/block/:id", (req, res) => {
  web3.eth.getBlock(req.params.id, true)
    .then(rs => {
      if (rs !== null) {
        res.json([rs])
      } else {
        res.json([])
      }
    })
    .catch(err => {
      res.json([])
    })
})

router.get("/block-count", (req, res) => {
  web3.eth.getBlockNumber()
    .then(rs => {
      if (rs !== null) {
        res.json({ number: rs })
      } else {
        res.json([])
      }
    })
    .catch(err => {
      res.json([])
    })
})

router.get("/latest-block", (req, res) => {
  web3.eth.getBlock("latest", true)
    .then(rs => {
      if (rs !== null) {
        res.json([rs])
      } else {
        res.json([])
      }
    })
    .catch(err => {
      res.json([])
    })
})

router.get("/trxs", (req, res) => {
  var limits = 100
  var sorts = -1
  var page = 0;
  if (req.query.limit !== "" && req.query.limit !== undefined) {
    limits = parseInt(req.query.limit)
  }
  if (req.query.sort !== "" && req.query.sort !== undefined) {
    if (req.query.sort == "desc") {
      sorts = -1
    }
    if (req.query.sort == "asc") {
      sorts = 1
    }
  }
  if (req.query.page !== "" && req.query.page !== undefined) {
    page = parseInt(req.query.page) * limits
  }
  var trx = []
  trxcollection.find().sort({ number: sorts }).skip(page).limit(limits).toArray(function (err, result) {
    if (err) {
      res.json([])
    } else {
      result.forEach(function (item, index) {
        trx.push(item.data)
      })
      let data = new Map();
      for (let obj of trx) {
        data.set(obj.blockNumber, obj);
      }
      let out = [...data.values()];
      res.json(out)
    }
  })

})

router.get("/trx-count", (req, res) => {
  trxcollection.count(function (error, result) {
    if (error) {
      res.json({ trx: 0, status: "Failed" })
    } else {
      res.json({ trx: result, status: "Query Success" })
    }
  })

})

router.get("/pending-trx", (req, res) => {
  web3.eth.getPendingTransactions()
    .then(ress => {
      res.json(ress)
    })
    .catch(err => {
      res.json([])
    })

})

router.get("/trx-chart", (req, res) => {
  var dateprev = new Date();
  dateprev.setDate(dateprev.getDate() - 24);
  var fromdate = moment(dateprev).format("YYYY-MM-DD");
  var currentdate = new Date();
  currentdate.setDate(currentdate.getDate() + 1);
  var todate = moment(currentdate).format("YYYY-MM-DD");
  var data = [];
  trxcollection.find({
    timestamp: {
      $gt: fromdate,
      $lt: todate
    }
  }).toArray(function (err, result) {
    result.map(ress => {
      const found = data.some(el => el.time === ress.timestamp);
      if (!found) {
        data.push({ time: ress.timestamp, value: 1 })
      } else {
        objIndex = data.findIndex((obj => obj.time == ress.timestamp));
        data[objIndex].value += 1
      }
    })
    res.json(data)
  })

})

router.get("/trx/:hash", (req, res) => {
  web3.eth.getTransaction(req.params.hash)
    .then(item => {
      var gasfees = (item.gas * parseFloat(item.gasPrice)) / 1000000000000000000;
      var data = {
        blockHash: item.blockHash, blockNumber: item.blockNumber, from: item.from,
        gas: item.gas, gasPrice: item.gasPrice, to: item.to, hash: item.hash,
        value: item.value, input: item.input, nonce: item.nonce, transactionIndex: item.transactionIndex,
        gwei: parseFloat(item.gasPrice) / 1000000000, gasFee: gasfees
      }
      res.json([data])
    })
    .catch(err => {
      res.json([])
    })
})

router.get("/account/:address", (req, res) => {
  web3.eth.getBalance(req.params.address)
    .then(rs => {
      res.json({
        status: "Success",
        balance: rs / 1000000000000000000,
        decimalBalance: rs
      });
    })
    .catch(err => {
      res.json({
        status: "Failed",
        balance: "",
        decimalBalance: ""
      });
    })
})

router.get("/account/trx/:address", (req, res) => {
  var trx = []
  var address = req.params.address;
  var bal = 0
  trxcollection.find({ "$or": [{ "data.from": address }, { "data.to": address }] }).sort({ number: -1 }).toArray(function (err, result) {
    if (err) {
      var data1 = {
        status: "Failed",
        address: address,
        trx: trx
      }
      res.json(data1)
    } else {
      result.forEach(function (item, index) {
        if (item.data.from == address || item.data.to == address) {
          trx.push(item.data)
        }
      })
      let data = new Map();
      for (let obj of trx) {
        data.set(obj.blockNumber, obj);
      }
      let out = [...data.values()];
      var datareturn = {
        status: "Success",
        address: address,
        trx: out
      }
      res.json(datareturn)
    }
  })
})

router.get("/getrpc", (req, res) => {
  pricecollect.find({ id: 1 }).toArray(function (err, result) {
    if (err) {
      res.json({
        "rpc-http": config.http_provider,
        "rpc-socket": config.ws_provider,
        "network-id": config.networkid,
        "networt-name": config.networt_name,
        "coin-name": config.coinName,
        "symbol": config.symbol,
        "decimal": config.decimal
      })
    };
    if (parseFloat(result[0].price) > 0) {
      res.json({
        "rpc-http": config.http_provider,
        "rpc-socket": config.ws_provider,
        "network-id": config.networkid,
        "networt-name": config.networt_name,
        "coin-name": config.coinName,
        "symbol": config.symbol,
        "decimal": config.decimal,
        "price": result[0].price,
        "change24": result[0].change24,
        "change1h": result[0].change1h
      })
    } else {
      res.json({
        "rpc-http": config.http_provider,
        "rpc-socket": config.ws_provider,
        "network-id": config.networkid,
        "networt-name": config.networt_name,
        "coin-name": config.coinName,
        "symbol": config.symbol,
        "decimal": config.decimal
      })
    }
  })

})

router.get('/test', (req, res) => {
  web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ", result);
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
  //contract creation
  web3.eth.getTransactionReceipt("0x30775355de0f873bb93dcf26005306eac0aee2b902424d370df50ffd5637838f").then(console.log);
  web3.eth.getTransaction("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984")
  .then(rs=>{
    console.log(rs)
    //console.log(rs.logs)
  });*/
  //Contract transaction 
  web3.eth.getTransactionReceipt("0x88b3292970da72923efbe7663ded7e961a2fa3d719f6d237b49934ba3c335f53")
    .then(ress => {
      console.log(ress)
    })
  web3.eth.getBlock(162, true).then(console.log);
  //web3.eth.getTransaction("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984").then(console.log);
  // web3.eth.getTransactionReceipt("0x47fde7ae9523b46d76cc96105f85c08931e6e66e99529102147aa96c3d6ef984").then(console.log);
  //console.log(web3.eth);
  var blocks = []
  web3.eth.getBlockNumber().then((result) => {
    for (var i = 0; i < 100; i++) {//100 or result
      web3.eth.getBlock(result - i)
        .then(rs => {
          //console.log(rs)
          blocks.push(rs)
        })
        .catch(err => {
          console.log("...")
        })
    }

  });

  setTimeout(() => {
    blocks.sort((a, b) => { return a.number - b.number });
    //console.log(blocks)
  }, 10000)


  res.json([
    {
      name: req.query.name,
      age: req.query.age
    }
  ])
})



module.exports = router    