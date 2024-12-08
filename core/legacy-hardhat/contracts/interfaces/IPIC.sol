// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./IPlayer.sol";

interface IPIC {
    function getplayerDetails(
        uint256 tokenId
    ) external view returns (IPlayer.PlayerQuery memory);

    function getTotalPlayers() external view returns (uint256);
}
