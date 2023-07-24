const { Requester } = require('@chainlink/external-adapter')
const { ethers } = require("ethers");

require('dotenv').config()
const provider = new ethers.providers.WebSocketProvider(
  `wss://young-warmhearted-ensemble.matic-testnet.discover.quiknode.pro/${process.env.INFURA_KEY}/`
)
const abi = require("./constants/abi.json")

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const createRequest = async (input, callback) => {

  const jobRunID = input.data
  const tokenId = String(input.id)
  const contractABI = JSON.parse(abi["PIC"])

  const contract = new ethers.Contract(input.address, contractABI, provider);
  const res = await contract.getplayerDetails(tokenId)
  const playerId = parseInt(res.id)
  const url = `https://unofficial-cricbuzz.p.rapidapi.com/players/get-info`
  const headers = {
    'X-RapidAPI-Key': '673075d6ebmshf9d93a82582ea4fp1bfa13jsndc6cd297a25f',
    'X-RapidAPI-Host': 'unofficial-cricbuzz.p.rapidapi.com'
  }
  const params = {
    playerId
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get' 
  // headers = 'headers.....'
  const config = {
    url,
    headers,
    params
  }
  const role = res.role
  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
      if (role == "batsman") {response.data.result = response.data.currRank.bat.odiRank }
      else if (role == "bowler") { response.data.result = response.data.currRank.bowl.odiRank }
      else { response.data.result = response.data.currRank.all.odiRank }
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
