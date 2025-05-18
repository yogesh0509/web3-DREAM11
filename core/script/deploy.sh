#!/bin/bash

set -euo pipefail

# Config
RPC_URL="https://base-sepolia.g.alchemy.com/v2/-rWU61cBUlLTu3wDqYfP9qvAoZErhcuh"
BASESCAN_API_KEY="26RASBPDQ83JTHXCXU46TCY7MRZH1IQ2C3"
GAME_FACTORY="0x2058009604a00150BcCCD498845CCDd4d8B09524"
AUCTION_TIME="180" # 3 mins

echo "🔧 Deploying Game contract..."

# Deploy Game contract first without attempting verification
forge script ./script/Game.s.sol:DeployGame \
    --broadcast \
    --rpc-url "$RPC_URL" \
    --legacy \
    --sig "run(address,uint256)" \
    -- "$GAME_FACTORY" "$AUCTION_TIME" | tee deploy_output.txt

# Direct extraction based on the specific output format from the provided example
GAME_ADDRESS=$(grep -o "0x[a-fA-F0-9]\{40\}" deploy_output.txt | grep -v "$GAME_FACTORY" | head -1)

if [[ -z "$GAME_ADDRESS" ]]; then
    echo "❌ Failed to extract Game contract address from deploy output. Checking alternate formats..."
    
    # Try alternative pattern from "contract Game 0x..."
    GAME_ADDRESS=$(grep -o "contract Game 0x[a-fA-F0-9]\{40\}" deploy_output.txt | grep -o "0x[a-fA-F0-9]\{40\}")
    
    if [[ -z "$GAME_ADDRESS" ]]; then
        echo "❌ Still couldn't find the address. Exiting."
        exit 1
    fi
fi

echo "✅ Game contract deployed at: $GAME_ADDRESS"
echo "🚀 Starting game initialization..."

# Start game using GameFactory without verification
forge script ./script/GameFactory.s.sol:DeployGameFactory \
    --broadcast \
    --rpc-url "$RPC_URL" \
    --legacy \
    --sig "startGame(address,address,uint256)" \
    -- "$GAME_FACTORY" "$GAME_ADDRESS" "$AUCTION_TIME"

echo "✅ Game initialization completed!"

# If needed, can verify later manually with:
echo ""
echo "📝 To verify the contract, run:"
echo "forge verify-contract --chain-id 84532 --compiler-version \"v0.8.28+commit.8e94f90a\" --constructor-args \$(cast abi-encode \"constructor(address,uint256)\" \"$GAME_FACTORY\" \"$AUCTION_TIME\") --etherscan-api-key \"$BASESCAN_API_KEY\" \"$GAME_ADDRESS\" src/Game.sol:Game"