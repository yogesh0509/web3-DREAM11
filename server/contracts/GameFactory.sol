// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IGame.sol";
import "./PIC.sol";

contract GameFactory is Ownable {

    struct GameQuery{
        address GameAddress;
        uint256 startTime;
    }
    GameQuery[] public GameStorage;

    event GameCreated(uint256 indexed _auctionStartTime);

    function createGame(address _newGame, IPlayer.PlayerQuery[] memory _Players, uint256 _auctionStartTime) public onlyOwner {
        PIC newPlayer = new PIC(_Players);
        IGame newGame = IGame(_newGame);
        newGame.start(address(newPlayer), _auctionStartTime);

        GameQuery memory newQuery = GameQuery(_newGame, _auctionStartTime);
        GameStorage.push(newQuery);
        emit GameCreated(_auctionStartTime);
    }
}