// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {GameFactory} from "../src/GameFactory.sol";
import {IPlayer} from "../src/interfaces/IPlayer.sol";

contract DeployGameFactory is Script {
    function run() external returns (GameFactory) {
        uint256 senderPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(senderPrivateKey);
        GameFactory gameFactory = new GameFactory();

        console.log("Game Factory contract deployed: ", address(gameFactory));

        vm.stopBroadcast();

        return gameFactory;
    }

    function startGame(address gameAddress, uint256 auctionStartTime) external {
        address factoryAddress = 0xc8C23F4DcC2f3053C53862335970728D91154Df7;
        IPlayer.PlayerQuery[] memory players = new IPlayer.PlayerQuery[](4);

        players[0] = IPlayer.PlayerQuery({
            imageURI: "ipfs://bafybeif4uof2j5n3z33sifjaiwzpkhyqwenyohhgk5bexv2mbiasl5q3au",
            name: "virat kohli",
            role: "batsman",
            id: 1413
        });

        players[1] = IPlayer.PlayerQuery({
            imageURI: "ipfs://bafybeigi74wsib47dtnugxpczxospxhflxztcyubq3ifibdkpvxxbkbc2y",
            name: "rohit sharma",
            role: "batsman",
            id: 576
        });

        players[2] = IPlayer.PlayerQuery({
            imageURI: "ipfs://bafybeiegaabgbszh7fqrylhptbimtjlfpj5gkrqnkksq2p6bljnsxhhzlm",
            name: "trent boult",
            role: "bowler",
            id: 8117
        });

        players[3] = IPlayer.PlayerQuery({
            imageURI: "ipfs://bafybeihswxtsfdrsusdnw4lrfnldrcohbmps2nvix4lq4iqxsb2zontnmy",
            name: "steve smith",
            role: "batsman",
            id: 2250
        });

        uint256 senderPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(senderPrivateKey);

        GameFactory gameFactory = GameFactory(factoryAddress);
        gameFactory.createGame(
            gameAddress,
            players,
            auctionStartTime
        );

        vm.stopBroadcast();
    }
}
