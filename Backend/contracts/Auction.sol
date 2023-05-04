// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Auction is Ownable{
    uint256 private s_auctionEndTime;
    uint256 private s_highestBid;
    uint256 private s_lastTimeStamp;
    address private s_highestBidder;
    bool public ended = false;
    address private s_marketplace_addr;

    mapping(address => uint256) private pendingReturns;

    event HighestBidIncrease(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event AuctionStarted();

    error AuctionHasEnded();
    error AuctionNotEnded();
    error AuctionEndAlreadyCalled();
    error NeedHigherBid(uint256 highest_bid);
    error TransferFailed();
    error InvalidCall();

    modifier onlyMarketplace() {
        if (msg.sender != s_marketplace_addr) {
            revert InvalidCall();
        }
        _;
    }

    constructor(uint256 _biddingTime) {
        s_auctionEndTime = _biddingTime;
    }

    function restartAuction() external onlyMarketplace{
        if (block.timestamp - s_lastTimeStamp < s_auctionEndTime) {
            revert AuctionNotEnded();
        }
        s_lastTimeStamp = block.timestamp;
        ended = false;
        s_highestBid = 0;
        s_highestBidder = address(0);
        emit AuctionStarted();
    }

    function bid(address bidder, uint256 _bid) external onlyMarketplace{
        if (block.timestamp - s_lastTimeStamp > s_auctionEndTime) {
            revert AuctionHasEnded();
        }

        if (_bid <= s_highestBid) {
            revert NeedHigherBid(s_highestBid);
        }

        if (s_highestBid != 0) {
            pendingReturns[s_highestBidder] += s_highestBid;
        }

        s_highestBidder = bidder;
        s_highestBid = _bid;
        emit HighestBidIncrease(s_highestBidder, s_highestBid);
    }

    function withdraw() external onlyMarketplace returns(uint256 amount){
        amount = pendingReturns[msg.sender];

        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            return amount;
        }
    }

    function auctionEnd() external onlyMarketplace returns(address, uint256){
        if (block.timestamp - s_lastTimeStamp < s_auctionEndTime) {
            revert AuctionNotEnded();
        }
        if (ended) {
            revert AuctionEndAlreadyCalled();
        }
        ended = true;
        emit AuctionEnded(s_highestBidder, s_highestBid);
        return (getHighestBidder(), getHighestBid());
    }

    function putMarketplace(address marketplace_addr) public onlyOwner{
        s_marketplace_addr = marketplace_addr;
    }

    function getPendingReturns(address player) public view returns (uint256) {
        return pendingReturns[player];
    }

    function getHighestBidder() public view returns (address) {
        return s_highestBidder;
    }

    function getHighestBid() public view returns (uint256) {
        return s_highestBid;
    }

    function getAuctionEndtime() public view returns (uint256) {
        return s_auctionEndTime;
    }

    fallback() external payable {}
    receive() external payable {}
}
