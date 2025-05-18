// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "./Auction.sol";
import "./interfaces/IPIC.sol";

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
    mapping(address => mapping(uint256 => playerBought))
        private s_BuyerTransactions;
    mapping(address => uint256) public s_BuyerTransactionCount;
    mapping(address => uint256) private s_TeamScore;
    mapping(address => uint256) public s_winnerFunds;
    mapping(address => uint256) public s_DreamToken;

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
        // address _link,
        string memory _source,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) FunctionsClient(_router) Ownable(msg.sender) {
        s_AuctionContract = new Auction();
        s_auctionTime = _time;
        s_auctionState = false;
        s_factoryAddress = _factoryAddress;

        // if (_link == address(0)) {
        //     setPublicChainlinkToken();
        // } else {
        //     setChainlinkToken(_link);
        // }

        router = _router;
        donId = _donId;
        s_source = _source;
        s_subscriptionId = _subscriptionId;
        s_gasLimit = _gasLimit;
        // fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    /**
     * @notice state change before starting games.
     * @param _PICAddress PIC contract address
     */

    function start(address _PICAddress, uint256 _auctionStartTime) external {
        if (msg.sender != s_factoryAddress) {
            revert UnauthorizedCaller();
        }

        s_PICContract = IPIC(_PICAddress);
        s_totalplayerCount = s_PICContract.getTotalPlayers();
        s_unlock = false;
        s_currentAuctionTime =
            block.timestamp -
            s_auctionTime +
            _auctionStartTime;
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          USER INTERFACE
    // ------------------------------------------------------------------------------------------------------

    /**
     * @notice register any team to participate in the auction
     */

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

    /**
     * @notice registered teams can bid for the player whose auction is currently going on
     */

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
        if (s_currentplayercount < s_totalplayerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                !s_auctionState
            ) {
                s_auctionState = true;
                s_currentAuctionTime = block.timestamp;
                s_AuctionContract.restartAuction(s_currentplayercount);
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
            }
        } else if (
            s_currentplayercount == s_totalplayerCount &&
            (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
            !s_unlock
        ) {
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
            req.initializeRequestForInlineJavaScript(s_source); // Initialize the request with JS code
            req.setArgs(args);

            // Send the request and store the request ID
            s_lastRequestId = _sendRequest(
                req.encodeCBOR(),
                s_subscriptionId,
                s_gasLimit,
                donId
            );
        }
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        emit RequestFulfilled(requestId);

        calculateTeamScore(abi.decode(response, (uint256[])));
        s_winner = calculateWinner();
        s_unlock = true;
        s_winnerFunds[s_winner] = (7 * address(this).balance) / 10;
        s_TreasuryFunds = (3 * address(this).balance) / 10;
    }

    /**
     * @return address of the chainlink token used
     */

    // function getChainlinkToken() external view returns (address) {
    //     return chainlinkTokenAddress();
    // }

    /**
     * @notice transfers link to the caller wallet
     */

    // function withdrawLink() external onlyOwner {
    //     LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    //     require(
    //         link.transfer(msg.sender, link.balanceOf(address(this))),
    //         "Unable to transfer Link"
    //     );
    // }

    /**
     * @notice converts string to bytes32
     * @param _source string which is to be converted to bytes32
     * @return result bytes32 value
     */

    function stringToBytes32(
        string memory _source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(_source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
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

    function editdonId(uint32 _gasLimit) public onlyOwner {
        s_gasLimit = _gasLimit;
    }

    // ------------------------------------------------------------------------------------------------------
    //                                          RESULT CALCULATOR AND WITHDRAWLS
    // ------------------------------------------------------------------------------------------------------

    /**
     * @notice records team score using the ranking of each player
     * @param _playerRanking array of player rankings recieved by chainlink api call
     */

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

    // ------------------------------------------------------------------------------------------------------
    //                                          STATE VARIABLES
    // ------------------------------------------------------------------------------------------------------

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

        // LinkTokenInterface linkContract = LinkTokenInterface(
        //     chainlinkTokenAddress()
        // );
        // link = linkContract.balanceOf(address(this));
    }

    fallback() external payable {}

    receive() external payable {}
}
