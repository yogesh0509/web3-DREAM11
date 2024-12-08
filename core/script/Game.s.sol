// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Game} from "../src/Game.sol";

contract DeployGame is Script {
    uint256 constant AUCTION_TIME = 3600; // 1 hour
    uint32 constant gasLimit = 300000;

    function run(address factoryAddress) external returns (Game) {
        string memory path = "./script/functions-source.js";

        // constant values are for base sepolia -> https://docs.chain.link/chainlink-functions/supported-networks#base-sepolia-testnet
        address router = 0xf9B8fc078197181C841c296C876945aaa425B278;
        bytes32 donId = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;
        string memory source = vm.readFile(path);
        uint64 subscriptionId = 239;
        uint256 senderPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(senderPrivateKey);
        Game newGame = new Game(
            AUCTION_TIME,
            factoryAddress,
            router,
            donId,
            source,
            subscriptionId,
            gasLimit
        );

        console.log("Game contract deployed: ", address(newGame));

        vm.stopBroadcast();

        return newGame;
    }
}
