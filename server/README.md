#### IdentityNft.sol
* Soulbound NFT(erc721) contract.
* Mint NFTs that is used in the [Marketplace](./contracts/Marketplace.sol) contract.
* Only the owner can mint these NFTs
* [0xaA32999E6B92e5eC3cE70775fd8DFFB385555726](https://mumbai.polygonscan.com/address/0xaA32999E6B92e5eC3cE70775fd8DFFB385555726)

---

#### AuctionHouse.sol
* Contains the complete auction logic which includes bid, withdraw and declaring the winner.
* Usually interacted by [Marketplace](./contracts/Marketplace.sol) contract.
* After the auction ends the highest bid amount is transferred to [Marketplace](./contracts/Marketplace.sol) contract.
* [0x4357AA183961CF8473EC5F09f053DaA21f237b4f](https://mumbai.polygonscan.com/address/0x4357AA183961CF8473EC5F09f053DaA21f237b4f)

---

#### Marketplace.sol
* Users can register themselves as buyers after which they can bid for players.
* All the players that have been minted by the IdentityNft contract will be auctioned.
* Checkupkeep is used to start and end the auction by chainlink keepers.
* After all players have been auctioned chainlink oracle sends a request to an external adapter which returns the player data.
* This data is used to find out the winner.
* The winner prize pool is 70% of the total funds collected by the contract during the auction phase.
* [0xeF32743BA20dd5CB89Fdacfaa7fB69187cA51918](https://mumbai.polygonscan.com/address/0xeF32743BA20dd5CB89Fdacfaa7fB69187cA51918)

---

##### [Click here](./contributing.md) for contributing guidelines.