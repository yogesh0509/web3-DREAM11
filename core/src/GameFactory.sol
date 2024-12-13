// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IGame.sol";
import "./PIC.sol";

contract GameFactory is Ownable {
    address[] public s_GameStorage;

    event GameCreated(
        address indexed _gameAddress,
        uint256 indexed _auctionStartTime,
        uint256 indexed _totalPlayers
    );

    constructor() Ownable(msg.sender) {}

    function createGame(
        address _newGameAddress,
        IPlayer.PlayerQuery[] memory _Players,
        uint256 _auctionStartTime
    ) public onlyOwner {
        PIC newPICContract = new PIC(_Players);
        IGame gameContract = IGame(_newGameAddress);
        gameContract.start(address(newPICContract), _auctionStartTime);

        s_GameStorage.push(_newGameAddress);
        emit GameCreated(
            _newGameAddress,
            _auctionStartTime,
            newPICContract.getTotalPlayers()
        );
    }

    function getAllGames() external view returns (address[] memory) {
        return s_GameStorage;
    }
}
