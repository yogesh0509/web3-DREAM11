// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PIC} from "../src/PIC.sol";

contract DeployPIC is Script {
    function run() external returns (PIC) {
        PIC.PlayerQuery[] memory players = new PIC.PlayerQuery[](4);
        
        players[0] = PIC.PlayerQuery({
            imageURI: "ipfs://bafybeif4uof2j5n3z33sifjaiwzpkhyqwenyohhgk5bexv2mbiasl5q3au",
            name: "virat kohli",
            role: "batsman",
            id: 1413
        });
        
        players[1] = PIC.PlayerQuery({
            imageURI: "ipfs://bafybeigi74wsib47dtnugxpczxospxhflxztcyubq3ifibdkpvxxbkbc2y",
            name: "rohit sharma",
            role: "batsman", 
            id: 576
        });
        
        players[2] = PIC.PlayerQuery({
            imageURI: "ipfs://bafybeiegaabgbszh7fqrylhptbimtjlfpj5gkrqnkksq2p6bljnsxhhzlm",
            name: "trent boult",
            role: "bowler",
            id: 8117
        });
        
        players[3] = PIC.PlayerQuery({
            imageURI: "ipfs://bafybeihswxtsfdrsusdnw4lrfnldrcohbmps2nvix4lq4iqxsb2zontnmy",
            name: "steve smith",
            role: "batsman",
            id: 2250
        });

        vm.startBroadcast();
        PIC pic = new PIC(players);
        vm.stopBroadcast();

        return pic;
    }
}