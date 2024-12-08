
//Chainlink Function
// This script will fetch the player's information using Chainlink Functions

// const playerId = args[0];
// const contractAddress = args[0];
// const totalPlayers = args[1];
const options = {
    url: 'https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/6635 ',
    method: 'GET',
    headers: {
      'x-rapidapi-key': `673075d6ebmshf9d93a82582ea4fp1bfa13jsndc6cd297a25f`,
      'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
    }
  };
  
  // Perform the API request using Chainlink Functions helper method
  const apiResponse = await Functions.makeHttpRequest(options);
  
  // Check for errors
  if (apiResponse.error) {
    throw new Error('Request failed: ' + apiResponse.error);
  }
  
  // Log the response data for debugging
  console.log('API Response:', apiResponse.data);
  
  // Ensure the response contains data
  if (!apiResponse.data) {
    throw new Error('API response data is undefined or null.');
  }
  
  // Extract the player's Test rank from the response
  const playerInfo = apiResponse.data;
  console.log(playerInfo)
  // const testRank = playerInfo.currRank.bat.testRank;
  
  // // Check if the rank is a valid number
  // if (!testRank || isNaN(testRank)) {
  //   throw new Error('Test rank is not a valid number');
  // }
  
  // // Log the player's Test rank
  // console.log('Player Test Rank:', testRank);
  
  // Return the Test rank as a uint256
  return Functions.encodeUint256(Number(0));