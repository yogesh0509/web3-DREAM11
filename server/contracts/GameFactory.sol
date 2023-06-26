// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PIC.sol";
import "./Game.sol";

contract GameFactory is Ownable {
    address public oracle;
    address public link;
    string public jobId;

    address[] public GameStorage;
    
    constructor(address _oracle, address _link) {
        oracle = _oracle;
        link = _link;
    }

    function createGame(uint256 _time, string memory _jobId, IPlayer.PlayerQuery[] memory _Players) public onlyOwner {
        PIC newPlayer = new PIC(_Players);
        Game newGame = new Game(_time, oracle, _jobId, link, address(newPlayer));
        GameStorage.push(address(newGame));
    }
}