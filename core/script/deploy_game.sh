#!/bin/bash

set -euo pipefail

# Config
RPC_URL="https://base-sepolia.g.alchemy.com/v2/-rWU61cBUlLTu3wDqYfP9qvAoZErhcuh"
BASESCAN_API_KEY="26RASBPDQ83JTHXCXU46TCY7MRZH1IQ2C3"
GAME_FACTORY="0x7FD625ba0a3b5E05d1a8E0FE697eA24E0feca20C"
AUCTION_TIME="36000"

echo "🔧 Deploying Game contract..."

# Deploy Game contract (with verification attempted)
set +e
DEPLOY_OUTPUT=$(forge script ./script/Game.s.sol:DeployGame -vvvv \
    --broadcast \
    --rpc-url "$RPC_URL" \
    --legacy \
    --sig "run(address)" \
    --verify \
    --verifier basescan \
    --etherscan-api-key "$BASESCAN_API_KEY" \
    -- "$GAME_FACTORY")

DEPLOY_EXIT_CODE=$?
set -e

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "⚠️  Deployment succeeded but contract verification failed. Continuing anyway..."
fi

# Extract deployed contract address
GAME_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP 'Deployed to: \K0x[a-fA-F0-9]{40}' | tail -n 1)

if [[ -z "$GAME_ADDRESS" ]]; then
    echo "❌ Failed to extract Game contract address from deploy output."
    exit 1
fi

echo "✅ Game contract deployed at: $GAME_ADDRESS"
echo "🚀 Starting game initialization..."

# Start game using GameFactory
forge script ./script/GameFactory.s.sol:DeployGameFactory -vvvv \
    --broadcast \
    --rpc-url "$RPC_URL" \
    --legacy \
    --sig "startGame(address,address,uint256)" \
    -- "$GAME_FACTORY" "$GAME_ADDRESS" "$AUCTION_TIME" || {
        echo "❌ Failed to start game using GameFactory."
        exit 1
    }

echo "✅ Game initialization completed!"
