// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuctionHouse.sol";
import "./IdentityNft.sol";
import "hardhat/console.sol";

contract Marketplace is Ownable, ChainlinkClient {
    using Chainlink for Chainlink.Request;
    struct playerBought {
        uint256 tokenId;
        uint256 price;
    }

    mapping(address => bool) private Buyer; // true if address(registrant) is present in the mapping
    mapping(address => mapping(uint256 => playerBought)) // players bought by each registrant
        private BuyerTransactions;
    mapping(address => uint256) private BuyerTransactionCount; // no. of players bought by each registrant
    mapping(uint256 => uint256) private PlayerScore;
    mapping(address => uint256) private TeamScore;
    mapping(address => uint256) private WinnerFunds;

    address[] public BuyerCount;
    uint256 public s_totalBuyerCount;
    uint256 public s_playerCount;
    uint256 public s_currentplayercount;
    uint256 public s_currentAuctionTime;
    uint256 public s_biddingPrice = 1e15;
    bool public s_auctionState;
    address public s_winner;
    uint256[] public score;

    AuctionHouse private s_AuctionHouseContract;
    IdentityNft private s_nft;

    string private jobId;
    uint256 private fee;
    address private oracle;

    uint256 public constant AUCTION_TIME = 86400; // 1 Day

    modifier registeredBuyer() {
        if (Buyer[msg.sender] == true) {
            revert BuyerAlreadyRegistered();
        }
        _;
    }

    modifier NotRegisteredBuyer() {
        if (Buyer[msg.sender] != true) {
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

    error BuyerAlreadyRegistered();
    error BuyerNotRegistered();
    error AuctionIsOpen();
    error TransferFailed();
    error WrongBid(uint256 bid);

    // make events indexed

    event PlayerBid(uint256 tokenId);
    event BuyerRegistered(address registrant);
    event AuctionEnded(address winner, uint256 amount);
    event AuctionStarted(uint256 tokenId);
    event RequestFulfilled(bytes32 indexed requestId);
    event HighestBidIncrease(uint256 tokenId, address bidder, uint256 amount);

    constructor(
        address payable _addr1,
        address payable _addr2,
        address _oracle,
        string memory _jobId,
        address _link
    ) {
        s_nft = IdentityNft(_addr1);
        s_AuctionHouseContract = AuctionHouse(_addr2);
        s_playerCount = s_nft.getTokenCounter();
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
        Buyer[msg.sender] = true;
        BuyerCount.push(msg.sender);
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
        if (s_currentplayercount < s_playerCount) {
            upkeepNeeded = (block.timestamp - s_currentAuctionTime >=
                AUCTION_TIME);
        } else if(s_currentplayercount == s_playerCount){
            upkeepNeeded = true;
        }
        else{
            upkeepNeeded = false;
        }
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external returns (bytes32 requestId) {
        s_playerCount = s_nft.getTokenCounter();
        if (s_currentplayercount < s_playerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= AUCTION_TIME) &&
                !s_auctionState
            ) {
                startAuction();
            } else {
                s_auctionState = false;
                s_currentAuctionTime = block.timestamp;
                (
                    address s_highestBidder,
                    uint256 s_highestBid
                ) = s_AuctionHouseContract.auctionEnd(payable(address(this)));
                emit AuctionEnded(s_highestBidder, s_highestBid);

                s_biddingPrice = 1e15;
                BuyerTransactions[s_highestBidder][
                    BuyerTransactionCount[s_highestBidder]
                ] = playerBought(s_currentplayercount, s_highestBid);
                BuyerTransactionCount[s_highestBidder]++;
                s_currentplayercount++;
            }
        } else {
            Chainlink.Request memory request = buildOperatorRequest(
                stringToBytes32(jobId),
                this.fulfill.selector
            );
            return sendOperatorRequestTo(oracle, request, fee);
        }
    }

    function fulfill(bytes32 requestId, bytes memory _score)
        public
        recordChainlinkFulfillment(requestId)
    {
        score = abi.decode(_score, (uint256[]));
        for (uint256 i = 0; i < s_playerCount; i++) {
            PlayerScore[i] = score[i];
        }
        s_winner = calculateTeamScore();
        WinnerFunds[s_winner] = (9 * address(this).balance) / 10;
        emit RequestFulfilled(requestId);
    }

    function calculateTeamScore() internal returns (address) {
        address maxTeam;
        uint256 maxScore;
        for (uint256 i = 0; i < s_totalBuyerCount; i++) {
            address Team = BuyerCount[i];
            uint256 result;
            for (uint256 j = 0; j < BuyerTransactionCount[Team]; j++) {
                uint256 id = BuyerTransactions[Team][j].tokenId;
                result += PlayerScore[id];
            }
            TeamScore[Team] += result;
            if (result > maxScore) {
                maxTeam = Team;
                maxScore = result;
            }
        }
        return maxTeam;
    }

    function getAuctionBid() public view returns (uint256) {
        return s_biddingPrice;
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }

    function getTeamScore(address registrant) public view returns (uint256) {
        return TeamScore[registrant];
    }

    function getBuyers() public view returns (address[] memory) {
        return BuyerCount;
    }

    function getPlayersPurchased() public view returns (uint256) {
        return BuyerTransactionCount[msg.sender]; // parameter
    }

    function moneyspent() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < BuyerTransactionCount[msg.sender]; i++) {
            sum += BuyerTransactions[msg.sender][i].price;
        }
        return sum; // parameter
    }

    function fetchPlayers(address registrant) public view returns(playerBought[] memory){
        
        uint256 count = BuyerTransactionCount[registrant];
        playerBought[] memory players = new playerBought[](count); 
        for(uint256 i = 0; i< count; i++){
            players[i] = BuyerTransactions[registrant][i];
        }
        return players;
    }

    function withdraw() public payable {
        (bool success, ) = (msg.sender).call{value: WinnerFunds[msg.sender]}(
            ""
        );
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
