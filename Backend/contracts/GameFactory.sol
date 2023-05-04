// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Game.sol";

contract GameFactory is Ownable {
    uint256 public GameCount;
    address[] public GameStorage;
    address public oracle;
    address public link;
    string public jobId;

    constructor(address _oracle, string memory _jobId, address _link) {
        oracle = _oracle;
        jobId = _jobId;
        link = _link;
    }

    function createGame(uint256 _time) public onlyOwner {
        Game newGame = new Game(_time, oracle, jobId, link);
        GameStorage.push(address(newGame));
        GameCount++;
    }
}
