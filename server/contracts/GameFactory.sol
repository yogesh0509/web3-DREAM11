// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IGame.sol";
import "./PIC.sol";

contract GameFactory is Ownable {
    address[] public GameStorage;

    function createGame(address _newGame, IPlayer.PlayerQuery[] memory _Players) public onlyOwner {
        PIC newPlayer = new PIC(_Players);
        IGame newGame = IGame(_newGame);
        newGame.start(address(newPlayer));
        GameStorage.push(_newGame);
    }
}