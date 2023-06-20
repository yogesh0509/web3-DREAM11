// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Game.sol";

contract GameFactory is Ownable {
    uint256 public GameCount;
    address public oracle;
    address public link;
    string public jobId;
    address[] public GameStorage;
    
    constructor(address _oracle, address _link) {
        oracle = _oracle;
        link = _link;
    }

    function createGame(uint256 _time, string memory _jobId) public onlyOwner {
        Game newGame = new Game(_time, oracle, _jobId, link);
        GameStorage.push(address(newGame));
        GameCount++;
    }
}
