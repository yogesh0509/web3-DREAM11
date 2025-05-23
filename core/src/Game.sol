// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "./Auction.sol";
import "./interfaces/IPIC.sol";

// Add these interfaces for Chainlink Functions management
interface IFunctionsRouter {
    function addConsumer(uint64 subscriptionId, address consumer) external;
    function removeConsumer(uint64 subscriptionId, address consumer) external;
}

interface IFunctionsSubscriptions {
    function createSubscription() external returns (uint64);
    function addConsumer(uint64 subscriptionId, address consumer) external;
    function fundSubscription(uint64 subscriptionId, uint96 amount) external;
    function getSubscription(uint64 subscriptionId) external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    );
}

contract Game is FunctionsClient, AutomationCompatibleInterface, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;
    
    struct playerBought {
        IPlayer.PlayerQuery player;
        uint256 tokenId;
        uint256 price;
    }

    uint256 public constant REGISTRATION_FEE = 1e15;
    uint256 public s_auctionTime;
    uint256 public s_totalplayerCount;
    uint256 public s_currentplayercount;
    uint256 public s_currentAuctionTime;
    uint256 public s_biddingPrice = 1;
    uint256 public s_TreasuryFunds;
    uint64 public s_subscriptionId;
    uint32 public s_gasLimit;
    string public s_source;

    bytes32 public donId;
    address public s_winner;
    bool public s_auctionState;
    bool public s_unlock = true;
    address public router;
    address public s_factoryAddress;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    Auction public s_AuctionContract;
    IPIC public s_PICContract;

    address[] public s_buyers;

    mapping(address => bool) public s_buyercheck;
    mapping(address => mapping(uint256 => playerBought)) private s_BuyerTransactions;
    mapping(address => uint256) public s_BuyerTransactionCount;
    mapping(address => uint256) private s_TeamScore;
    mapping(address => uint256) public s_winnerFunds;
    mapping(address => uint256) public s_DreamToken;

    // Events for debugging and monitoring
    event RequestSent(bytes32 indexed requestId, string args);
    event RequestFulfilled(bytes32 indexed requestId);
    event DebugUpkeep(string message, uint256 timestamp);
    event DebugConditions(
        bool playerCountCondition,
        bool timeCondition,
        bool unlockCondition,
        uint256 currentPlayerCount,
        uint256 totalPlayerCount,
        uint256 timeDiff,
        bool unlockStatus
    );

    modifier checklock() {
        if (s_unlock == false) {
            revert FundsAreLocked();
        }
        _;
    }

    error UnauthorizedCaller();
    error NotOwner();
    error IncorrectRegistrationAmount();
    error BuyerAlreadyRegistered();
    error BidderNotRegistered();
    error AuctionIsOpen();
    error AuctionIsClosed();
    error NotEnoughFunds();
    error TransferFailed();
    error FundsAreLocked();
    error SenderIsNotWinner();
    error UnexpectedRequestID(bytes32 requestId);

    event BuyerRegistered(address indexed registrant);

    constructor(
        uint256 _time,
        address _factoryAddress,
        address _router,
        bytes32 _donId,
        string memory _source,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) FunctionsClient(_router) Ownable(msg.sender) {
        s_AuctionContract = new Auction();
        s_auctionTime = _time;
        s_auctionState = false;
        s_factoryAddress = _factoryAddress;

        router = _router;
        donId = _donId;
        s_source = _source;
        s_subscriptionId = _subscriptionId;
        s_gasLimit = _gasLimit;
    }

    // ------------------------------------------------------------------------------------------------------
    //                                    CHAINLINK FUNCTIONS MANAGEMENT
    // ------------------------------------------------------------------------------------------------------

    /**
     * @notice Add this contract as a consumer to the Chainlink Functions subscription
     */
    function addConsumerToSubscription() external onlyOwner {
        IFunctionsRouter functionsRouter = IFunctionsRouter(router);
        functionsRouter.addConsumer(s_subscriptionId, address(this));
    }

    /**
     * @notice Remove this contract as a consumer from the Chainlink Functions subscription
     */
    function removeConsumerFromSubscription() external onlyOwner {
        IFunctionsRouter functionsRouter = IFunctionsRouter(router);
        functionsRouter.removeConsumer(s_subscriptionId, address(this));
    }

    /**
     * @notice Get subscription details
     */
    function getSubscriptionDetails() external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        IFunctionsSubscriptions subscriptions = IFunctionsSubscriptions(router);
        return subscriptions.getSubscription(s_subscriptionId);
    }

    /**
     * @notice Update gas limit (useful for testing different limits)
     */
    function updateGasLimit(uint32 _newGasLimit) external onlyOwner {
        s_gasLimit = _newGasLimit;
    }

    /**
     * @notice Estimate gas needed based on number of players
     * Base gas: ~100k, Per player: ~50k (rough estimates)
     */
    function estimateGasNeeded() external view returns (uint32) {
        uint256 baseGas = 100000;
        uint256 perPlayerGas = 50000;
        uint256 totalGas = baseGas + (s_totalplayerCount * perPlayerGas);
        return uint32(totalGas);
    }

    /**
     * @notice Manual function to trigger request (for testing)
     */
    function manualTriggerRequest() external onlyOwner {
        _triggerChainlinkRequest();
    }

    /**
     * @notice Internal function to handle Chainlink request
     */
    function _triggerChainlinkRequest() internal {
        string[] memory args = new string[](1);
        string memory jsonString = "[";

        for (uint256 i = 0; i < s_totalplayerCount; i++) {
            uint256 value = s_PICContract.getplayerDetails(i).id;

            jsonString = string.concat(
                jsonString,
                Strings.toString(value),
                (i == s_totalplayerCount - 1) ? "]" : ","
            );
        }
        args[0] = jsonString;

        s_currentAuctionTime = block.timestamp;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source);
        req.setArgs(args);

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            s_gasLimit,
            donId
        );

        emit RequestSent(s_lastRequestId, args[0]);
        emit DebugUpkeep("Chainlink request sent", block.timestamp);
    }

    // ------------------------------------------------------------------------------------------------------
    //                                    AUTOMATION MANAGEMENT
    // ------------------------------------------------------------------------------------------------------

    /**
     * @notice Get detailed upkeep conditions for debugging
     */
    function getUpkeepConditions() external view returns (
        bool upkeepNeeded,
        bool playerCountCondition,
        bool timeCondition,
        bool unlockCondition,
        uint256 timeDiff
    ) {
        playerCountCondition = s_currentplayercount <= s_totalplayerCount;
        timeCondition = block.timestamp - s_currentAuctionTime >= s_auctionTime;
        unlockCondition = !s_unlock;
        timeDiff = block.timestamp - s_currentAuctionTime;
        
        upkeepNeeded = playerCountCondition && timeCondition && unlockCondition;
    }

    /**
     * @notice Force upkeep execution (for testing)
     */
    function forceUpkeep() external onlyOwner {
        performUpkeep("");
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          EXISTING FUNCTIONS
    // ------------------------------------------------------------------------------------------------------

    function start(address _PICAddress, uint256 _auctionStartTime) external {
        if (msg.sender != s_factoryAddress) {
            revert UnauthorizedCaller();
        }

        s_PICContract = IPIC(_PICAddress);
        s_totalplayerCount = s_PICContract.getTotalPlayers();
        s_unlock = false;
        s_currentAuctionTime = block.timestamp - s_auctionTime + _auctionStartTime;
    }

    function register() public payable {
        if (s_buyercheck[msg.sender] == true) {
            revert BuyerAlreadyRegistered();
        }

        if (s_auctionState) {
            revert AuctionIsOpen();
        }

        if (msg.value != REGISTRATION_FEE) {
            revert IncorrectRegistrationAmount();
        }
        s_DreamToken[msg.sender] = 100;
        s_buyercheck[msg.sender] = true;
        s_buyers.push(msg.sender);
        emit BuyerRegistered(msg.sender);
    }

    function bid() public {
        if (s_buyercheck[msg.sender] != true) {
            revert BidderNotRegistered();
        }

        if (!s_auctionState) {
            revert AuctionIsClosed();
        }

        if (s_DreamToken[msg.sender] < s_biddingPrice) {
            revert NotEnoughFunds();
        }
        s_DreamToken[msg.sender] -= s_biddingPrice;
        s_AuctionContract.bid(msg.sender, s_biddingPrice, s_currentplayercount);

        if (s_biddingPrice >= 10) {
            s_biddingPrice += 5;
        } else {
            s_biddingPrice += 2;
        }
    }

    function checkUpkeep(
        bytes memory /* checkData */
    ) external view returns (bool upkeepNeeded, bytes memory /* performData */) {
        if (s_currentplayercount <= s_totalplayerCount && !s_unlock) {
            upkeepNeeded = (block.timestamp - s_currentAuctionTime >= s_auctionTime);
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata /*performData*/) external {
        // Debug conditions
        bool playerCountCondition = s_currentplayercount <= s_totalplayerCount;
        bool timeCondition = block.timestamp - s_currentAuctionTime >= s_auctionTime;
        bool unlockCondition = !s_unlock;
        uint256 timeDiff = block.timestamp - s_currentAuctionTime;

        emit DebugConditions(
            playerCountCondition,
            timeCondition,
            unlockCondition,
            s_currentplayercount,
            s_totalplayerCount,
            timeDiff,
            s_unlock
        );

        if (s_currentplayercount < s_totalplayerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                !s_auctionState
            ) {
                s_auctionState = true;
                s_currentAuctionTime = block.timestamp;
                s_AuctionContract.restartAuction(s_currentplayercount);
                emit DebugUpkeep("Auction started", block.timestamp);
            } else if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                s_auctionState
            ) {
                s_auctionState = false;
                s_currentAuctionTime = block.timestamp;
                (
                    address s_highestBidder,
                    uint256 s_highestBid
                ) = s_AuctionContract.auctionEnd(s_currentplayercount);

                s_biddingPrice = 1;

                s_BuyerTransactions[s_highestBidder][
                    s_BuyerTransactionCount[s_highestBidder]
                ] = playerBought(
                    s_PICContract.getplayerDetails(s_currentplayercount),
                    s_currentplayercount,
                    s_highestBid
                );

                s_BuyerTransactionCount[s_highestBidder]++;
                s_currentplayercount++;
                emit DebugUpkeep("Auction ended, player assigned", block.timestamp);
            }
        } else if (
            s_currentplayercount == s_totalplayerCount &&
            (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
            !s_unlock
        ) {
            emit DebugUpkeep("Triggering final Chainlink request", block.timestamp);
            _triggerChainlinkRequest();
        }
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        
        s_lastResponse = response;
        s_lastError = err;
        emit RequestFulfilled(requestId);

        if (err.length > 0) {
            // Handle error case
            emit DebugUpkeep("Request failed with error", block.timestamp);
            return;
        }

        uint256[] memory playerRankings = abi.decode(response, (uint256[]));
        calculateTeamScore(playerRankings);
        s_winner = calculateWinner();
        s_unlock = true;
        s_winnerFunds[s_winner] = (7 * address(this).balance) / 10;
        s_TreasuryFunds = (3 * address(this).balance) / 10;
        
        emit DebugUpkeep("Game completed, winner determined", block.timestamp);
    }

    // ------------------------------------------------------------------------------------------------------
    //                                    DEBUGGING AND TESTING FUNCTIONS
    // ------------------------------------------------------------------------------------------------------

    /**
     * @notice Test the JavaScript source with a simple request
     */
    function testSimpleRequest() external onlyOwner {
        string[] memory args = new string[](1);
        args[0] = '["123", "456"]'; // Simple test with 2 player IDs

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source);
        req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            50000, // Lower gas limit for testing
            donId
        );

        emit RequestSent(s_lastRequestId, args[0]);
    }

    /**
     * @notice Get the last error for debugging
     */
    function getLastError() external view returns (bytes memory) {
        return s_lastError;
    }

    /**
     * @notice Get the current state for debugging
     */
    function getGameState() external view returns (
        uint256 currentPlayerCount,
        uint256 totalPlayerCount,
        uint256 currentAuctionTime,
        bool auctionState,
        bool unlockState,
        uint256 currentTime,
        uint256 timeDiff
    ) {
        return (
            s_currentplayercount,
            s_totalplayerCount,
            s_currentAuctionTime,
            s_auctionState,
            s_unlock,
            block.timestamp,
            block.timestamp - s_currentAuctionTime
        );
    }

    // ------------------------------------------------------------------------------------------------------
    //                                    EXISTING HELPER FUNCTIONS
    // ------------------------------------------------------------------------------------------------------

    function calculateTeamScore(uint256[] memory _playerRanking) internal {
        for (uint256 i = 0; i < s_buyers.length; i++) {
            address Team = s_buyers[i];
            uint256 result;
            for (uint256 j = 0; j < s_BuyerTransactionCount[Team]; j++) {
                uint256 id = s_BuyerTransactions[Team][j].tokenId;
                result += (100 - _playerRanking[id] + 1) / 10;
            }
            s_TeamScore[Team] = result;
        }
    }

    function calculateWinner() public view returns (address) {
        address maxTeam;
        uint256 maxScore;

        for (uint256 i = 0; i < s_buyers.length; i++) {
            address Team = s_buyers[i];
            uint256 result = s_TeamScore[Team];
            if (result > maxScore) {
                maxTeam = Team;
                maxScore = result;
            }
        }
        return maxTeam;
    }

    function withdrawDreamToken() public {
        uint256 amount = s_AuctionContract.withdraw(msg.sender);
        s_DreamToken[msg.sender] += amount;
    }

    function withdrawWinnerFunds() public payable checklock {
        if (msg.sender != s_winner) {
            revert SenderIsNotWinner();
        }

        uint256 amount = s_winnerFunds[msg.sender];
        s_winnerFunds[msg.sender] = 0;
        (bool success, ) = (msg.sender).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdrawTreasuryFunds() public payable checklock onlyOwner {
        uint256 amount = s_TreasuryFunds;
        s_TreasuryFunds = 0;
        (bool success, ) = (msg.sender).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function fetchPlayers(
        address _registrant
    ) public view returns (playerBought[] memory) {
        uint256 count = s_BuyerTransactionCount[_registrant];
        playerBought[] memory players = new playerBought[](count);
        for (uint256 i = 0; i < count; i++) {
            players[i] = s_BuyerTransactions[_registrant][i];
        }
        return players;
    }

    function getTeamScore(address _registrant) public view returns (uint256) {
        return s_TeamScore[_registrant];
    }

    function getBuyers() public view returns (address[] memory) {
        return s_buyers;
    }

    function getAuctionContract() public view returns (address) {
        return address(s_AuctionContract);
    }

    function getPICContract() public view returns (address) {
        return address(s_PICContract);
    }

    function contractBalances() public view returns (uint256 eth) {
        eth = address(this).balance;
    }

    function editRouterAddress(address _router) public onlyOwner {
        router = _router;
    }

    function editDonId(bytes32 _donId) public onlyOwner {
        donId = _donId;
    }

    function editFunctionsSource(string memory _source) public onlyOwner {
        s_source = _source;
    }

    function editSubscriptionId(uint64 _subscriptionId) public onlyOwner {
        s_subscriptionId = _subscriptionId;
    }

    function editGasLimit(uint32 _gasLimit) public onlyOwner {
        s_gasLimit = _gasLimit;
    }

    function stringToBytes32(
        string memory _source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(_source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(_source, 32))
        }
    }

    function addressToString(
        address _address
    ) public pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    fallback() external payable {}

    receive() external payable {}
}