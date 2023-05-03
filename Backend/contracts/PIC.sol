// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PIC is Ownable{

    struct Player{
        string imageURI;
        string role;
        uint256 id;
    }
    uint256 private s_tokenCounter;
    Player[] s_PlayerStorage;

    event PlayerCreated(uint256 indexed tokenId);
    event PlayerUpdated(uint256 indexed tokenId);

    constructor(){
        s_tokenCounter = 0;
    }

    function mintPlayer(string memory _imageURI, string memory _role, uint256 _id) public onlyOwner{
        s_tokenCounter += 1;
        Player memory NewPlayer;
        NewPlayer.imageURI = _imageURI;
        NewPlayer.role = _role;
        NewPlayer.id = _id;
        s_PlayerStorage.push(NewPlayer);
        emit PlayerCreated(s_tokenCounter);
    }

    function updatetokenURI(uint256 tokenId, string memory _imageURI) public onlyOwner{
        s_PlayerStorage[tokenId].imageURI = _imageURI;
        emit PlayerUpdated(tokenId);
    }

    function imageURI(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return s_PlayerStorage[tokenId].imageURI;
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter;
    }
    
}