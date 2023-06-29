// const createRequest = require('./index').createRequest
const { ethers } = require("ethers");
const abi = require("./constants/abi.json")
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080
const address = process.env.MUMBAI_CONTRACT_ADDRESS
const abiCoder = ethers.utils.defaultAbiCoder;
const provider = new ethers.providers.WebSocketProvider(
  `wss://young-warmhearted-ensemble.matic-testnet.discover.quiknode.pro/${process.env.INFURA_KEY}/`
);

app.use(bodyParser.json())

// function fetch(data) {
//   return new Promise((resolve, reject) => {
//     createRequest(data, (status, result) => {
//       if (result.statusCode == 200) {
//         console.log(result.result)
//         if (result.result == null) {
//           resolve(101)
//         }
//         resolve(parseInt(result.result))
//       }
//       else {
//         resolve(0)
//       }
//     })
//   })
// }

// function calculateCount(len) {
//   return new Promise(async (resolve, reject) => {
//     let arr = []
//     for (let i = 0; i < len; i++) {
//       arr.push(await fetch(i))
//     }
//     resolve(arr);
//   });
// }

app.post('/', async (req, res) => {
  console.log('POST Data: ', req.body)
  // const functionName = "getTokenCounter"
  const contractABI = JSON.parse(abi["IdentityNft"])

  const contract = new ethers.Contract(address, contractABI, provider);

  const response = await contract.getTokenCounter()
  console.log(response.toString())
  //const arr = await calculateCount(response.result)
  //console.log(arr)

  res.status(200).json({
    data: "success"
  })

  // res.status(200).json({
  //   data: abiCoder.encode(["uint256[]"], [arr])
  // })

})

app.listen(port, () => console.log(`Listening on port ${port}!`))
