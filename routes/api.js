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

function removeDuplicates(){
        blockcollection.aggregate([
 {
     "$group": {
         _id: {number: "$number"},
         dups: { $addToSet: "$_id" } ,
         count: { $sum : 1 }
     }
 },
 {
     "$match": {
         count: { "$gt": 1 }
     }
 }]).forEach(function(doc) {
   doc.dups.shift();
   blockcollection.remove({
       _id: {$in: doc.dups}
   });
 })
 
    trxcollection.aggregate([
 {
     "$group": {
         _id: {hash: "$hash"},
         dups: { $addToSet: "$_id" } ,
         count: { $sum : 1 }
     }
 },
 {
     "$match": {
         count: { "$gt": 1 }
     }
 }]).forEach(function(doc) {
   doc.dups.shift();
   trxcollection.remove({
       _id: {$in: doc.dups}
   });
 })
}


function getBlockFn(number) {
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
  removeDuplicates()
  var limits = 50
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
    page = (parseInt(req.query.page)-1) * limits
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
    page = (parseInt(req.query.page)* limits) -1
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
        data.set(obj.hash, obj);
      }
      let out = [...data.values()];
      res.json(out)
    }
  })

})

router.get("/trx-count", (req, res) => {
  trxcollection.distinct("hash")
    .then(result => {
      res.json({ trx: result.length, status: "Query Success" })
    })
    .catch(errr => {
      res.json({ trx: 0, status: "Failed" })
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
        data.set(obj.hash, obj);
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
        "decimal": config.decimal,
        "price": 0,
        "change24": 0,
        "change1h": 0,
        "test_network":config.test_network
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
        "change1h": result[0].change1h,
        "test_network":config.test_network
      })
    } else {
      res.json({
        "rpc-http": config.http_provider,
        "rpc-socket": config.ws_provider,
        "network-id": config.networkid,
        "networt-name": config.networt_name,
        "coin-name": config.coinName,
        "symbol": config.symbol,
        "decimal": config.decimal,
        "price": 0,
        "change24": 0,
        "change1h": 0,
        "test_network":config.test_network
      })
    }
  })

})

router.get("/supply", (req, res) => {
  pricecollect.find({ id: 1 }).toArray(function (err, result) {
    res.json({
      "result":config.supply
    })
  })
})

router.get("/csupply", (req, res) => {
  pricecollect.find({ id: 1 }).toArray(function (err, result) {
    res.json({
      "result":config.csupply
    })
  })
})

module.exports = router    