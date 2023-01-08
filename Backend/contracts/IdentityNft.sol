// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract IdentityNft is ERC721URIStorage, Ownable{

    uint256 private s_tokenCounter;

    event nftminted(uint256 indexed tokenId);
    event nftupdated(uint256 indexed tokenId);
    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);


    constructor() ERC721("Player Identity Card", "PIC"){
        s_tokenCounter = 0;
    }

    function mintNft(string memory tokenUri) public onlyOwner{
        _safeMint(msg.sender, s_tokenCounter);
        _setTokenURI(s_tokenCounter, tokenUri);
        s_tokenCounter += 1;
        emit nftminted(s_tokenCounter);
    }

    function burn(uint256 tokenId) external onlyOwner{
        _burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256) pure override internal {
        require(from == address(0) || to == address(0), "Not allowed to transfer token");
    }

    function _afterTokenTransfer(address from, address to, uint256 tokenId) override internal {

        if (from == address(0)) {
            emit Attest(to, tokenId);
        } else if (to == address(0)) {
            emit Revoke(to, tokenId);
        }
    }

    function transferFrom(address from, address to, uint256 tokenId) public override{
        super.transferFrom(from, to, tokenId);
    }

    function updatetokenURI(uint256 tokenId, string memory tokenUri) public{
        _setTokenURI(tokenId, tokenUri);
        emit nftupdated(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
    
}