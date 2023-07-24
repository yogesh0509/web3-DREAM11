const createRequest = require('./index').createRequest
const { ethers } = require("ethers")
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080
const abi = require("./constants/abi.json")

const abiCoder = ethers.utils.defaultAbiCoder;
const provider = new ethers.providers.WebSocketProvider(
  `wss://young-warmhearted-ensemble.matic-testnet.discover.quiknode.pro/${process.env.INFURA_KEY}/`
)

app.use(bodyParser.json())

const fetch = (id, address) => {
  return new Promise((resolve, reject) => {
    createRequest({ id: id, address: address }, (status, result) => {
      if (result.statusCode == 200) {
        if (result.result == null) {
          resolve(101)
        }
        resolve(parseInt(result.result))
      }
      else {
        resolve(0)
      }
    })
  })
}

const calculateCount = (len, address) => {
  return new Promise(async (resolve, reject) => {
    let response = []
    for (let id = 0; id < len; id++) {
      response.push(await fetch(id, address))
    }
    resolve(response);
  });
}

app.post('/', async (req, res) => {
  console.log('POST Data: ', req.body)
  const contractABI = JSON.parse(abi["PIC"])
  const address = req.body.data.PIC
  const contract = new ethers.Contract(address, contractABI, provider);

  const response = await contract.getTotalPlayers()
  const encodeResponse = await calculateCount(response.toString(), address)
  console.log(encodeResponse)

  res.status(200).json({
    data: abiCoder.encode(["uint256[]"], [encodeResponse])
  })

})

app.listen(port, () => console.log(`Listening on port ${port}!`))
