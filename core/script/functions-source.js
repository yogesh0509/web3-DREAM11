// Chainlink Function to fetch player rankings for all players

// Validate inputs
if (!args || args.length > 1) {
  throw new Error('Invalid argument');
}

// Parse the player IDs from args
const playerIds = JSON.parse(args[0]); // Example: ["72", "69"]

// Array to store all player rankings
const rankings = [];

// Function to fetch one player's ranking
async function fetchRanking(playerId) {
  try {
    const options = {
      url: `https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/${playerId}`,
      method: 'GET',
      headers: {
        'x-rapidapi-key': `673075d6ebmshf9d93a82582ea4fp1bfa13jsndc6cd297a25f`,
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
      }
    };
    const apiResponse = await Functions.makeHttpRequest(options);

    if (apiResponse.error) {
      console.error(`Error fetching player ${playerId} ranking:`, apiResponse.error);
      return 0;
    }

    // Sometimes bat or t20Rank might not exist; handle safely
    const rank = apiResponse.data?.rankings?.bat?.t20Rank || 0;
    return parseInt(rank);
  } catch (error) {
    console.error(`Error processing player ${playerId}:`, error);
    return 0;
  }
}

// Fetch all rankings in parallel (FASTER)
const rankingPromises = playerIds.map(fetchRanking);
const results = await Promise.all(rankingPromises);

// Fill rankings array
for (let r of results) {
  rankings.push(r);
}

console.log("Fetched rankings: ", rankings);

// Now, manually ABI-encode the uint256[] array

let abiEncoded = "0x";

// 1. Encode array length (32 bytes)
const arrayLengthHex = rankings.length.toString(16).padStart(64, "0");
abiEncoded += arrayLengthHex;

// 2. Encode each uint256 number (32 bytes each)
for (let i = 0; i < rankings.length; i++) {
  const hexValue = rankings[i].toString(16).padStart(64, "0"); // 32 bytes = 64 hex chars
  abiEncoded += hexValue;
}

console.log("ABI Encoded Data: ", abiEncoded);

// Helper to convert hex string to Uint8Array
function hexStringToUint8Array(hexString) {
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2);
  }
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Return as Uint8Array (required by Chainlink Functions)
return hexStringToUint8Array(abiEncoded);
