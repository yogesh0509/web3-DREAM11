// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionHouse.sol";
import "./IdentityNft.sol";
import "hardhat/console.sol";

contract Marketplace is Ownable, ChainlinkClient, AutomationCompatibleInterface {
    using Chainlink for Chainlink.Request;
    struct playerBought {
        uint256 tokenId;
        uint256 price;
    }

    mapping(address => bool) private s_buyercheck;
    mapping(address => mapping(uint256 => playerBought))
        private s_BuyerTransactions;
    mapping(address => uint256) private s_BuyerTransactionCount;
    mapping(uint256 => uint256) private s_playerScore;
    mapping(address => uint256) private s_TeamScore;
    mapping(address => uint256) private s_winnerFunds;

    string private jobId;
    address public s_winner;
    address private oracle;
    uint256 public constant AUCTION_TIME = 86400; // 1 Day
    uint256 public s_totalBuyerCount;
    uint256 public s_totalplayerCount;
    uint256 public s_currentplayercount;
    uint256 public s_currentAuctionTime;
    uint256 public s_biddingPrice = 1e15;
    uint256 private fee;

    address[] public s_buyers;
    uint256[] public s_score;

    bool public s_auctionState;
    bool public s_unlock = false;

    AuctionHouse private s_AuctionHouseContract;
    IdentityNft private s_nft;

    modifier registeredBuyer() {
        if (s_buyercheck[msg.sender] == true) {
            revert BuyerAlreadyRegistered();
        }
        _;
    }

    modifier NotRegisteredBuyer() {
        if (s_buyercheck[msg.sender] != true) {
            revert BuyerNotRegistered();
        }
        _;
    }

    modifier checkauctionState() {
        if (s_auctionState) {
            revert AuctionIsOpen();
        }
        _;
    }

    modifier checklock() {
        if (s_unlock == false) {
            revert FundsAreLocked();
        }
        _;
    }

    error BuyerAlreadyRegistered();
    error BuyerNotRegistered();
    error AuctionIsOpen();
    error TransferFailed();
    error WrongBid(uint256 bid);
    error FundsAreLocked();

    event PlayerBid(uint256 indexed tokenId);
    event BuyerRegistered(address indexed registrant);
    event AuctionEnded(address indexed winner, uint256 indexed amount);
    event AuctionStarted(uint256 indexed tokenId);
    event RequestFulfilled(bytes32 indexed requestId);
    event HighestBidIncrease(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 indexed amount
    );

    constructor(
        address payable _addr1,
        address payable _addr2,
        address _oracle,
        string memory _jobId,
        address _link
    ) {
        s_nft = IdentityNft(_addr1);
        s_AuctionHouseContract = AuctionHouse(_addr2);
        s_totalplayerCount = s_nft.getTokenCounter();
        s_auctionState = false;
        s_currentAuctionTime = block.timestamp + AUCTION_TIME;

        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }

        oracle = _oracle;
        jobId = _jobId;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function register() public registeredBuyer checkauctionState {
        s_buyercheck[msg.sender] = true;
        s_buyers.push(msg.sender);
        s_totalBuyerCount += 1;
        emit BuyerRegistered(msg.sender);
    }

    function startAuction() public onlyOwner {
        s_auctionState = true;
        s_currentAuctionTime = block.timestamp;
        s_AuctionHouseContract.start();
        emit AuctionStarted(s_currentplayercount);
    }

    function bid() public payable NotRegisteredBuyer {
        if (msg.value != s_biddingPrice) {
            revert WrongBid(msg.value);
        }
        s_AuctionHouseContract.bid{value: msg.value}(msg.sender);

        emit PlayerBid(s_currentplayercount);

        if (s_biddingPrice >= 1e18) {
            s_biddingPrice += 5e17;
        } else {
            s_biddingPrice += 5e14;
        }
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        external
        view
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        if (s_currentplayercount < s_totalplayerCount) {
            upkeepNeeded = (block.timestamp - s_currentAuctionTime >=
                AUCTION_TIME);
        } else if (s_currentplayercount == s_totalplayerCount) {
            upkeepNeeded = true;
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external {
        s_totalplayerCount = s_nft.getTokenCounter();
        if (s_currentplayercount < s_totalplayerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= AUCTION_TIME) &&
                !s_auctionState
            ) {
                startAuction();
            } else if (
                (block.timestamp - s_currentAuctionTime >= AUCTION_TIME) &&
                s_auctionState
            ) {
                s_auctionState = false;
                s_currentAuctionTime = block.timestamp;
                (
                    address s_highestBidder,
                    uint256 s_highestBid
                ) = s_AuctionHouseContract.auctionEnd(payable(address(this)));
                emit AuctionEnded(s_highestBidder, s_highestBid);

                s_biddingPrice = 1e15;
                s_BuyerTransactions[s_highestBidder][
                    s_BuyerTransactionCount[s_highestBidder]
                ] = playerBought(s_currentplayercount, s_highestBid);
                s_BuyerTransactionCount[s_highestBidder]++;
                s_currentplayercount++;
            }
        } else if (s_currentplayercount == s_totalplayerCount) {
            Chainlink.Request memory request = buildOperatorRequest(
                stringToBytes32(jobId),
                this.fulfill.selector
            );
            sendOperatorRequestTo(oracle, request, fee);
        }
    }

    function fulfill(bytes32 requestId, bytes memory _score)
        public
        recordChainlinkFulfillment(requestId)
    {
        emit RequestFulfilled(requestId);
        s_score = abi.decode(_score, (uint256[]));
        for (uint256 i = 0; i < s_totalplayerCount; i++) {
            s_playerScore[i] = s_score[i];
        }
        s_winner = calculateTeamScore();
        s_unlock = true;
        s_winnerFunds[s_winner] = (9 * address(this).balance) / 10;
    }

    function calculateTeamScore() internal returns (address) {
        address maxTeam;
        uint256 maxScore;
        for (uint256 i = 0; i < s_totalBuyerCount; i++) {
            address Team = s_buyers[i];
            uint256 result;
            for (uint256 j = 0; j < s_BuyerTransactionCount[Team]; j++) {
                uint256 id = s_BuyerTransactions[Team][j].tokenId;
                result += s_playerScore[id];
            }
            s_TeamScore[Team] += result;
            if (result > maxScore) {
                maxTeam = Team;
                maxScore = result;
            }
        }
        return maxTeam;
    }

    function getCurrentPlayerCount() public view returns (uint256) {
        return s_currentplayercount;
    }

    function getAuctionBid() public view returns (uint256) {
        return s_biddingPrice;
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }

    function getTeamScore(address registrant) public view returns (uint256) {
        return s_TeamScore[registrant];
    }

    function getBuyers() public view returns (address[] memory) {
        return s_buyers;
    }

    function getPlayersPurchased(address registrant)
        public
        view
        returns (uint256)
    {
        return s_BuyerTransactionCount[registrant];
    }

    function moneyspent(address registrant) public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < s_BuyerTransactionCount[registrant]; i++) {
            sum += s_BuyerTransactions[registrant][i].price;
        }
        return sum;
    }

    function fetchPlayers(address registrant)
        public
        view
        returns (playerBought[] memory)
    {
        uint256 count = s_BuyerTransactionCount[registrant];
        playerBought[] memory players = new playerBought[](count);
        for (uint256 i = 0; i < count; i++) {
            players[i] = s_BuyerTransactions[registrant][i];
        }
        return players;
    }

    function withdrawWinnerFunds() public payable {
        (bool success, ) = (msg.sender).call{value: s_winnerFunds[msg.sender]}(
            ""
        );
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdrawEth() public payable onlyOwner checklock {
        (bool success, ) = (msg.sender).call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function contractBalances()
        public
        view
        returns (uint256 eth, uint256 link)
    {
        eth = address(this).balance;

        LinkTokenInterface linkContract = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        link = linkContract.balanceOf(address(this));
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer Link"
        );
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    fallback() external payable {}

    receive() external payable {}
    // revert eth sent without any function
}
