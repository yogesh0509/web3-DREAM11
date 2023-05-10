// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

import "./Auction.sol";
import "./PIC.sol";

contract Game is ChainlinkClient, AutomationCompatibleInterface {
    using Chainlink for Chainlink.Request;
    struct playerBought {
        uint256 tokenId;
        uint256 price;
    }

    uint256 public s_auctionTime;
    uint256 public s_totalBuyerCount;
    uint256 public s_totalplayerCount;
    uint256 private s_currentplayercount;
    uint256 public s_currentAuctionTime;
    uint256 private s_biddingPrice = 1;
    uint256 private fee;

    string public jobId;
    address private s_winner;
    bool public s_auctionState;
    bool public s_unlock = false;
    address public oracle;
    address private owner;

    Auction public s_AuctionContract;
    PIC public s_player;

    address[] public s_buyers;

    mapping(address => bool) public s_buyercheck;
    mapping(address => mapping(uint256 => playerBought))
        private s_BuyerTransactions;
    mapping(address => uint256) public s_BuyerTransactionCount;
    mapping(uint256 => uint256) private s_playerScore;
    mapping(address => uint256) private s_TeamScore;
    mapping(address => uint256) private s_winnerFunds;
    mapping(address => uint256) public s_DreamToken;

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

    modifier onlyWinner() {
        if (msg.sender != s_winner) {
            revert SenderIsNotWinner();
        }
        _;
    }

    modifier onlyOwner(){
        if(msg.sender != owner){
            revert NotOwner();
        }
        _;
    }

    error NotOwner();
    error IncorrectRegistrationAmount();
    error BuyerAlreadyRegistered();
    error BuyerNotRegistered();
    error AuctionIsOpen();
    error NotEnoughFunds();
    error TransferFailed();
    error FundsAreLocked();
    error SenderIsNotWinner();
    error WinnerFundNotReceived();

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
        uint256 time,
        address _oracle,
        string memory _jobId,
        address _link
    ) {
        s_player = new PIC();
        s_AuctionContract = new Auction(time);
        s_totalplayerCount = s_player.getTokenCounter();
        s_auctionState = false;
        s_auctionTime = time;
        s_currentAuctionTime = block.timestamp + s_auctionTime;

        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }

        oracle = _oracle;
        jobId = _jobId;
        fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    function register() public payable registeredBuyer checkauctionState {
        if (msg.value != 1e17) {
            revert IncorrectRegistrationAmount();
        }
        s_DreamToken[msg.sender] = 100;
        s_buyercheck[msg.sender] = true;
        s_buyers.push(msg.sender);
        s_totalBuyerCount += 1;
        emit BuyerRegistered(msg.sender);
    }

    function bid() public NotRegisteredBuyer {
        if (s_DreamToken[msg.sender] < s_biddingPrice) {
            revert NotEnoughFunds();
        }
        s_AuctionContract.bid(msg.sender, s_biddingPrice);

        emit PlayerBid(s_currentplayercount);

        if (s_biddingPrice >= 10) {
            s_biddingPrice += 5;
        } else {
            s_biddingPrice += 2;
        }
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          CHAINLINK FUNCTIONS
    // ------------------------------------------------------------------------------------------------------

    function checkUpkeep(
        bytes memory /* checkData */
    )
        external
        view
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        if (s_currentplayercount <= s_totalplayerCount && !s_unlock) {
            upkeepNeeded = (block.timestamp - s_currentAuctionTime >=
                s_auctionTime);
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata /*performData*/) external {
        s_totalplayerCount = s_player.getTokenCounter();
        if (s_currentplayercount < s_totalplayerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                !s_auctionState
            ) {
                s_auctionState = true;
                s_currentAuctionTime = block.timestamp;
                s_AuctionContract.restartAuction();
                emit AuctionStarted(s_currentplayercount);
            } else if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                s_auctionState
            ) {
                s_auctionState = false;
                s_currentAuctionTime = block.timestamp;
                (
                    address s_highestBidder,
                    uint256 s_highestBid
                ) = s_AuctionContract.auctionEnd();
                emit AuctionEnded(s_highestBidder, s_highestBid);

                s_biddingPrice = 1;
                s_BuyerTransactions[s_highestBidder][
                    s_BuyerTransactionCount[s_highestBidder]
                ] = playerBought(s_currentplayercount, s_highestBid);
                s_BuyerTransactionCount[s_highestBidder]++;
                s_currentplayercount++;
            }
        } else if (
            s_currentplayercount == s_totalplayerCount &&
            (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
            !s_unlock
        ) {
            s_currentAuctionTime = block.timestamp;
            Chainlink.Request memory request = buildOperatorRequest(
                stringToBytes32(jobId),
                this.fulfill.selector
            );
            sendOperatorRequestTo(oracle, request, fee);
        }
    }

    function fulfill(
        bytes32 requestId,
        bytes memory _score
    ) public recordChainlinkFulfillment(requestId) {
        emit RequestFulfilled(requestId);

        uint256[] memory s_score;
        s_score = abi.decode(_score, (uint256[]));

        for (uint256 i = 0; i < s_totalplayerCount; i++) {
            s_playerScore[i] = s_score[i];
        }
        s_winner = calculateTeamScore();
        s_unlock = true;
        s_winnerFunds[s_winner] = (7 * address(this).balance) / 10;
    }

    function editJobId(string memory _jobId) public onlyOwner {
        jobId = _jobId;
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

    function stringToBytes32(
        string memory source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          RESULT CALCULATOR AND WITHDRAWLS
    // ------------------------------------------------------------------------------------------------------

    function calculateTeamScore() internal returns (address) {
        address maxTeam;
        uint256 maxScore;
        for (uint256 i = 0; i < s_totalBuyerCount; i++) {
            address Team = s_buyers[i];
            uint256 result;
            for (uint256 j = 0; j < s_BuyerTransactionCount[Team]; j++) {
                uint256 id = s_BuyerTransactions[Team][j].tokenId;
                result += (100 - s_playerScore[id] + 1) / 10;
            }
            s_TeamScore[Team] = result;
            if (result > maxScore) {
                maxTeam = Team;
                maxScore = result;
            }
        }
        return maxTeam;
    }

    function withdrawDreamToken() public {
        uint256 amount = s_AuctionContract.withdraw();
        s_DreamToken[msg.sender] += amount;
    }

    function convertTokenToEth() public payable checklock {
        uint256 amount = s_DreamToken[msg.sender];
        s_DreamToken[msg.sender] = 0;
        (bool success, ) = (msg.sender).call{value: amount * 1e15}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdrawWinnerFunds() public payable checklock onlyWinner {
        uint256 amount = s_winnerFunds[msg.sender];
        s_winnerFunds[msg.sender] = 0;
        (bool success, ) = (msg.sender).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdrawFunds() public payable onlyOwner checklock {
        (bool success, ) = (msg.sender).call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          STATE VARIABLES
    // ------------------------------------------------------------------------------------------------------

    function moneyspent(address registrant) public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < s_BuyerTransactionCount[registrant]; i++) {
            sum += s_BuyerTransactions[registrant][i].price;
        }
        return sum;
    }

    function fetchPlayers(
        address registrant
    ) public view returns (playerBought[] memory) {
        uint256 count = s_BuyerTransactionCount[registrant];
        playerBought[] memory players = new playerBought[](count);
        for (uint256 i = 0; i < count; i++) {
            players[i] = s_BuyerTransactions[registrant][i];
        }
        return players;
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

    function getPlayerRanking(uint256 _id) public view returns (uint256) {
        return s_playerScore[_id];
    }

    function getBuyers() public view returns (address[] memory) {
        return s_buyers;
    }

    function getPlayersPurchased(
        address registrant
    ) public view returns (uint256) {
        return s_BuyerTransactionCount[registrant];
    }

    function getWinnerFunds() public view returns (uint256) {
        return s_winnerFunds[s_winner];
    }

    function getAuctionContract() public view returns (address){
        return address(s_AuctionContract);
    }

    function getPICContract() public view returns (address){
        return address(s_player);
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

    fallback() external payable {}
    receive() external payable {}
}
