const { Requester, Validator } = require('@chainlink/external-adapter')
const { ethers } = require("ethers");
require('dotenv').config()

const address = process.env.MUMBAI_CONTRACT_ADDRESS

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.

const createRequest = async (input, callback) => {

  // The Validator helps you validate the Chainlink request data
  const jobRunID = input
  let tokenId = String(input)
  const response = await Moralis.EvmApi.nft.getNFTMetadata({
    address,
    chain,
    tokenId,
  });

  const playerId = response.result.metadata.attributes[2].value
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
  const role = response.result.metadata.attributes[1].value
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
