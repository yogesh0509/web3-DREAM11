// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Auction is Ownable {
    uint256 private s_highestBid;
    address private s_highestBidder;
    bool public ended = false;

    mapping(address => uint256) public pendingReturns;

    event HighestBidIncrease(address bidder, uint256 amount, uint256 currentPlayer);
    event AuctionEnded(address winner, uint256 amount, uint256 currentPlayer);
    event AuctionStarted(uint256 currentPlayer);

    error AuctionEndAlreadyCalled();
    error NeedHigherBid(uint256 highest_bid);

    constructor() Ownable(msg.sender) {}

    function restartAuction(uint256 _currentPlayer) external onlyOwner {
        ended = false;
        s_highestBid = 0;
        s_highestBidder = address(0);
        emit AuctionStarted(_currentPlayer);
    }

    function bid(address _bidder, uint256 _bid, uint256 _currentPlayer) external onlyOwner {
        if (_bid <= s_highestBid) {
            revert NeedHigherBid(s_highestBid);
        }

        if (s_highestBid != 0) {
            pendingReturns[s_highestBidder] += s_highestBid;
        }

        s_highestBidder = _bidder;
        s_highestBid = _bid;
        emit HighestBidIncrease(s_highestBidder, s_highestBid, _currentPlayer);
    }

    function withdraw(
        address _bidder
    ) external onlyOwner returns (uint256 amount) {
        amount = pendingReturns[_bidder];

        if (amount > 0) {
            pendingReturns[_bidder] = 0;
            return amount;
        }
    }

    function auctionEnd(uint256 _currentPlayer) external onlyOwner returns (address, uint256) {
        if (ended) {
            revert AuctionEndAlreadyCalled();
        }
        ended = true;
        emit AuctionEnded(s_highestBidder, s_highestBid, _currentPlayer);
        return (getHighestBidder(), getHighestBid());
    }

    function getHighestBidder() public view returns (address) {
        return s_highestBidder;
    }

    function getHighestBid() public view returns (uint256) {
        return s_highestBid;
    }

    fallback() external payable {}
    receive() external payable {}
}
