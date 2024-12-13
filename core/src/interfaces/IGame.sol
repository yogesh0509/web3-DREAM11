// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

interface IGame {
    function getAuctionContract() external view returns (address);
    function getPICContract() external view returns (address);
    function start(address _PICAddress, uint256 _auctionStartTime) external;
}
