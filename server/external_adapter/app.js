const createRequest = require('./index').createRequest
const Moralis = require('moralis').default
const { ethers } = require("ethers");
const { EvmChain } = require("@moralisweb3/common-evm-utils")
const ContractAbi = require("./constants/ContractAbi.json")
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080
const MORALIS_API_KEY = process.env.MORALIS_API_KEY
const address = process.env.MUMBAI_CONTRACT_ADDRESS
const chain = EvmChain.MUMBAI
const abiCoder = ethers.utils.defaultAbiCoder;

app.use(bodyParser.json())

function fetch(data) {
  return new Promise((resolve, reject) => {
    createRequest(data, (status, result) => {
      if (result.statusCode == 200) {
        console.log(result.result)
        if(result.result == null){
          resolve(101)
        }
        resolve(parseInt(result.result))
      }
      else{
        resolve(0)
      }
    })
  })
}

function calculateCount(len) {
  return new Promise(async (resolve, reject) => {
    let arr = []
    for (let i = 0; i < len; i++) {
      arr.push(await fetch(i))
    }
    resolve(arr);
  });
}

app.post('/', async (req, res) => {
  console.log('POST Data: ', req.body)
  const functionName = "getTokenCounter"
  const abi = JSON.parse(ContractAbi["IdentityNft"])
  const response = await Moralis.EvmApi.utils.runContractFunction({
    abi,
    functionName,
    address,
    chain,
  });
  const arr = await calculateCount(response.result)
  console.log(arr)
  res.status(200).json({
    data: abiCoder.encode(["uint256[]"], [arr])
  })

})

const startServer = async () => {
  await Moralis.start({
    apiKey: MORALIS_API_KEY,
  })

  app.listen(port, () => console.log(`Listening on port ${port}!`))
}

startServer()